// AIWall / Matrix — site behavior. Zero dependencies.
(() => {
  // mobile drawer
  const btn = document.getElementById('menuBtn');
  const drawer = document.getElementById('drawer');
  if (btn && drawer) {
    btn.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    drawer.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') drawer.classList.remove('open');
    });
  }

  // reveal on scroll
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  // copy buttons — any .codeblock with a .copy-btn copies its <pre> text
  document.querySelectorAll('.codeblock .copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pre = btn.closest('.codeblock').querySelector('pre');
      if (!pre) return;
      const text = pre.textContent.trim();
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch { /* fall through */ }
      if (!ok) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove();
      }
      const prev = btn.textContent;
      btn.textContent = ok ? 'copied ✓' : 'select + ⌘C';
      btn.classList.toggle('copied', ok);
      setTimeout(() => { btn.textContent = prev; btn.classList.remove('copied'); }, 1600);
    });
  });

  // downloads page: fill version + sha256 values from the mirrored release
  // metadata itself (nothing hardcoded in the page).
  const needsMeta = document.querySelector('[data-latest-version], [data-sha-for]');
  if (needsMeta) {
    const base = '/downloads/matrix/stable';
    fetch(`${base}/latest.json`).then((r) => r.json()).then((meta) => {
      document.querySelectorAll('[data-latest-version]').forEach((el) => { el.textContent = meta.version || '—'; });
    }).catch(() => {});
    fetch(`${base}/SHA256SUMS.txt`).then((r) => r.text()).then((txt) => {
      const sums = {};
      txt.split('\n').forEach((line) => {
        const m = line.trim().match(/^([0-9a-f]{64})\s+(.+)$/);
        if (m) sums[m[2]] = m[1];
      });
      document.querySelectorAll('[data-sha-for]').forEach((el) => {
        const s = sums[el.getAttribute('data-sha-for')];
        if (s) el.textContent = s;
      });
    }).catch(() => {});
  }
})();
