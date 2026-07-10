#!/usr/bin/env node
/**
 * aiwall.com nameserver management (GoDaddy registrar -> Route53 zone).
 * Pattern follows visuallogic-site/tools/godaddy-dns.mjs: curl transport,
 * credentials read from the local secret store (never printed, never in git),
 * mutations refused without --yes.
 *
 * Usage:
 *   node scripts/godaddy-ns.mjs check                # domain in account? current NS? target NS?
 *   node scripts/godaddy-ns.mjs set --yes            # point aiwall.com at the Route53 zone NS
 *
 * Scope guard: this script only ever operates on aiwall.com. It cannot touch
 * visuallogic.ai or any other domain.
 */
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DOMAIN = 'aiwall.com'; // fixed on purpose — see scope guard above
const SECRET = process.env.GODADDY_SECRET_FILE || '/Users/ivx/Documents/docs/auth/SecretRoot.local.env';
const API = 'https://api.godaddy.com/v1';

function creds() {
  const env = {};
  for (const line of readFileSync(SECRET, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) env[t.slice(0, i)] = t.slice(i + 1);
  }
  if (!env.GODADDY_API_KEY || !env.GODADDY_API_SECRET) {
    console.error(`error: GODADDY_API_KEY / GODADDY_API_SECRET missing in ${SECRET}`);
    process.exit(1);
  }
  return `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`;
}

function godaddy(method, path, body = null) {
  const args = ['-s', '-w', '\n__STATUS__:%{http_code}', '-X', method,
    '-H', `Authorization: ${creds()}`, '-H', 'Accept: application/json'];
  if (body != null) args.push('-H', 'Content-Type: application/json', '-d', JSON.stringify(body));
  args.push(`${API}${path}`);
  const res = spawnSync('curl', args, { encoding: 'utf8', timeout: 60_000 });
  const out = res.stdout || '';
  const idx = out.lastIndexOf('\n__STATUS__:');
  const text = idx >= 0 ? out.slice(0, idx) : out;
  const status = idx >= 0 ? Number(out.slice(idx + 12).trim()) : 0;
  let data = null;
  if (text.trim()) { try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; } }
  return { status, data };
}

function route53TargetNS() {
  const res = spawnSync('aws', ['route53', 'list-hosted-zones-by-name', '--dns-name', DOMAIN,
    '--max-items', '1', '--output', 'json', '--no-cli-pager'], { encoding: 'utf8', timeout: 60_000 });
  if (res.status !== 0) return null;
  const zone = (JSON.parse(res.stdout).HostedZones || []).find((z) => z.Name === `${DOMAIN}.`);
  if (!zone) return null;
  const get = spawnSync('aws', ['route53', 'get-hosted-zone', '--id', zone.Id,
    '--output', 'json', '--no-cli-pager'], { encoding: 'utf8', timeout: 60_000 });
  if (get.status !== 0) return null;
  return JSON.parse(get.stdout).DelegationSet.NameServers;
}

const cmd = process.argv[2] || 'check';
const yes = process.argv.includes('--yes');

const dom = godaddy('GET', `/domains/${DOMAIN}`);
if (dom.status === 404) {
  console.error(`STOP: ${DOMAIN} is NOT in this GoDaddy account — cannot manage its nameservers.`);
  process.exit(1);
}
if (dom.status !== 200) {
  console.error(`GoDaddy API error HTTP ${dom.status}: ${JSON.stringify(dom.data).slice(0, 300)}`);
  process.exit(1);
}
const current = dom.data.nameServers || [];
const target = route53TargetNS();

console.log(`domain:      ${DOMAIN} [${dom.data.status}] expires ${dom.data.expires}`);
console.log(`current NS:  ${current.join(', ') || '(none)'}`);
console.log(`target NS:   ${target ? target.join(', ') : '(no Route53 zone yet — run deploy.mjs provision first)'}`);

if (cmd === 'check') {
  const aligned = target && target.every((ns) => current.some((c) => c.toLowerCase() === ns.toLowerCase()));
  console.log(`aligned:     ${aligned ? 'yes' : 'no'}`);
  process.exit(0);
}

if (cmd === 'set') {
  if (!target) { console.error('error: no Route53 zone to point at'); process.exit(1); }
  const aligned = target.every((ns) => current.some((c) => c.toLowerCase() === ns.toLowerCase()));
  if (aligned) { console.log('already aligned — nothing to do'); process.exit(0); }
  if (!yes) { console.error('Refusing nameserver mutation without --yes'); process.exit(1); }
  const r = godaddy('PATCH', `/domains/${DOMAIN}`, { nameServers: target });
  if (r.status >= 200 && r.status < 300) {
    console.log(`nameservers updated -> ${target.join(', ')}`);
    console.log('registry updates in minutes; resolver caches may take longer.');
  } else {
    console.error(`PATCH failed HTTP ${r.status}: ${JSON.stringify(r.data).slice(0, 400)}`);
    process.exit(1);
  }
} else if (cmd !== 'check') {
  console.log('usage: node scripts/godaddy-ns.mjs <check|set --yes>');
  process.exit(2);
}
