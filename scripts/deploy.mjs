#!/usr/bin/env node
/**
 * aiwall.com deploy pipeline — S3 + CloudFront + ACM + Route53.
 * Follows the VL-Cloud tooling conventions: aws CLI (v2) via spawnSync,
 * DRY-RUN BY DEFAULT for provisioning, idempotent (existing pieces are
 * skipped), and NEW resources only — this script never touches any
 * existing bucket, distribution, or zone that it did not create.
 *
 * Usage:
 *   node scripts/deploy.mjs status               # read-only: where does every piece stand
 *   node scripts/deploy.mjs provision            # dry run — print the ordered plan
 *   node scripts/deploy.mjs provision --apply    # create bucket/zone/cert/distribution (idempotent)
 *   node scripts/deploy.mjs sync                 # upload site files + CloudFront invalidation
 *   node scripts/deploy.mjs verify               # poll https://aiwall.com + www until they serve our content
 *
 * Provisioning order (re-run until complete; each run picks up where it left off):
 *   1. S3 bucket (private, Block Public Access)      us-west-2
 *   2. Route53 hosted zone for aiwall.com            (registrar stays GoDaddy;
 *      switch nameservers with scripts/godaddy-ns.mjs after this step)
 *   3. ACM certificate aiwall.com + www.aiwall.com   us-east-1 (CloudFront requirement)
 *   4. Cert DNS-validation CNAMEs into the zone      (UPSERT, idempotent)
 *   5. [wait: cert ISSUED — requires nameservers to point at the zone]
 *   6. CloudFront distribution (OAC, aliases, HTTPS-only)
 *   7. Bucket policy: CloudFront OAC read-only
 *   8. Route53 ALIAS A/AAAA for apex + www -> distribution
 *
 * AWS credentials: the default CLI profile (same account VL-Cloud manages,
 * 049475639320). No secrets live in this file or this repo.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// config — all names in one place
// ---------------------------------------------------------------------------
const DOMAIN = 'aiwall.com';
const WWW = `www.${DOMAIN}`;
const ACCOUNT = '049475639320';
const BUCKET = `aiwall-site-${ACCOUNT}`;
const BUCKET_REGION = 'us-west-2';
const CERT_REGION = 'us-east-1'; // ACM certs for CloudFront must be us-east-1
const OAC_NAME = `${BUCKET}-oac`;
const CF_HOSTED_ZONE = 'Z2FDTNDATAQYW2'; // CloudFront's fixed Route53 alias zone id
const CALLER_REF_PREFIX = 'aiwall-site';
const ROOT = fileURLToPath(new URL('..', import.meta.url));

const SITE_FILES = ['index.html', 'integrations.html', 'get-started.html', '404.html', 'robots.txt', 'sitemap.xml'];
const SITE_DIRS = ['assets'];
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// ---------------------------------------------------------------------------
// aws CLI runner (VL-Cloud pattern: spawnSync, proxy vars stripped, never throws)
// ---------------------------------------------------------------------------
function awsCli(args, { region = null, input = null } = {}) {
  const env = { ...process.env };
  for (const k of ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY']) delete env[k];
  const full = [...args, '--output', 'json', '--no-cli-pager'];
  if (region) full.push('--region', region);
  const res = spawnSync('aws', full, { env, encoding: 'utf8', input: input ?? undefined, maxBuffer: 64 * 1024 * 1024, timeout: 300_000 });
  if (res.error) return { ok: false, err: res.error.message };
  if (res.status !== 0) return { ok: false, err: (res.stderr || '').trim().slice(0, 800) };
  let data = null;
  if (res.stdout && res.stdout.trim()) { try { data = JSON.parse(res.stdout); } catch { data = res.stdout.trim(); } }
  return { ok: true, data };
}
const die = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

// ---------------------------------------------------------------------------
// read-only state discovery
// ---------------------------------------------------------------------------
function discover() {
  const state = {};

  const who = awsCli(['sts', 'get-caller-identity']);
  if (!who.ok) die(`AWS auth failed — ${who.err}\nFix credentials (default profile) and re-run.`);
  if (who.data.Account !== ACCOUNT) die(`wrong AWS account: ${who.data.Account} (expected ${ACCOUNT})`);
  state.identity = who.data.Arn;

  const head = awsCli(['s3api', 'head-bucket', '--bucket', BUCKET], { region: BUCKET_REGION });
  state.bucket = head.ok;

  const zones = awsCli(['route53', 'list-hosted-zones-by-name', '--dns-name', DOMAIN, '--max-items', '1']);
  const z = zones.ok ? (zones.data.HostedZones || []).find((h) => h.Name === `${DOMAIN}.`) : null;
  state.zoneId = z ? z.Id.replace('/hostedzone/', '') : null;
  if (state.zoneId) {
    const ns = awsCli(['route53', 'get-hosted-zone', '--id', state.zoneId]);
    state.zoneNS = ns.ok ? ns.data.DelegationSet.NameServers : [];
  }

  const certs = awsCli(['acm', 'list-certificates', '--includes', 'keyTypes=RSA_2048,EC_prime256v1'], { region: CERT_REGION });
  const cert = certs.ok ? (certs.data.CertificateSummaryList || []).find((c) => c.DomainName === DOMAIN) : null;
  state.certArn = cert ? cert.CertificateArn : null;
  if (state.certArn) {
    const d = awsCli(['acm', 'describe-certificate', '--certificate-arn', state.certArn], { region: CERT_REGION });
    if (d.ok) {
      state.certStatus = d.data.Certificate.Status;
      state.certValidation = (d.data.Certificate.DomainValidationOptions || [])
        .map((v) => ({ domain: v.DomainName, record: v.ResourceRecord, status: v.ValidationStatus }));
    }
  }

  const oacs = awsCli(['cloudfront', 'list-origin-access-controls']);
  const oac = oacs.ok ? (oacs.data.OriginAccessControlList?.Items || []).find((o) => o.Name === OAC_NAME) : null;
  state.oacId = oac ? oac.Id : null;

  const dists = awsCli(['cloudfront', 'list-distributions']);
  const dist = dists.ok
    ? (dists.data.DistributionList?.Items || []).find((d) => (d.Aliases?.Items || []).includes(DOMAIN))
    : null;
  state.distId = dist ? dist.Id : null;
  state.distDomain = dist ? dist.DomainName : null;
  state.distStatus = dist ? dist.Status : null;

  if (state.zoneId) {
    const recs = awsCli(['route53', 'list-resource-record-sets', '--hosted-zone-id', state.zoneId]);
    const items = recs.ok ? recs.data.ResourceRecordSets : [];
    state.apexAlias = items.some((r) => r.Name === `${DOMAIN}.` && r.Type === 'A' && r.AliasTarget);
    state.wwwAlias = items.some((r) => r.Name === `${WWW}.` && r.Type === 'A' && r.AliasTarget);
  }
  return state;
}

// ---------------------------------------------------------------------------
// provisioning steps — each { desc, exists, run() }
// ---------------------------------------------------------------------------
function planSteps(state) {
  const steps = [];

  steps.push({
    desc: `S3 bucket ${BUCKET} (private, ${BUCKET_REGION})`,
    exists: state.bucket,
    run() {
      let r = awsCli(['s3api', 'create-bucket', '--bucket', BUCKET,
        '--create-bucket-configuration', `LocationConstraint=${BUCKET_REGION}`], { region: BUCKET_REGION });
      if (!r.ok) return r;
      r = awsCli(['s3api', 'put-public-access-block', '--bucket', BUCKET, '--public-access-block-configuration',
        'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'], { region: BUCKET_REGION });
      return r;
    },
  });

  steps.push({
    desc: `Route53 hosted zone ${DOMAIN}`,
    exists: !!state.zoneId,
    run() {
      const r = awsCli(['route53', 'create-hosted-zone', '--name', DOMAIN,
        '--caller-reference', `${CALLER_REF_PREFIX}-zone-${Date.now()}`,
        '--hosted-zone-config', `Comment=aiwall.com site (Matrix by AIWall),PrivateZone=false`]);
      if (r.ok) {
        state.zoneId = r.data.HostedZone.Id.replace('/hostedzone/', '');
        state.zoneNS = r.data.DelegationSet.NameServers;
      }
      return r;
    },
  });

  steps.push({
    desc: `ACM certificate ${DOMAIN} + ${WWW} (${CERT_REGION}, DNS validation)`,
    exists: !!state.certArn,
    run() {
      const r = awsCli(['acm', 'request-certificate', '--domain-name', DOMAIN,
        '--subject-alternative-names', WWW, '--validation-method', 'DNS',
        '--idempotency-token', 'aiwallsite'], { region: CERT_REGION });
      if (r.ok) state.certArn = r.data.CertificateArn;
      return r;
    },
  });

  steps.push({
    desc: 'cert DNS-validation CNAMEs -> hosted zone (UPSERT)',
    exists: state.certStatus === 'ISSUED',
    run() {
      if (!state.zoneId || !state.certArn) return { ok: false, err: 'zone or cert missing — re-run provision' };
      // validation records can lag right after request-certificate; poll briefly
      let validation = null;
      for (let i = 0; i < 12; i++) {
        const d = awsCli(['acm', 'describe-certificate', '--certificate-arn', state.certArn], { region: CERT_REGION });
        if (!d.ok) return d;
        state.certStatus = d.data.Certificate.Status;
        const opts = d.data.Certificate.DomainValidationOptions || [];
        if (opts.length && opts.every((v) => v.ResourceRecord)) { validation = opts; break; }
        spawnSync('sleep', ['5']);
      }
      if (!validation) return { ok: false, err: 'ACM has not published validation records yet — re-run provision in a minute' };
      const changes = [];
      const seen = new Set();
      for (const v of validation) {
        if (seen.has(v.ResourceRecord.Name)) continue;
        seen.add(v.ResourceRecord.Name);
        changes.push({
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: v.ResourceRecord.Name, Type: v.ResourceRecord.Type, TTL: 300,
            ResourceRecords: [{ Value: v.ResourceRecord.Value }],
          },
        });
      }
      return awsCli(['route53', 'change-resource-record-sets', '--hosted-zone-id', state.zoneId,
        '--change-batch', JSON.stringify({ Comment: 'ACM validation for aiwall.com', Changes: changes })]);
    },
  });

  steps.push({
    desc: `CloudFront origin access control ${OAC_NAME}`,
    exists: !!state.oacId,
    run() {
      const r = awsCli(['cloudfront', 'create-origin-access-control', '--origin-access-control-config',
        JSON.stringify({ Name: OAC_NAME, Description: 'aiwall.com site bucket access', SigningProtocol: 'sigv4', SigningBehavior: 'always', OriginAccessControlOriginType: 's3' })]);
      if (r.ok) state.oacId = r.data.OriginAccessControl.Id;
      return r;
    },
  });

  steps.push({
    desc: `CloudFront distribution (aliases ${DOMAIN}, ${WWW}) — requires cert ISSUED`,
    exists: !!state.distId,
    run() {
      if (state.certStatus !== 'ISSUED') {
        return { ok: false, err: `cert is ${state.certStatus ?? 'missing'} — nameservers must point at the Route53 zone (scripts/godaddy-ns.mjs), then ACM validates (usually minutes). Re-run provision --apply.` };
      }
      if (!state.oacId) return { ok: false, err: 'OAC missing' };
      const config = {
        CallerReference: `${CALLER_REF_PREFIX}-dist-${Date.now()}`,
        Comment: 'aiwall.com — Matrix by AIWall site',
        Enabled: true,
        DefaultRootObject: 'index.html',
        HttpVersion: 'http2and3',
        IsIPV6Enabled: true,
        PriceClass: 'PriceClass_All',
        Aliases: { Quantity: 2, Items: [DOMAIN, WWW] },
        ViewerCertificate: {
          ACMCertificateArn: state.certArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021',
        },
        Origins: {
          Quantity: 1,
          Items: [{
            Id: 's3-site',
            DomainName: `${BUCKET}.s3.${BUCKET_REGION}.amazonaws.com`,
            OriginAccessControlId: state.oacId,
            S3OriginConfig: { OriginAccessIdentity: '' },
          }],
        },
        DefaultCacheBehavior: {
          TargetOriginId: 's3-site',
          ViewerProtocolPolicy: 'redirect-to-https',
          Compress: true,
          CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // Managed-CachingOptimized
          AllowedMethods: { Quantity: 2, Items: ['GET', 'HEAD'], CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] } },
        },
        CustomErrorResponses: {
          Quantity: 2,
          Items: [
            { ErrorCode: 403, ResponsePagePath: '/404.html', ResponseCode: '404', ErrorCachingMinTTL: 60 },
            { ErrorCode: 404, ResponsePagePath: '/404.html', ResponseCode: '404', ErrorCachingMinTTL: 60 },
          ],
        },
      };
      const r = awsCli(['cloudfront', 'create-distribution', '--distribution-config', JSON.stringify(config)]);
      if (r.ok) { state.distId = r.data.Distribution.Id; state.distDomain = r.data.Distribution.DomainName; }
      return r;
    },
  });

  steps.push({
    desc: 'bucket policy: CloudFront OAC read-only',
    exists: false, // cheap to re-assert; UPSERT semantics
    run() {
      if (!state.distId) return { ok: false, err: 'distribution missing' };
      const policy = {
        Version: '2012-10-17',
        Statement: [{
          Sid: 'AllowCloudFrontOAC',
          Effect: 'Allow',
          Principal: { Service: 'cloudfront.amazonaws.com' },
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET}/*`,
          Condition: { StringEquals: { 'AWS:SourceArn': `arn:aws:cloudfront::${ACCOUNT}:distribution/${state.distId}` } },
        }],
      };
      return awsCli(['s3api', 'put-bucket-policy', '--bucket', BUCKET, '--policy', JSON.stringify(policy)], { region: BUCKET_REGION });
    },
  });

  steps.push({
    desc: `Route53 ALIAS A/AAAA: ${DOMAIN} + ${WWW} -> distribution`,
    exists: !!(state.apexAlias && state.wwwAlias),
    run() {
      if (!state.zoneId || !state.distDomain) return { ok: false, err: 'zone or distribution missing' };
      const alias = { HostedZoneId: CF_HOSTED_ZONE, DNSName: state.distDomain, EvaluateTargetHealth: false };
      const changes = [];
      for (const name of [DOMAIN, WWW]) {
        for (const type of ['A', 'AAAA']) {
          changes.push({ Action: 'UPSERT', ResourceRecordSet: { Name: `${name}.`, Type: type, AliasTarget: alias } });
        }
      }
      return awsCli(['route53', 'change-resource-record-sets', '--hosted-zone-id', state.zoneId,
        '--change-batch', JSON.stringify({ Comment: 'aiwall.com -> CloudFront', Changes: changes })]);
    },
  });

  return steps;
}

// ---------------------------------------------------------------------------
// commands
// ---------------------------------------------------------------------------
function cmdStatus() {
  const s = discover();
  console.log(`identity      ${s.identity}`);
  console.log(`bucket        ${s.bucket ? BUCKET : '— missing'}`);
  console.log(`hosted zone   ${s.zoneId ?? '— missing'}${s.zoneNS ? `  NS: ${s.zoneNS.join(', ')}` : ''}`);
  console.log(`certificate   ${s.certArn ?? '— missing'}${s.certStatus ? `  [${s.certStatus}]` : ''}`);
  console.log(`oac           ${s.oacId ?? '— missing'}`);
  console.log(`distribution  ${s.distId ?? '— missing'}${s.distDomain ? `  ${s.distDomain} [${s.distStatus}]` : ''}`);
  console.log(`dns aliases   apex:${s.apexAlias ? 'yes' : 'no'} www:${s.wwwAlias ? 'yes' : 'no'}`);
}

function cmdProvision(apply) {
  const state = discover();
  const steps = planSteps(state);
  console.log(`aiwall.com provisioning — ${apply ? 'APPLY' : 'DRY RUN (no changes)'}\n`);
  let failed = 0, ran = 0, skipped = 0;
  steps.forEach((step, i) => {
    const n = String(i + 1).padStart(2);
    if (step.exists) {
      console.log(`${n}. [exists, skip] ${step.desc}`);
      skipped++;
      return;
    }
    if (!apply) {
      console.log(`${n}. [would run]    ${step.desc}`);
      return;
    }
    if (failed) { console.log(`${n}. [blocked]      ${step.desc}`); return; }
    const r = step.run();
    if (r.ok) { console.log(`${n}. [done]         ${step.desc}`); ran++; }
    else { console.log(`${n}. [FAILED]       ${step.desc}\n      ${r.err}`); failed++; }
  });
  if (!apply) { console.log('\nDry run complete — re-run with --apply to provision.'); return; }
  console.log(`\napply: ${ran} ran, ${skipped} skipped, ${failed} failed`);
  if (state.zoneNS?.length) {
    console.log(`\nRoute53 nameservers (GoDaddy must delegate to these — scripts/godaddy-ns.mjs):`);
    for (const ns of state.zoneNS) console.log(`  ${ns}`);
  }
  if (state.distDomain) console.log(`\ndistribution: https://${state.distDomain}/`);
  process.exit(failed ? 1 : 0);
}

function collectFiles() {
  const files = [];
  for (const f of SITE_FILES) files.push(f);
  const walk = (dir) => {
    for (const entry of readdirSync(join(ROOT, dir))) {
      const rel = join(dir, entry);
      if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
      else files.push(rel);
    }
  };
  for (const d of SITE_DIRS) walk(d);
  return files;
}

function cmdSync() {
  const state = discover();
  if (!state.bucket) die('bucket missing — run provision first');
  const files = collectFiles();
  let failed = 0;
  for (const rel of files) {
    const ext = extname(rel).toLowerCase();
    const ct = CONTENT_TYPES[ext];
    if (!ct) { console.log(`skip (unknown type): ${rel}`); continue; }
    const cache = ext === '.html' || rel === 'robots.txt' || rel === 'sitemap.xml'
      ? 'public, max-age=300'
      : 'public, max-age=86400';
    const key = rel.split('/').join('/');
    const r = awsCli(['s3api', 'put-object', '--bucket', BUCKET, '--key', key,
      '--body', join(ROOT, rel), '--content-type', ct, '--cache-control', cache], { region: BUCKET_REGION });
    console.log(`${r.ok ? 'up' : 'FAILED'}  ${key}  (${ct})`);
    if (!r.ok) { console.log(`      ${r.err}`); failed++; }
  }
  if (state.distId) {
    const r = awsCli(['cloudfront', 'create-invalidation', '--distribution-id', state.distId, '--paths', '/*']);
    console.log(r.ok ? `invalidation created on ${state.distId}` : `invalidation FAILED: ${r.err}`);
    if (!r.ok) failed++;
  } else {
    console.log('no distribution yet — skipped invalidation');
  }
  process.exit(failed ? 1 : 0);
}

function cmdVerify() {
  const marker = 'Intelligence Routing';
  const urls = [`https://${DOMAIN}/`, `https://${WWW}/`];
  const state = discover();
  if (state.distDomain) urls.push(`https://${state.distDomain}/`);
  for (const url of urls) {
    const res = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20', url], { encoding: 'utf8' });
    const code = (res.stdout || '').trim();
    let hasContent = false;
    if (code === '200') {
      const body = spawnSync('curl', ['-s', '--max-time', '20', url], { encoding: 'utf8' });
      hasContent = (body.stdout || '').includes(marker);
    }
    console.log(`${url}  ->  HTTP ${code || 'n/a'}${code === '200' ? (hasContent ? ' (our content)' : ' (UNEXPECTED content)') : ''}`);
  }
}

// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const cmd = argv[0];
const apply = argv.includes('--apply');
if (cmd === 'status') cmdStatus();
else if (cmd === 'provision') cmdProvision(apply);
else if (cmd === 'sync') cmdSync();
else if (cmd === 'verify') cmdVerify();
else {
  console.log('usage: node scripts/deploy.mjs <status|provision [--apply]|sync|verify>');
  process.exit(cmd ? 2 : 0);
}
