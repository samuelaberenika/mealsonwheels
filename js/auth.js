/**
 * MealsOnWheels — Auth Module (auth.js)
 *
 * Handles session management via sessionStorage.
 * Session persists for the browser tab, clears on close.
 *
 * Roles:
 *   admin   — President / Secretary: review, approve, reject
 *   sponsor — SSVP member: register beneficiaries
 *   partner — Vendor / logistics: register as partner
 */

const Auth = (() => {
  const KEY = 'mow_session';

  /* ── Core ───────────────────────────────────────────────── */

  /**
   * Attempt login with email + password.
   * Returns { success: true, user } or { success: false, error }.
   */
  const login = (email, password) => {
    const match = DB.query(
      'users',
      (u) => u.email === email.toLowerCase().trim() && u.password === password
    );
    if (!match.length) {
      return { success: false, error: 'Incorrect email or password. Please try again.' };
    }
    const { id, name, email: userEmail, role } = match[0];
    const session = { userId: id, name, email: userEmail, role };
    sessionStorage.setItem(KEY, JSON.stringify(session));
    return { success: true, user: session };
  };

  /** Return the active session object, or null. */
  const getSession = () => {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  };

  /** True if there is an active session. */
  const isLoggedIn = () => Boolean(getSession());

  /** Return the current user's role string, or null. */
  const getRole = () => getSession()?.role ?? null;

  /** Return the current user's display name, or null. */
  const getName = () => getSession()?.name ?? null;

  /** Return initials for avatar display (e.g. "Mary Okafor" → "MO") */
  const getInitials = () => {
    const name = getName();
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  };

  /* ── Guards ─────────────────────────────────────────────── */

  /**
   * Redirect to login if user doesn't have one of the required roles.
   * Usage: Auth.requireRole(['admin']) at top of admin pages.
   * Returns true if the user passes, false if redirecting.
   */
  const requireRole = (roles, redirectTo = 'login.html') => {
    const session = getSession();
    if (!session || !roles.includes(session.role)) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  };

  /**
   * If already logged in, redirect to the appropriate home page.
   * Use this on login.html to avoid showing the form to logged-in users.
   */
  const redirectIfLoggedIn = () => {
    const session = getSession();
    if (!session) return;
    window.location.href = _homeFor(session.role);
  };

  /* ── Session end ────────────────────────────────────────── */

  /** Log out and redirect to login page. */
  const logout = () => {
    sessionStorage.removeItem(KEY);
    window.location.href = 'login.html';
  };

  /* ── Helpers ────────────────────────────────────────────── */

  /** Role → home page mapping */
  const _homeFor = (role) => {
    const map = { admin: 'admin-dashboard.html', sponsor: 'index.html', partner: 'index.html' };
    return map[role] ?? 'index.html';
  };

  /**
   * Populate nav elements with session info.
   * Call after DOM ready on any authenticated page.
   */
  const populateNav = () => {
    const session = getSession();
    if (!session) return;

    const nameEl     = document.getElementById('navUserName');
    const initialsEl = document.getElementById('navUserInitials');
    const roleEl     = document.getElementById('navUserRole');

    if (nameEl)     nameEl.textContent     = session.name;
    if (initialsEl) initialsEl.textContent = getInitials();
    if (roleEl)     roleEl.textContent     = session.role.charAt(0).toUpperCase() + session.role.slice(1);

    // Wire logout buttons
    document.querySelectorAll('[data-action="logout"]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    });
  };

  /* ── Public API ─────────────────────────────────────────── */
  return {
    login, getSession, isLoggedIn, getRole, getName, getInitials,
    requireRole, redirectIfLoggedIn, logout, populateNav,
  };
})();
