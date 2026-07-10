#!/usr/bin/env node
/**
 * Mirror the Matrix stable distribution artifacts onto aiwall.com.
 *
 * Source:  https://file.visuallogic.ai/matrix/stable/   (the Matrix CDN)
 * Target:  s3://aiwall-site-049475639320/downloads/matrix/stable/
 *          served at https://aiwall.com/downloads/matrix/stable/
 *
 * Same conventions as deploy.mjs: aws CLI via spawnSync, default profile,
 * DRY RUN by default, idempotent, loud failures. Artifacts are fetched to a
 * temp dir, sha256-verified against the release's own SHA256SUMS.txt, then
 * uploaded byte-for-byte (no rewriting — the page is where honesty lives).
 *
 * Usage:
 *   node scripts/mirror-downloads.mjs            # dry run — fetch + verify + plan
 *   node scripts/mirror-downloads.mjs --apply    # fetch + verify + upload + invalidate
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const SOURCE = 'https://file.visuallogic.ai/matrix/stable';
const ACCOUNT = '049475639320';
const BUCKET = `aiwall-site-${ACCOUNT}`;
const BUCKET_REGION = 'us-west-2';
const PREFIX = 'downloads/matrix/stable';
const DIST_ID = 'E1TU0ZX5G45PFP';

// The stable channel has no directory index; this list is the release
// manifest (from the Matrix distribution handoff). 安装Matrix.command appears
// in SHA256SUMS.txt but is NOT a separate CDN object — it ships inside the
// standalone zip.
const ARTIFACTS = [
  // name                                   content-type                       cache-control
  ['install.sh',                            'text/x-shellscript; charset=utf-8', 'public, max-age=300'],
  ['matrix.ps1',                            'text/plain; charset=utf-8',         'public, max-age=300'],
  ['client-bundle.tar.gz',                  'application/gzip',                  'public, max-age=300'],
  ['latest.json',                           'application/json; charset=utf-8',   'public, max-age=300'],
  ['VL-Matrix-Standalone-0.31.0.zip',       'application/zip',                   'public, max-age=86400'],
  ['SHA256SUMS.txt',                        'text/plain; charset=utf-8',         'public, max-age=300'],
  ['SHA256SUMS-0.31.0.txt',                 'text/plain; charset=utf-8',         'public, max-age=300'],
  ['Matrix-Standalone-Install-0.31.0.zh.md','text/markdown; charset=utf-8',      'public, max-age=300'],
];

const apply = process.argv.includes('--apply');
const die = (msg) => { console.error(`error: ${msg}`); process.exit(1); };

function awsCli(args, { region = null } = {}) {
  const env = { ...process.env };
  for (const k of ['http_proxy', 'https_proxy', 'HTTP_PROXY', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY']) delete env[k];
  const full = [...args, '--output', 'json', '--no-cli-pager'];
  if (region) full.push('--region', region);
  const res = spawnSync('aws', full, { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 300_000 });
  if (res.error) return { ok: false, err: res.error.message };
  if (res.status !== 0) return { ok: false, err: (res.stderr || '').trim().slice(0, 800) };
  let data = null;
  if (res.stdout && res.stdout.trim()) { try { data = JSON.parse(res.stdout); } catch { data = res.stdout.trim(); } }
  return { ok: true, data };
}

function fetchTo(url, out) {
  const res = spawnSync('curl', ['-fsSL', '--retry', '2', '--max-time', '300', url, '-o', out], { encoding: 'utf8' });
  return res.status === 0;
}

function sha256(file) {
  const res = spawnSync('shasum', ['-a', '256', file], { encoding: 'utf8' });
  if (res.status !== 0) return null;
  return (res.stdout || '').trim().split(/\s+/)[0];
}

// ---------------------------------------------------------------------------
const who = awsCli(['sts', 'get-caller-identity']);
if (!who.ok) die(`AWS auth failed — ${who.err}`);
if (who.data.Account !== ACCOUNT) die(`wrong AWS account: ${who.data.Account} (expected ${ACCOUNT})`);

const work = mkdtempSync(join(tmpdir(), 'aiwall-mirror-'));
console.log(`mirror ${SOURCE}/ -> s3://${BUCKET}/${PREFIX}/  ${apply ? '(APPLY)' : '(DRY RUN)'}\n`);

// 1. fetch everything
const local = {};
for (const [name] of ARTIFACTS) {
  const out = join(work, name);
  if (!fetchTo(`${SOURCE}/${name}`, out)) die(`fetch failed: ${SOURCE}/${name}`);
  local[name] = out;
  console.log(`fetched  ${name}  (${statSync(out).size} bytes)`);
}

// 2. verify against the release's own checksum manifest
const sums = spawnSync('cat', [local['SHA256SUMS.txt']], { encoding: 'utf8' }).stdout || '';
const expected = new Map();
for (const line of sums.split('\n')) {
  const m = line.trim().match(/^([0-9a-f]{64})\s+(.+)$/);
  if (m) expected.set(m[2], m[1]);
}
let verified = 0;
for (const [name] of ARTIFACTS) {
  if (!expected.has(name)) continue; // manifests/docs are not self-listed
  const got = sha256(local[name]);
  if (got !== expected.get(name)) die(`sha256 mismatch for ${name}: got ${got}, manifest says ${expected.get(name)}`);
  verified++;
}
console.log(`\nsha256 verified against SHA256SUMS.txt: ${verified} artifacts ok\n`);

// 3. upload
let failed = 0;
for (const [name, ct, cache] of ARTIFACTS) {
  const key = `${PREFIX}/${name}`;
  if (!apply) { console.log(`would upload  ${key}  (${ct})`); continue; }
  const r = awsCli(['s3api', 'put-object', '--bucket', BUCKET, '--key', key,
    '--body', local[name], '--content-type', ct, '--cache-control', cache], { region: BUCKET_REGION });
  console.log(`${r.ok ? 'up' : 'FAILED'}  ${key}  (${ct})`);
  if (!r.ok) { console.log(`      ${r.err}`); failed++; }
}

// 4. invalidate
if (apply) {
  const r = awsCli(['cloudfront', 'create-invalidation', '--distribution-id', DIST_ID,
    '--paths', `/${PREFIX}/*`]);
  console.log(r.ok ? `\ninvalidation created on ${DIST_ID}` : `\ninvalidation FAILED: ${r.err}`);
  if (!r.ok) failed++;
} else {
  console.log('\nDry run complete — re-run with --apply to upload.');
}

rmSync(work, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
