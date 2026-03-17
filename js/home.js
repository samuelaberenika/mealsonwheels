/**
 * MealsOnWheels — Homepage (home.js)
 */
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  const session = Auth.getSession();

  /* ── Apply auth state to page ─────────────────────────── */
  if (session) {
    document.body.classList.add('is-logged-in');
    Auth.populateNav();
  }

  // Show/hide nav items based on role
  const adminLinks = document.querySelectorAll('[data-role="admin"]');
  const sponsorLinks = document.querySelectorAll('[data-role="sponsor"]');

  adminLinks.forEach((el) => {
    el.style.display = session?.role === 'admin' ? '' : 'none';
  });
  sponsorLinks.forEach((el) => {
    el.style.display = (session?.role === 'sponsor' || session?.role === 'admin') ? '' : 'none';
  });

  /* ── Personalise greeting ─────────────────────────────── */
  const greetEl = document.getElementById('heroGreeting');
  if (greetEl && session) {
    const first = session.name.split(' ')[0];
    greetEl.textContent = `Welcome back, ${first}.`;
    greetEl.style.display = 'block';
  }

  /* ── Live stats from DB ───────────────────────────────── */
  const total     = DB.count('beneficiaries');
  const approved  = DB.count('beneficiaries', (b) => b.status === 'approved');
  const pending   = DB.count('beneficiaries', (b) => b.status === 'pending');
  const partners  = DB.count('partners',      (p) => p.status === 'approved');

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('statTotal',    total);
  set('statApproved', approved);
  set('statPending',  pending);
  set('statPartners', partners);

  /* ── Animate stats on scroll ──────────────────────────── */
  const statNumbers = document.querySelectorAll('.strip-stat__n');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNumbers.forEach((el) => observer.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;
    let start = 0;
    const duration = 800;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }
});
