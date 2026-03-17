/**
 * MealsOnWheels — Login Page (login.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Init DB and redirect if already logged in
  DB.init();
  Auth.redirectIfLoggedIn();

  /* ── Elements ─────────────────────────────────────────── */
  const form         = document.getElementById('loginForm');
  const emailInput   = document.getElementById('email');
  const passInput    = document.getElementById('password');
  const toggleBtn    = document.getElementById('togglePass');
  const submitBtn    = document.getElementById('submitBtn');
  const submitText   = document.getElementById('submitText');
  const submitSpin   = document.getElementById('submitSpin');
  const formAlert    = document.getElementById('formAlert');
  const emailErr     = document.getElementById('emailErr');
  const passErr      = document.getElementById('passErr');

  /* ── Demo credential pills ────────────────────────────── */
  document.querySelectorAll('.demo-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      emailInput.value = pill.dataset.email;
      passInput.value  = pill.dataset.pass;
      clearErrors();
      emailInput.dispatchEvent(new Event('input'));
    });
  });

  /* ── Show/hide password ───────────────────────────────── */
  toggleBtn.addEventListener('click', () => {
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    toggleBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    toggleBtn.innerHTML = show ? iconHide() : iconShow();
  });

  /* ── Clear errors on input ────────────────────────────── */
  emailInput.addEventListener('input', () => { emailErr.textContent = ''; });
  passInput.addEventListener('input',  () => { passErr.textContent = ''; });

  /* ── Form submission ──────────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email    = emailInput.value.trim();
    const password = passInput.value;
    let valid = true;

    // Validate
    if (!email) {
      emailErr.textContent = 'Email address is required.';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailErr.textContent = 'Enter a valid email address.';
      valid = false;
    }
    if (!password) {
      passErr.textContent = 'Password is required.';
      valid = false;
    }
    if (!valid) return;

    // Simulate network latency (remove in production)
    setLoading(true);
    await delay(550);

    const result = Auth.login(email, password);
    setLoading(false);

    if (!result.success) {
      showAlert(result.error, 'error');
      passInput.value = '';
      passInput.focus();
      return;
    }

    showAlert('Signing you in…', 'success');

    // Redirect by role
    const destinations = {
      admin:   'admin-dashboard.html',
      sponsor: 'index.html',
      partner: 'index.html',
    };
    setTimeout(() => {
      window.location.href = destinations[result.user.role] ?? 'index.html';
    }, 400);
  });

  /* ── Helpers ──────────────────────────────────────────── */
  function setLoading(on) {
    submitBtn.disabled     = on;
    submitText.textContent = on ? 'Signing in…' : 'Sign in';
    submitSpin.classList.toggle('hidden', !on);
  }

  function showAlert(msg, type = 'error') {
    formAlert.innerHTML = `<div class="alert alert-${type}" role="alert">${msg}</div>`;
  }

  function clearErrors() {
    emailErr.textContent  = '';
    passErr.textContent   = '';
    formAlert.innerHTML   = '';
  }

  function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

  function iconShow() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>`;
  }

  function iconHide() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`;
  }
});
