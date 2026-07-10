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
})();
