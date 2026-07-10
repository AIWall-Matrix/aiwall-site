# aiwall.com — Matrix by AIWall

The website and platform front for **Matrix — an Intelligence Routing & Governance
Platform**. Static, zero-framework, hand-crafted, no external CDN dependencies.

Live: https://aiwall.com · https://www.aiwall.com

## Pages

| Page | What |
|---|---|
| `index.html` | Hero, the four capabilities, Route → Govern → Deliver, who it's for, dual-track ecosystem band |
| `integrations.html` | Stack-agnostic provider story; VisualLogic as the first-class integration |
| `get-started.html` | Routes users to the production Matrix platform entry (join flow) |
| `404.html` | Unroutable |

Design system lives in `assets/css/site.css` (governance graphite + signal amber,
routing motifs). Behavior in `assets/js/site.js` (drawer + reveal, vanilla, ~30 lines).

## Local preview

```bash
python3 -m http.server 8080   # from the repo root, then open http://localhost:8080
```

## Deploy

Infrastructure follows the VL-Cloud conventions (aws CLI, dry-run by default,
idempotent, new resources only). AWS account `049475639320`, default CLI profile.

```bash
node scripts/deploy.mjs status             # where does every piece stand
node scripts/deploy.mjs provision          # dry run — ordered plan
node scripts/deploy.mjs provision --apply  # bucket / zone / cert / distribution (idempotent)
node scripts/godaddy-ns.mjs check          # registrar delegation vs Route53 zone
node scripts/godaddy-ns.mjs set --yes      # point aiwall.com at the Route53 zone
node scripts/deploy.mjs sync               # upload site files + CloudFront invalidation
node scripts/deploy.mjs verify             # curl apex + www + distribution
```

Provisioning is re-runnable: the ACM certificate can only issue after the GoDaddy
nameserver delegation is live, so the usual first-time sequence is
`provision --apply` → `godaddy-ns.mjs set --yes` → wait for cert (minutes) →
`provision --apply` again → `sync`.

### Resources (created 2026-07-10)

- S3 bucket `aiwall-site-049475639320` (us-west-2, private, OAC-only)
- Route53 hosted zone `aiwall.com` — `Z0519651CISP3EMN55UN` (registrar stays GoDaddy;
  NS delegated to Route53: awsdns -60.co.uk / -12.net / -50.com / -03.org set)
- ACM certificate `aiwall.com` + `www.aiwall.com` (us-east-1, DNS-validated) —
  `arn:aws:acm:us-east-1:049475639320:certificate/7087f18d-a3e1-4193-9f14-3388bdd245a5`
- CloudFront distribution `E1TU0ZX5G45PFP` (`d1qkugwkefuqdb.cloudfront.net`), both
  aliases, HTTPS-only, http2+3, OAC `aiwall-site-049475639320-oac`
- Route53 ALIAS A/AAAA apex + www → distribution

Secrets: GoDaddy API credentials are read from the local secret store
(`~/Documents/docs/auth/SecretRoot.local.env`); nothing secret lives in this repo.

## GitHub (once the AIWall-Matrix org exists)

The founder creates the org at https://github.com/account/organizations/new
(name: `AIWall-Matrix`; the GitHub API cannot create orgs). Then:

```bash
# publish the org profile (prepared in ~/Documents/AIWall-org-profile)
gh repo create AIWall-Matrix/.github --public --source ~/Documents/AIWall-org-profile --push

# publish this site repo
cd ~/Documents/aiwall-site
gh repo create AIWall-Matrix/aiwall-site --source . --push
```

## Content red lines

No internal ports, no private repo names, no version promises in site content.
The platform entry links to the production join flow at `join.visuallogic.ai`;
when a Matrix-branded entry host exists it can re-point without content changes.
