// AIWall / Matrix — bilingual (EN / 中文) dictionary + runtime. Zero dependencies.
//
// How it works
//   * Every translatable node carries data-i18n (textContent) or
//     data-i18n-html (innerHTML, for copy with inline markup).
//   * The English source text also lives in the markup, so the page is
//     complete without JS; the dictionary below is canonical for both langs.
//   * <body data-page="…"> namespaces the page's <title> / meta description
//     via the keys "<page>.meta.title" and "<page>.meta.desc".
//   * Adding a language = adding ONE object to DICT (e.g. DICT.ja = {…})
//     and one button per switch. No markup changes needed.
//
// Resolution order: ?lang= param > localStorage "aiwall_lang" >
// navigator.language startsWith("zh") ? zh : en.
(() => {
  const STORE = 'aiwall_lang';

  const DICT = {
    en: {
      // ---- common: nav + footer ------------------------------------------
      'common.nav.platform': 'Platform',
      'common.nav.action': 'In action',
      'common.nav.guides': 'Guides',
      'common.nav.integrations': 'Integrations',
      'common.nav.download': 'Downloads',
      'common.nav.downloadcta': 'Download Matrix ↓',
      'common.nav.join': 'Join your team',
      'common.nav.signin': 'Sign in',
      'common.footer.tag': 'Matrix routes work to the right intelligence — AI compute or human minds — and gives enterprises and teams the governance to trust what comes back.',
      'common.footer.platform': 'Platform',
      'common.footer.capabilities': 'Capabilities',
      'common.footer.downloads': 'Downloads',
      'common.footer.join': 'Join your team',
      'common.footer.guides': 'Guides',
      'common.footer.more': 'More',
      'common.footer.integrations': 'Integrations',
      'common.footer.getstarted': 'Get started',

      // ---- home ----------------------------------------------------------
      'home.meta.title': 'Matrix by AIWall — Intelligence Routing & Governance Platform',
      'home.meta.desc': 'Individuals and enterprises use Matrix to route work to the right intelligence — AI compute or human minds — with full context attached and governance you can prove.',
      'home.kicker': 'Intelligence Routing & Governance Platform',
      'home.h1': 'Route work to the right <span class="amber">intelligence</span> — AI compute or human minds.',
      'home.lede': 'One builder or a whole enterprise: hand Matrix a unit of work and it routes it to the intelligence best suited to it — full context attached, every action governed, every result provable.',
      'home.cta.download': 'Download Matrix ↓',
      'home.cta.join': 'Join your team',
      'home.meta1': '<strong>Stack-agnostic</strong> · bring your own agents, models, tools',
      'home.meta2': '<strong>Session-independent</strong> · work carries its own context',
      'home.meta3': '<strong>Governed</strong> · audit trails on every action',
      'home.shots.kicker': 'See it in action',
      'home.shots.h2': 'A world where work gets done.',
      'home.shots.lede': 'This is the real product. Post a mission on the plaza, hire AI and human workers, watch the build at the desks, and receive audited artifacts in the tower — with a dispatch console behind it all.',
      'home.shots.world.tag': 'World',
      'home.shots.world.cap': 'One world for your whole team — mission plaza, worker market, team room, repository tower.',
      'home.shots.mission.tag': 'Missions',
      'home.shots.mission.cap': 'Post a mission and a team forms — candidates line up in the worker market.',
      'home.shots.desks.tag': 'Build',
      'home.shots.desks.cap': 'AI and human workers side by side at their desks, blueprint on the wall.',
      'home.shots.delivered.tag': 'Delivered',
      'home.shots.delivered.cap': 'Mission delivered — artifacts stack up in the repository tower, fees released.',
      'home.shots.dispatch.tag': 'Governance',
      'home.shots.dispatch.cap': 'The dispatch console — task inbox, full logs, and a handoff pack for every unit of work.',
      'home.shots.enterprise.tag': 'Enterprise',
      'home.shots.enterprise.cap': 'The enterprise console — your human + AI roster, review pass rate, evidence completeness.',
      'home.plat.kicker': 'The platform',
      'home.plat.h2': 'Four capabilities. One routing fabric.',
      'home.plat.lede': 'Intelligence is the resource. Matrix is how work finds it — and how organizations stay in control of it.',
      'home.cap1.h3': 'AI compute routing',
      'home.cap1.p': 'Send each task to the model, agent, or toolchain best suited to it. Idle capacity across your accounts and machines becomes one routable pool — dispatched in parallel, never colliding on the same work.',
      'home.cap2.h3': 'Human intelligence routing',
      'home.cap2.p': 'When work needs a person — judgment, approval, expertise — Matrix routes it to the right one, with full context attached. Humans are first-class nodes on the same fabric, not an afterthought.',
      'home.cap3.h3': 'Context- & session-independent delivery',
      'home.cap3.p': "Work units carry their own context; nothing is trapped in a chat session. Hand off, resume, and audit any piece of work — anywhere, anytime, on any machine. Every record accumulates: your organization's AI work becomes an asset, not exhaust.",
      'home.cap4.h3': 'Enterprise & team governance',
      'home.cap4.p': 'Permissions, review gates, write-scope locks, audit trails, and execution ledgers for every AI and human action. The wall between "AI did something" and "we can prove what happened."',
      'home.how.kicker': 'How it works',
      'home.how.h2': 'Route → Govern → Deliver',
      'home.how.lede': 'Every unit of work moves through the same three-stage fabric — whoever, or whatever, does it.',
      'home.how.s1.h3': 'Route',
      'home.how.s1.p': "Work arrives as self-contained units with declared scope. Matrix matches each one to the best available intelligence — a model, an agent fleet, a toolchain, or a person — and dispatches in parallel where scopes don't overlap.",
      'home.how.s2.h3': 'Govern',
      'home.how.s2.p': "Every dispatch passes the governance wall: permissions checked, write scopes locked so no two workers fight over the same files, review gates enforced where you demand a human in the loop. Nothing runs that policy didn't allow.",
      'home.how.s3.h3': 'Deliver',
      'home.how.s3.p': 'Results return as auditable records — context attached, ledger written. Hand the work to the next intelligence, resume it next week, or ship it. Delivery is independent of any session, machine, or vendor.',
      'home.who.kicker': "Who it's for",
      'home.who.h2': 'Built for one person. Governed for ten thousand.',
      'home.who.lede': "The same routing fabric serves a solo builder's private fleet and an enterprise's governed workforce.",
      'home.ind.kicker': 'For individuals',
      'home.ind.h3': 'Post a mission. Hire AI workers. Watch it get built.',
      'home.ind.li1': 'Turn your accounts, machines, and agents into one private fleet',
      'home.ind.li2': 'Dispatch missions to AI workers in parallel — no collisions, no babysitting',
      'home.ind.li3': 'Every delivered artifact is yours to keep: context, logs, and history intact',
      'home.ind.cta': 'Download Matrix ↓',
      'home.ent.kicker': 'For enterprises',
      'home.ent.h3': 'A governed human + AI workforce.',
      'home.ent.li1': 'Governed dispatch: permissions, write-scope locks, and review gates on every action',
      'home.ent.li2': 'Audit logs and execution ledgers — prove what happened, not just that it happened',
      'home.ent.li3': 'Humans and AI on one roster, one board — and your data stays your asset',
      'home.ent.cta': 'Bring your team on →',
      'home.band.kicker': 'Ecosystem',
      'home.band.h2': 'Stack-agnostic by design. Bring your own agents, models, and tools.',
      'home.band.p': 'Coding agents, model providers, internal toolchains, and app platforms plug into the fabric as peers — routed and governed the same way. Nothing is locked in.',
      'home.band.cta': 'Explore integrations',
      'home.start.kicker': 'Start now',
      'home.start.h2': 'Three doors in.',
      'home.start.lede': 'Download the client, join your team in about a minute, or read the guides first.',
      'home.start.q1.kicker': 'Downloads',
      'home.start.q1.h3': 'Get the client',
      'home.start.q1.p': 'One-line installers for macOS, Linux and Windows, a standalone offline package, and checksums — all served from aiwall.com.',
      'home.start.q2.kicker': 'Join',
      'home.start.q2.h3': 'One link, one minute',
      'home.start.q2.p': "Open your team lead's invite link and sign in with your work email — done: your AI usage joins the team board. Sharing idle compute is optional, anytime — a pre-filled one-line command you copy, never type.",
      'home.start.q3.kicker': 'Guides',
      'home.start.q3.h3': 'Learn the ropes',
      'home.start.q3.p': 'Register, sign in, install, join your team, and PM basics — concise, bilingual, and complete.',

      // ---- downloads -------------------------------------------------------
      'dl.meta.title': 'Downloads — Matrix by AIWall',
      'dl.meta.desc': 'Download the Matrix client: one-line installers for macOS, Linux and Windows, a standalone offline package, and checksums — all served from aiwall.com.',
      'dl.kicker': 'Downloads',
      'dl.h1': 'Get the Matrix client.',
      'dl.lede': 'One command installs everything — a user-level runtime, the client, and a <span class="mono">matrix</span> launcher on your PATH. No admin rights, no manual configuration. All files below are served from aiwall.com.',
      'dl.pill': 'stable channel · version',
      'dl.card.mac.h3': 'macOS & Linux installer',
      'dl.card.mac.p': 'One line in any terminal — installs per-user to <span class="mono">~/.matrix</span>, no sudo.',
      'dl.card.mac.btn': 'Download install.sh ↓',
      'dl.card.win.h3': 'Windows installer',
      'dl.card.win.p': 'PowerShell installer — per-user, no admin rights needed.',
      'dl.card.win.btn': 'Download matrix.ps1 ↓',
      'dl.card.zip.h3': 'Standalone zip (offline)',
      'dl.card.zip.p': 'Everything in one zip — unzip and double-click <span class="mono">安装Matrix.command</span>. Chinese install guide included.',
      'dl.card.zip.btn': 'Download the zip ↓',
      'dl.inst.kicker': 'Install',
      'dl.inst.h2': 'One line, any machine.',
      'dl.inst.lede': 'Run the installer, and your browser opens to sign in when it finishes. If your team lead sent you an invite link, see <a href="/join.html" style="color:var(--amber-hi)">the join page</a> — joining itself needs no install.',
      'dl.inst.mac.h3': 'macOS &amp; Linux <span class="os">terminal</span>',
      'dl.inst.mac.p': 'Paste into any terminal. Installs to <span class="mono">~/.matrix</span>, no sudo, then opens your browser to sign in.',
      'dl.inst.mac.alt': 'Connecting this machine to your team? Your <strong>Me page → 我的 AI 资源</strong> has this same command fully pre-filled (token included) — copy, run, done. Nothing to type, no prompts.',
      'dl.inst.win.h3': 'Windows <span class="os">powershell</span>',
      'dl.inst.win.p': 'Run in PowerShell — the fully pre-filled version (token included) is ready to copy on your Me page → 我的 AI 资源. Installs per-user, no admin rights.',
      'dl.inst.win.alt': "Don't fill in <span class=\"mono\">&lt;code&gt;</span> by hand — sign in at the platform and copy the command fully pre-filled from your Me page → 我的 AI 资源.",
      'dl.inst.zip.h3': 'Standalone package <span class="os">offline / 双击安装</span>',
      'dl.inst.zip.p': 'Everything in one zip — the installer scripts, the client bundle, checksums, and a step-by-step install guide in Chinese. On macOS, unzip and double-click <span class="mono">安装Matrix.command</span>; a window walks you through the rest.',
      'dl.inst.zip.dl': 'Download the zip ↓',
      'dl.files.kicker': 'All files & checksums',
      'dl.files.h2': 'Everything in the stable channel.',
      'dl.files.lede': 'Byte-identical mirrors of the Matrix release artifacts. Checksums below are read live from the release\'s own <a href="/downloads/matrix/stable/SHA256SUMS.txt" style="color:var(--amber-hi)">SHA256SUMS.txt</a>.',
      'dl.files.th1': 'File',
      'dl.files.th2': 'What it is',
      'dl.files.f1': 'macOS / Linux installer (POSIX sh, user-level, no sudo)',
      'dl.files.f2': 'Windows installer (PowerShell, per-user, no admin)',
      'dl.files.f3': 'The Matrix light client itself (what the installers unpack)',
      'dl.files.f4': 'Standalone package: installers + bundle + 中文 install guide + <span class="mono">安装Matrix.command</span> (double-click installer, inside the zip)',
      'dl.files.f5': 'Current stable version + client bundle checksum (machine-readable)',
      'dl.files.f6': 'Checksum manifest for the release (also mirrored as <a href="/downloads/matrix/stable/SHA256SUMS-0.31.0.txt">SHA256SUMS-0.31.0.txt</a>)',
      'dl.files.f7': 'Full install guide, Chinese (registration → invite → install → verify)',
      'dl.note': '<strong>What talks to what — honestly.</strong> Every file on this page is self-hosted on aiwall.com and byte-identical to the Matrix release (verify with SHA256SUMS.txt). Once the installer <em>runs</em>, it connects to the Matrix platform entry to download the client bundle and complete sign-in, and fetches Node.js from <span class="mono">nodejs.org</span> only if your machine doesn\'t already have a recent one. Mirrored files are served unmodified — their contents, including the platform addresses inside the scripts, are exactly the release\'s own, so checksums stay valid.',

      // ---- join ------------------------------------------------------------
      'join.meta.title': 'Join your team — Matrix by AIWall',
      'join.meta.desc': 'Join your team on Matrix in about a minute: open your invite link, sign in, done. Sharing idle AI compute is optional, anytime.',
      'join.kicker': 'Join your team · 加入团队',
      'join.h1': 'Open the link, sign in. About a minute.',
      'join.lede': 'Your team runs on Matrix. Joining puts your AI work on the team board; sharing your idle AI compute is a separate, optional step for later — credentials never leave your machine. <span class="zh" style="margin-top:8px">团队在用 Matrix。加入 = 你的 AI 使用情况接入团队看板；共享空闲 AI 算力是之后单独的可选步骤。账号凭证只留在你自己的电脑上。</span>',
      'join.s1.h3': 'Open your invite link',
      'join.s1.p': 'Click the invite link your team lead sent you — it opens join.aiwall.com. Nothing to install, no code to type. <span class="zh">点开负责人发给你的邀请链接（会打开 join.aiwall.com）。什么都不用装，也不用输入任何码。</span>',
      'join.s2.h3': 'Sign in',
      'join.s2.p': "Register with your work email (or sign in if you already have an account) — about ten seconds. That's it: you're on the team, and your AI usage now shows on the team board. <span class=\"zh\">用工作邮箱注册（已有账号就直接登录），大约十秒。就这样——你已经在团队里了，AI 使用情况开始出现在团队看板上。</span>",
      'join.s3.h3': 'Share idle AI compute (optional, anytime)',
      'join.s3.p': 'Want your idle AI capacity to help the team pool? On your <strong>Me page → 我的 AI 资源</strong>, copy the ready-made one-line command and run it in your terminal. It comes fully pre-filled — nothing to type, no code to paste — and credentials never leave your machine. Skip it now and do it whenever. <span class="zh">想把空闲 AI 算力共享给团队？登录后在「Me 页 → 我的 AI 资源」复制那条现成的一行命令，在终端运行即可。命令已完整填好——不用手敲、不用贴码——账号凭证永远只留在你自己的电脑上。现在跳过、以后再做都行。</span>',
      'join.s3.alt': 'Prefer clicking to typing? <a href="/downloads.html" style="color:var(--amber-hi)">Download the standalone zip</a> and double-click <span class="mono">安装Matrix.command</span> instead.',
      'join.invite.h2': 'For team leads: the invite message.',
      'join.invite.p': 'Copy, paste into your team chat, and swap the placeholder for your invite link (dashboard → Members → Invite; links last 72 hours and are single-use — generate one per person). <span class="zh">给 PM / 负责人：复制下面这段发出去，把占位符换成你的邀请链接（控制台 → 成员 → 邀请；链接 72 小时有效、一人一链）。</span>',
      'join.note': '<strong>Why this matters:</strong> once the team is on Matrix, leads see real AI usage across the team, and work can be routed to idle AI capacity instead of waiting in line — with governance and audit on every action. <a href="/guides.html">Read the guides</a> for what happens after you join.',

      // ---- guides ------------------------------------------------------------
      'guides.meta.title': 'Guides — Matrix by AIWall',
      'guides.meta.desc': 'Everything you need to use Matrix: register, sign in, install the client, join your team, and run a team as a PM.',
      'guides.kicker': 'Guides · 使用指导',
      'guides.h1': "Everything you need, nothing you don't.",
      'guides.lede': 'Five short guides cover the whole journey: account, install, team, and running a team as a PM.',
      'guides.toc1': '01 · Register & sign in',
      'guides.toc2': '02 · Install the client',
      'guides.toc3': '03 · Join your team',
      'guides.toc4': '04 · PM basics',
      'guides.toc5': "05 · After you're in",
      'guides.g1.h2': '01 · Register &amp; sign in <span class="zh-title">注册与登录</span>',
      'guides.g1.p': 'Your Matrix account lives on the platform entry. One account works everywhere — the web platform, the installed client, and every machine you connect.',
      'guides.g1.li1': 'Open <a href="https://join.aiwall.com" target="_blank" rel="noopener">join.aiwall.com</a> — the Matrix platform entry.',
      'guides.g1.li2': 'Register with your <strong>work email and a password</strong> — about ten seconds. If your team lead sent you an <strong>invite link</strong>, open that instead: it signs you up and lands you in the team in one step.',
      'guides.g1.li3': 'Signing in later is the same address, same email. Your account, teams, and work history follow you to any machine.',
      'guides.g2.h2': '02 · Install the client <span class="zh-title">安装客户端</span>',
      'guides.g2.p': 'The client is what connects your machine to the fabric. One line, user-level, no admin rights — and when it finishes, your browser opens by itself to link the install to your account.',
      'guides.g2.li1': 'Run the line for your OS. It installs to your user directory — no <code>sudo</code>, no admin prompt.',
      'guides.g2.li2': 'Your browser opens to the platform — sign in (or register — see guide 01) and the machine is linked to your account. Nothing to type and no code to paste: the one-line command on your <strong>Me page → 我的 AI 资源</strong> comes fully pre-filled.',
      'guides.g2.li3': 'Done — the machine shows up under your account. Prefer clicking to typing? Get the <a href="/downloads.html">standalone zip</a> and double-click <code>安装Matrix.command</code> instead.',
      'guides.g3.h2': '03 · Join your team <span class="zh-title">加入团队</span>',
      'guides.g3.p': "Joining connects your AI work to the team board and lets your idle AI compute serve the team pool. Credentials never leave your machine — the platform schedules capacity, it doesn't hold your accounts.",
      'guides.g3.li1': 'Open the <strong>invite link</strong> your PM sent — it puts your account in the team.',
      'guides.g3.li2': "Sign in with your work email — that's it, you're in. Sharing idle AI compute is a separate, optional step for later: copy the pre-filled one-line command from your <strong>Me page → 我的 AI 资源</strong> and run it (guide 02) — nothing to type.",
      'guides.g3.li3': "That's all. Your AI usage appears on the team board, and idle capacity becomes schedulable. The full walkthrough lives at <a href=\"/join.html\">aiwall.com/join</a>.",
      'guides.g4.h2': '04 · PM basics <span class="zh-title">PM 基础</span>',
      'guides.g4.p': "As a team lead you do three things on Matrix: bring people in, see what's happening, and route work to the capacity you now have.",
      'guides.g4.li1': '<strong>Invite.</strong> Create your team on the platform, copy your invite link, and send the ready-made message from <a href="/join.html">the join page</a> to your team chat. Each person is one link and a sign-in from joined.',
      'guides.g4.li2': '<strong>See.</strong> The team board shows real AI usage across members — who is online, what capacity exists, what work went where and what came back. No more guessing how AI is actually used.',
      'guides.g4.li3': '<strong>Route.</strong> Dispatch work units to the pool. The platform matches each one to available intelligence — idle AI compute or the right person — and the governance wall enforces permissions, write-scope locks, and review gates on every action.',
      'guides.g4.li4': '<strong>Trust.</strong> Everything delivered comes back as an auditable record in the team ledger — context attached, actions provable.',
      'guides.g5.h2': "05 · After you're in <span class=\"zh-title\">加入之后</span>",
      'guides.g5.p': 'Day-to-day, Matrix stays out of your way.',
      'guides.g5.li1': 'Work with your usual AI tools — Matrix is stack-agnostic and observes usage without changing how you build.',
      'guides.g5.li2': "When your machine is idle, its AI capacity can serve the team pool; when you're working, your work comes first.",
      'guides.g5.li3': 'Everything you or the pool produces is a session-independent record — pick any piece of work up later, on any machine, with context intact.',
      'guides.g5.li4': "Something off? Copy the pre-filled command from your <strong>Me page → 我的 AI 资源</strong> and run it again — it's idempotent — or ask your PM for a fresh invite link.",

      // ---- get started -----------------------------------------------------
      'start.meta.title': 'Get started — Matrix by AIWall',
      'start.meta.desc': 'Enter the Matrix platform: the guided flow signs you in, connects your machine, and puts your capacity on the routing fabric.',
      'start.nav.enter': 'Enter the platform',
      'start.kicker': 'Get started',
      'start.h1': 'Put your first work on the fabric.',
      'start.lede': 'Matrix onboarding is a guided join flow: it signs you in, connects your machine, and makes your capacity routable — a few minutes, end to end.',
      'start.panel.h2': 'Three steps in, fully governed.',
      'start.panel.p': "Whether you're joining a team or setting up your own fleet, the flow is the same.",
      'start.step1': '<strong>Open the Matrix platform entry.</strong> The join flow runs in your browser — sign in, or accept the invite your team sent you.',
      'start.step2': '<strong>Connect your machine.</strong> The guided install sets up the Matrix client and links it to your account — no manual configuration.',
      'start.step3': '<strong>Route work.</strong> Your capacity joins the fabric. Dispatch your first work unit, watch it route, and read the delivered record.',
      'start.cta': 'Enter the Matrix platform',
      'start.note': '<strong>Where you\'re going:</strong> the Matrix platform entry lives at <span class="mono">join.aiwall.com</span> — one account for the web platform, the installed client, and every machine you connect.',

      // ---- integrations ------------------------------------------------------
      'integ.meta.title': 'Integrations — Matrix by AIWall',
      'integ.meta.desc': 'Matrix is development-stack agnostic: bring your own agents, models, and tools. Nothing is locked in.',
      'integ.kicker': 'Integrations',
      'integ.h1': 'Bring your own stack.',
      'integ.lede': 'Matrix routes and governs work across whatever you already build with. Intelligence providers plug into the fabric as peers — none of them required, all of them governed the same way.',
      'integ.grid.kicker': 'What Matrix routes to',
      'integ.grid.h2': 'Providers are peers on the fabric.',
      'integ.grid.lede': "Matrix's provider layer is deliberately agnostic. If it can do work, it can be routed to — and governed.",
      'integ.c1.kind': 'AI compute',
      'integ.c1.h3': 'Coding agents & CLIs',
      'integ.c1.p': 'The command-line coding agents your team already runs. Matrix dispatches them work units, locks their write scopes, and records everything they do.',
      'integ.c2.kind': 'AI compute',
      'integ.c2.h3': 'Models & agent fleets',
      'integ.c2.p': 'Route each task to the model or agent best suited to it. Pool capacity across accounts and machines into one governed fleet.',
      'integ.c3.kind': 'Human intelligence',
      'integ.c3.h3': 'Reviewers & experts',
      'integ.c3.p': 'People are first-class providers. Approvals, domain expertise, and judgment calls route to the right person with full context attached.',
      'integ.c4.kind': 'Tooling',
      'integ.c4.h3': 'Internal toolchains',
      'integ.c4.p': 'Your build systems, scripts, and services become routable steps — governed by the same policy wall as every AI and human action.',
      'integ.c5.kind': 'Development stack',
      'integ.c5.h3': 'Repos & workspaces',
      'integ.c5.p': 'Work units declare the repositories and paths they touch. Matrix enforces the boundary: parallel where safe, serialized where not.',
      'integ.c6.kind': 'Development stack',
      'integ.c6.h3': 'App platforms & builders',
      'integ.c6.p': 'Visual builders, flow platforms, and app runtimes integrate as routable intelligence — work moves in and out with full context attached, never locked in.',
      'integ.band.h2': 'Ready to put your stack on the fabric?',
      'integ.band.p': 'Start with the guided platform entry — connect your machines and accounts, then route your first unit of work.',
      'integ.band.cta': 'Get started',

      // ---- 404 -----------------------------------------------------------
      'nf.meta.title': 'Not found — Matrix by AIWall',
      'nf.kicker': '404 · unroutable',
      'nf.h1': "This route doesn't reach anything.",
      'nf.lede': "The page you asked for isn't on the fabric. Head back and take a known route.",
      'nf.home': 'Back to Matrix',
      'nf.downloads': 'Downloads',
      'nf.guides': 'Guides',
    },

    zh: {
      // ---- common: nav + footer ------------------------------------------
      'common.nav.platform': '平台能力',
      'common.nav.action': '产品实拍',
      'common.nav.guides': '使用指导',
      'common.nav.integrations': '集成生态',
      'common.nav.download': '下载',
      'common.nav.downloadcta': '下载 Matrix ↓',
      'common.nav.join': '加入团队',
      'common.nav.signin': '登录',
      'common.footer.tag': 'Matrix 把工作路由给最合适的智能——AI 算力或人类头脑——并让企业与团队对产出拥有可信的治理。',
      'common.footer.platform': '平台',
      'common.footer.capabilities': '平台能力',
      'common.footer.downloads': '下载',
      'common.footer.join': '加入团队',
      'common.footer.guides': '使用指导',
      'common.footer.more': '更多',
      'common.footer.integrations': '集成生态',
      'common.footer.getstarted': '快速开始',

      // ---- home ----------------------------------------------------------
      'home.meta.title': 'Matrix by AIWall — 智能路由与治理平台',
      'home.meta.desc': '个人与企业都在用 Matrix 把工作路由给最合适的智能——AI 算力或人类头脑——上下文完整随行，治理全程可证明。',
      'home.kicker': '智能路由与治理平台',
      'home.h1': '把工作路由给最合适的<span class="amber">智能</span>——AI 算力，或人类头脑。',
      'home.lede': '一个人，或一整家企业：把工作交给 Matrix，它会把每个工作单元路由到最合适的智能——上下文完整随行，每个动作都被治理，每个结果都可证明。',
      'home.cta.download': '下载 Matrix ↓',
      'home.cta.join': '加入团队',
      'home.meta1': '<strong>不绑定技术栈</strong> · 自带 agent、模型与工具',
      'home.meta2': '<strong>不依赖会话</strong> · 工作自带完整上下文',
      'home.meta3': '<strong>全程治理</strong> · 每个动作都有审计记录',
      'home.shots.kicker': '产品实拍',
      'home.shots.h2': '一个真正把活儿干完的世界。',
      'home.shots.lede': '这是真实产品画面：在任务广场发布任务，雇用 AI 与人类工人，看着工作在工位上被构建，产物经审计后入库仓库塔——背后是一套完整的调度台。',
      'home.shots.world.tag': '世界',
      'home.shots.world.cap': '整个团队共享的一个世界——任务广场、招聘大厅、团队房间、仓库塔。',
      'home.shots.mission.tag': '任务',
      'home.shots.mission.cap': '发布任务，团队即刻成型——候选工人在招聘大厅排队待命。',
      'home.shots.desks.tag': '构建',
      'home.shots.desks.cap': 'AI 与人类工人并肩坐在工位上，蓝图挂在墙上。',
      'home.shots.delivered.tag': '交付',
      'home.shots.delivered.cap': '任务交付——产物码进仓库塔，费用同步释放。',
      'home.shots.dispatch.tag': '治理',
      'home.shots.dispatch.cap': '调度台——任务收件箱、完整日志，每个工作单元都有交接包。',
      'home.shots.enterprise.tag': '企业',
      'home.shots.enterprise.cap': '企业控制台——人类 + AI 员工名册、评审通过率、证据完整度。',
      'home.plat.kicker': '平台',
      'home.plat.h2': '四项能力，一张路由网络。',
      'home.plat.lede': '智能就是资源。Matrix 让工作找到它——也让组织始终掌控它。',
      'home.cap1.h3': 'AI 算力路由',
      'home.cap1.p': '把每个任务派给最合适的模型、agent 或工具链。散落在各账号、各机器上的空闲算力汇成一个可调度的池子——并行派发，永不撞车。',
      'home.cap2.h3': '人类智能路由',
      'home.cap2.p': '当工作需要人——判断、审批、专业经验——Matrix 会把它连同完整上下文一起送到最合适的人面前。人是这张网络上的一等节点，不是事后补丁。',
      'home.cap3.h3': '不依赖上下文与会话的交付',
      'home.cap3.p': '工作单元自带上下文，不再被困在聊天会话里。任何一件工作都可以随时随地在任何机器上交接、续做、审计。记录不断沉淀：组织的 AI 工作成为资产，而不是尾气。',
      'home.cap4.h3': '企业与团队治理',
      'home.cap4.p': '权限、评审门禁、写入范围锁、审计轨迹、执行台账，覆盖每一个 AI 与人类动作。这堵墙隔开了"AI 干了点什么"和"我们能证明发生了什么"。',
      'home.how.kicker': '工作原理',
      'home.how.h2': '路由 → 治理 → 交付',
      'home.how.lede': '每个工作单元都走同一条三段式链路——无论执行者是谁、是什么。',
      'home.how.s1.h3': '路由',
      'home.how.s1.p': '工作以自包含单元的形式到达，声明好自己的范围。Matrix 为每个单元匹配当下最合适的智能——模型、agent 编队、工具链或某个人——范围不重叠就并行派发。',
      'home.how.s2.h3': '治理',
      'home.how.s2.p': '每次派发都要过治理墙：核验权限、锁定写入范围（两个工人绝不抢同一批文件）、在你要求人工把关的地方强制评审门禁。策略不允许的，一律不会运行。',
      'home.how.s3.h3': '交付',
      'home.how.s3.p': '结果以可审计记录的形式返回——上下文随行，台账落笔。可以交给下一个智能继续，可以下周再续，也可以直接发布。交付不依赖任何会话、机器或供应商。',
      'home.who.kicker': '为谁而建',
      'home.who.h2': '为一个人而建，为一万人而治。',
      'home.who.lede': '同一张路由网络，既服务独立开发者的私人编队，也支撑企业的受治理工作队伍。',
      'home.ind.kicker': '个人用户',
      'home.ind.h3': '发布任务，雇 AI 工人，看着它被建成。',
      'home.ind.li1': '把你的账号、机器和 agent 变成一支私人编队',
      'home.ind.li2': '任务并行派给 AI 工人——不撞车，也不用盯着',
      'home.ind.li3': '每份交付产物都归你：上下文、日志、历史完整保留',
      'home.ind.cta': '下载 Matrix ↓',
      'home.ent.kicker': '企业用户',
      'home.ent.h3': '一支受治理的人类 + AI 工作队伍。',
      'home.ent.li1': '受治理的派发：权限、写入范围锁、评审门禁覆盖每个动作',
      'home.ent.li2': '审计日志与执行台账——不只知道发生过，还能证明发生了什么',
      'home.ent.li3': '人类与 AI 同一名册、同一看板——数据始终是你的资产',
      'home.ent.cta': '带团队接入 →',
      'home.band.kicker': '生态',
      'home.band.h2': '天生不绑定技术栈。自带 agent、模型与工具。',
      'home.band.p': '编码 agent、模型服务、内部工具链、应用平台，都以对等身份接入这张网络——同样被路由、同样被治理。没有任何锁定。',
      'home.band.cta': '了解集成生态',
      'home.start.kicker': '现在开始',
      'home.start.h2': '三扇门，任选一扇。',
      'home.start.lede': '下载客户端、约一分钟加入团队，或先读读使用指导。',
      'home.start.q1.kicker': '下载',
      'home.start.q1.h3': '获取客户端',
      'home.start.q1.p': 'macOS、Linux、Windows 一行命令安装，另有离线独立包与校验和——全部由 aiwall.com 提供。',
      'home.start.q2.kicker': '加入',
      'home.start.q2.h3': '一个链接，一分钟',
      'home.start.q2.p': '点开负责人发来的邀请链接，用工作邮箱登录——完成，你的 AI 使用情况接入团队看板。共享空闲算力可选、随时可做：复制一条已完整填好的一行命令即可，永远不用手敲。',
      'home.start.q3.kicker': '指导',
      'home.start.q3.h3': '快速上手',
      'home.start.q3.p': '注册、登录、安装、加入团队、PM 基础——简明、双语、完整。',

      // ---- downloads -------------------------------------------------------
      'dl.meta.title': '下载 — Matrix by AIWall',
      'dl.meta.desc': '下载 Matrix 客户端：macOS、Linux、Windows 一行命令安装，另有离线独立包与校验和——全部由 aiwall.com 提供。',
      'dl.kicker': '下载',
      'dl.h1': '获取 Matrix 客户端。',
      'dl.lede': '一条命令装好一切——用户级运行时、客户端，以及 PATH 上的 <span class="mono">matrix</span> 启动器。不需要管理员权限，不需要手动配置。以下所有文件均由 aiwall.com 提供。',
      'dl.pill': '稳定通道 · 版本',
      'dl.card.mac.h3': 'macOS 和 Linux 安装器',
      'dl.card.mac.p': '任意终端里一行命令——按用户安装到 <span class="mono">~/.matrix</span>，无需 sudo。',
      'dl.card.mac.btn': '下载 install.sh ↓',
      'dl.card.win.h3': 'Windows 安装器',
      'dl.card.win.p': 'PowerShell 安装器——按用户安装，无需管理员权限。',
      'dl.card.win.btn': '下载 matrix.ps1 ↓',
      'dl.card.zip.h3': '独立压缩包（离线）',
      'dl.card.zip.p': '一个 zip 装下全部——解压后双击 <span class="mono">安装Matrix.command</span>，内附中文安装说明。',
      'dl.card.zip.btn': '下载 zip ↓',
      'dl.inst.kicker': '安装',
      'dl.inst.h2': '一行命令，任何机器。',
      'dl.inst.lede': '运行安装命令，装完浏览器会自动打开登录页。团队负责人发了邀请链接？看<a href="/join.html" style="color:var(--amber-hi)">加入团队页</a>——加入本身不需要安装。',
      'dl.inst.mac.h3': 'macOS 和 Linux <span class="os">终端</span>',
      'dl.inst.mac.p': '粘贴到任意终端。安装到 <span class="mono">~/.matrix</span>，无需 sudo，装完自动打开浏览器登录。',
      'dl.inst.mac.alt': '要把这台机器接入团队？「<strong>Me 页 → 我的 AI 资源</strong>」里有同一条命令的完整填好版（含令牌）——复制、运行、完成。不用手敲，全程免交互。',
      'dl.inst.win.h3': 'Windows <span class="os">powershell</span>',
      'dl.inst.win.p': '在 PowerShell 里运行——完整填好（含令牌）的版本在「Me 页 → 我的 AI 资源」直接复制即可。按用户安装，无需管理员权限。',
      'dl.inst.win.alt': '不用手动替换 <span class="mono">&lt;code&gt;</span>——登录平台后在「Me 页 → 我的 AI 资源」复制那条完整填好的命令即可。',
      'dl.inst.zip.h3': '独立安装包 <span class="os">离线 / 双击安装</span>',
      'dl.inst.zip.p': '一个 zip 装下全部——安装脚本、客户端包、校验和，以及一步一图的中文安装说明。macOS 上解压后双击 <span class="mono">安装Matrix.command</span>，弹出的窗口会带你走完剩下的步骤。',
      'dl.inst.zip.dl': '下载 zip ↓',
      'dl.files.kicker': '全部文件与校验和',
      'dl.files.h2': '稳定通道里的所有内容。',
      'dl.files.lede': '与 Matrix 发布产物逐字节一致的镜像。下方校验和实时读取自发布自带的 <a href="/downloads/matrix/stable/SHA256SUMS.txt" style="color:var(--amber-hi)">SHA256SUMS.txt</a>。',
      'dl.files.th1': '文件',
      'dl.files.th2': '用途',
      'dl.files.f1': 'macOS / Linux 安装器（POSIX sh，用户级，无需 sudo）',
      'dl.files.f2': 'Windows 安装器（PowerShell，按用户安装，无需管理员）',
      'dl.files.f3': 'Matrix 轻客户端本体（安装器解包的就是它）',
      'dl.files.f4': '独立安装包：安装器 + 客户端包 + 中文安装说明 + <span class="mono">安装Matrix.command</span>（双击安装器，就在 zip 里）',
      'dl.files.f5': '当前稳定版本号 + 客户端包校验和（机器可读）',
      'dl.files.f6': '本次发布的校验和清单（另有镜像 <a href="/downloads/matrix/stable/SHA256SUMS-0.31.0.txt">SHA256SUMS-0.31.0.txt</a>）',
      'dl.files.f7': '完整中文安装指南（注册 → 邀请 → 安装 → 验证）',
      'dl.note': '<strong>诚实地说清楚：谁在和谁通信。</strong>本页所有文件都托管在 aiwall.com，与 Matrix 发布产物逐字节一致（可用 SHA256SUMS.txt 验证）。安装器<em>运行</em>后会连接 Matrix 平台入口下载客户端包并完成登录；只有当你的机器缺少较新的 Node.js 时才会从 <span class="mono">nodejs.org</span> 获取。镜像文件原样提供——包括脚本内写着的平台地址在内，内容与发布方完全一致，因此校验和始终有效。',

      // ---- join ------------------------------------------------------------
      'join.meta.title': '加入团队 — Matrix by AIWall',
      'join.meta.desc': '约一分钟加入团队：点开邀请链接、登录，完成。共享空闲 AI 算力是之后的可选步骤。',
      'join.kicker': '加入团队',
      'join.h1': '点开链接，登录。大约一分钟。',
      'join.lede': '你的团队在用 Matrix。加入后，你的 AI 使用情况接入团队看板；共享空闲 AI 算力是之后单独的可选步骤——账号凭证永远只留在你自己的电脑上。',
      'join.s1.h3': '点开邀请链接',
      'join.s1.p': '点开负责人发给你的邀请链接（会打开 join.aiwall.com）。什么都不用装，也不用输入任何码。',
      'join.s2.h3': '登录',
      'join.s2.p': '用工作邮箱注册（已有账号就直接登录），大约十秒。就这样——你已经在团队里了，AI 使用情况开始出现在团队看板上。',
      'join.s3.h3': '共享空闲 AI 算力（可选，随时可做）',
      'join.s3.p': '想让空闲 AI 算力支援团队池？登录后在「Me 页 → 我的 AI 资源」复制那条现成的一行命令，在终端运行即可。命令已完整填好——不用手敲、不用贴码——账号凭证永远只留在你自己的电脑上。现在跳过、以后再做都行。',
      'join.s3.alt': '不想开终端？<a href="/downloads.html" style="color:var(--amber-hi)">下载独立压缩包</a>，双击 <span class="mono">安装Matrix.command</span> 即可。',
      'join.invite.h2': '给团队负责人：现成的邀请文案。',
      'join.invite.p': '复制、发到团队群，把占位符换成你的邀请链接（控制台 → 成员 → 邀请；链接 72 小时有效、一人一链），就完成了。',
      'join.note': '<strong>为什么值得做：</strong>团队接入 Matrix 后，负责人能看到全团队真实的 AI 使用情况，工作可以路由给空闲的 AI 算力而不是排队等人——每个动作都有治理与审计。加入之后会发生什么？<a href="/guides.html">看使用指导</a>。',

      // ---- guides ------------------------------------------------------------
      'guides.meta.title': '使用指导 — Matrix by AIWall',
      'guides.meta.desc': '用 Matrix 需要的一切：注册、登录、安装客户端、加入团队、PM 团队管理基础。',
      'guides.kicker': '使用指导',
      'guides.h1': '你需要的都在，多余的没有。',
      'guides.lede': '五篇短指导覆盖全程：账号、安装、团队，以及作为 PM 怎么管团队。',
      'guides.toc1': '01 · 注册与登录',
      'guides.toc2': '02 · 安装客户端',
      'guides.toc3': '03 · 加入团队',
      'guides.toc4': '04 · PM 基础',
      'guides.toc5': '05 · 加入之后',
      'guides.g1.h2': '01 · 注册与登录',
      'guides.g1.p': '你的 Matrix 账号放在平台入口上。一个账号处处可用——网页平台、已安装的客户端，以及你接入的每台机器。',
      'guides.g1.li1': '打开 <a href="https://join.aiwall.com" target="_blank" rel="noopener">join.aiwall.com</a>——Matrix 平台入口。',
      'guides.g1.li2': '用<strong>工作邮箱 + 密码</strong>注册，大约十秒。如果负责人发了<strong>邀请链接</strong>，直接点链接：注册和进团队一步完成。',
      'guides.g1.li3': '之后登录还是同一地址、同一邮箱。账号、团队和工作历史跟着人走，不跟机器走。',
      'guides.g2.h2': '02 · 安装客户端',
      'guides.g2.p': '客户端负责把你的机器接上这张网络。一行命令、用户级安装、无需管理员权限——装完浏览器自动打开，把这台机器关联到你的账号。',
      'guides.g2.li1': '运行对应系统的那行命令。它安装到你的用户目录——没有 <code>sudo</code>，没有管理员弹窗。',
      'guides.g2.li2': '浏览器打开平台页面——登录（或注册，见指导 01），这台机器就关联到你的账号。不用手敲、不用贴码：「<strong>Me 页 → 我的 AI 资源</strong>」里的那条一行命令是完整填好的。',
      'guides.g2.li3': '完成——机器出现在你的账号下。不想敲命令？去<a href="/downloads.html">下载页</a>拿独立压缩包，双击 <code>安装Matrix.command</code>。',
      'guides.g3.h2': '03 · 加入团队',
      'guides.g3.p': '加入后，你的 AI 工作接入团队看板，空闲 AI 算力可以支援团队池。凭证永远不离开你的机器——平台调度的是算力，不代管你的账号。',
      'guides.g3.li1': '点开 PM 发来的<strong>邀请链接</strong>——它把你的账号放进团队。',
      'guides.g3.li2': '用工作邮箱登录——就这样，你已经在团队里了。共享空闲 AI 算力是之后单独的可选步骤：在「<strong>Me 页 → 我的 AI 资源</strong>」复制那条已完整填好的一行命令运行即可（见指导 02），不用手敲任何东西。',
      'guides.g3.li3': '就这些。你的 AI 使用情况出现在团队看板上，空闲算力变得可调度。最短路径见 <a href="/join.html">aiwall.com/join</a>。',
      'guides.g4.h2': '04 · PM 基础',
      'guides.g4.p': '作为团队负责人，你在 Matrix 上做三件事：把人拉进来、看清正在发生什么、把工作路由给手里的算力。',
      'guides.g4.li1': '<strong>邀请。</strong>在平台上建团队，复制邀请链接，把 <a href="/join.html">join 页</a>的现成文案发到团队群。每个人离加入只差一个链接、一次登录。',
      'guides.g4.li2': '<strong>看见。</strong>团队看板显示成员的真实 AI 使用情况——谁在线、有多少算力、什么工作去了哪里、回来了什么。不再靠猜。',
      'guides.g4.li3': '<strong>路由。</strong>把工作单元派进池子。平台为每个单元匹配可用的智能——空闲 AI 算力或合适的人——治理墙对每个动作强制执行权限、写入范围锁与评审门禁。',
      'guides.g4.li4': '<strong>信任。</strong>所有交付都以可审计记录的形式回到团队台账——上下文随行，动作可证明。',
      'guides.g5.h2': '05 · 加入之后',
      'guides.g5.p': '日常使用中，Matrix 不会打扰你。',
      'guides.g5.li1': '照常用你的 AI 工具——Matrix 不绑定技术栈，只观测使用情况，不改变你的开发方式。',
      'guides.g5.li2': '机器空闲时，AI 算力可以支援团队池；你在用机器时，你的工作优先。',
      'guides.g5.li3': '你和池子产出的一切都是不依赖会话的记录——之后在任何机器上都能接着做，上下文完整。',
      'guides.g5.li4': '感觉不对劲？在「<strong>Me 页 → 我的 AI 资源</strong>」重新复制那条已填好的命令再跑一遍（可重复执行），或让 PM 重新发一个邀请链接。',

      // ---- get started -----------------------------------------------------
      'start.meta.title': '快速开始 — Matrix by AIWall',
      'start.meta.desc': '进入 Matrix 平台：引导式流程帮你登录、接入机器，把你的算力放上路由网络。',
      'start.nav.enter': '进入平台',
      'start.kicker': '快速开始',
      'start.h1': '把你的第一份工作放上网络。',
      'start.lede': 'Matrix 的引导式加入流程会帮你登录、接入机器、让你的算力可被调度——从头到尾只要几分钟。',
      'start.panel.h2': '三步进入，全程治理。',
      'start.panel.p': '无论是加入团队还是组建自己的编队，流程都一样。',
      'start.step1': '<strong>打开 Matrix 平台入口。</strong>加入流程在浏览器里进行——登录，或接受团队发来的邀请。',
      'start.step2': '<strong>接入你的机器。</strong>引导式安装配好 Matrix 客户端并关联到你的账号——无需手动配置。',
      'start.step3': '<strong>路由工作。</strong>你的算力加入网络。派出第一个工作单元，看它被路由，读它交付的记录。',
      'start.cta': '进入 Matrix 平台',
      'start.note': '<strong>你要去的地方：</strong>Matrix 平台入口在 <span class="mono">join.aiwall.com</span>——一个账号通用于网页平台、已安装的客户端，以及你接入的每台机器。',

      // ---- integrations ------------------------------------------------------
      'integ.meta.title': '集成生态 — Matrix by AIWall',
      'integ.meta.desc': 'Matrix 不绑定开发栈：自带 agent、模型与工具，没有任何锁定。',
      'integ.kicker': '集成生态',
      'integ.h1': '带上你自己的技术栈。',
      'integ.lede': '你已经在用什么，Matrix 就路由和治理什么。智能提供方以对等身份接入网络——一个都不强制，全部同样治理。',
      'integ.grid.kicker': 'Matrix 路由的对象',
      'integ.grid.h2': '提供方在网络上一律平等。',
      'integ.grid.lede': 'Matrix 的提供方层刻意保持中立：只要能干活，就能被路由——也就能被治理。',
      'integ.c1.kind': 'AI 算力',
      'integ.c1.h3': '编码 agent 与 CLI',
      'integ.c1.p': '团队已经在跑的命令行编码 agent。Matrix 给它们派发工作单元、锁定写入范围、记录它们做的一切。',
      'integ.c2.kind': 'AI 算力',
      'integ.c2.h3': '模型与 agent 编队',
      'integ.c2.p': '把每个任务路由给最合适的模型或 agent。跨账号、跨机器的算力汇成一支受治理的编队。',
      'integ.c3.kind': '人类智能',
      'integ.c3.h3': '评审者与专家',
      'integ.c3.p': '人是一等提供方。审批、领域经验、需要判断的决定，都会连同完整上下文路由给合适的人。',
      'integ.c4.kind': '工具',
      'integ.c4.h3': '内部工具链',
      'integ.c4.p': '你的构建系统、脚本和服务都能成为可路由的步骤——和每个 AI、人类动作一样，受同一堵策略墙治理。',
      'integ.c5.kind': '开发栈',
      'integ.c5.h3': '代码仓库与工作区',
      'integ.c5.p': '工作单元声明自己触碰的仓库与路径。Matrix 守住边界：安全就并行，不安全就串行。',
      'integ.c6.kind': '开发栈',
      'integ.c6.h3': '应用平台与构建器',
      'integ.c6.p': '可视化构建器、流程平台、应用运行时都能作为可路由的智能接入——工作带着完整上下文进出，绝不锁定。',
      'integ.band.h2': '准备好把你的技术栈放上网络了吗？',
      'integ.band.p': '从引导式平台入口开始——接入你的机器和账号，然后路由第一个工作单元。',
      'integ.band.cta': '快速开始',

      // ---- 404 -----------------------------------------------------------
      'nf.meta.title': '页面不存在 — Matrix by AIWall',
      'nf.kicker': '404 · 无法路由',
      'nf.h1': '这条路由不通向任何地方。',
      'nf.lede': '你要找的页面不在这张网络上。回去，走一条已知的路。',
      'nf.home': '回到 Matrix',
      'nf.downloads': '下载',
      'nf.guides': '使用指导',
    },
  };

  function detect() {
    try {
      const p = new URLSearchParams(location.search).get('lang');
      if (p && DICT[p]) return p;
    } catch { /* ignore */ }
    try {
      const s = localStorage.getItem(STORE);
      if (s && DICT[s]) return s;
    } catch { /* ignore */ }
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function t(lang, key) {
    const v = DICT[lang] && DICT[lang][key];
    return v != null ? v : DICT.en[key];
  }

  function apply(lang) {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = t(lang, el.getAttribute('data-i18n'));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = t(lang, el.getAttribute('data-i18n-html'));
      if (v != null) el.innerHTML = v;
    });
    const page = document.body.getAttribute('data-page');
    if (page) {
      const title = t(lang, page + '.meta.title');
      if (title) document.title = title;
      const md = document.querySelector('meta[name="description"]');
      const desc = t(lang, page + '.meta.desc');
      if (md && desc) md.setAttribute('content', desc);
    }
    document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
      const on = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  let current = detect();
  apply(current);

  function setLang(lang) {
    if (!DICT[lang] || lang === current) return;
    current = lang;
    try { localStorage.setItem(STORE, lang); } catch { /* ignore */ }
    apply(lang);
  }

  document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
  });

  // persist an explicit ?lang= choice
  try {
    const p = new URLSearchParams(location.search).get('lang');
    if (p && DICT[p]) localStorage.setItem(STORE, p);
  } catch { /* ignore */ }

  window.AIWALL_I18N = { get: () => current, set: setLang, dict: DICT };
})();
