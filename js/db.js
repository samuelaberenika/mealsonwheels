/**
 * MealsOnWheels — Database Module (db.js)
 *
 * Provides a clean abstraction over localStorage that mirrors
 * what a real SQLite/Flask backend would look like.
 *
 * In production: replace each method body with an API call.
 * e.g.  DB.insert('beneficiaries', data)
 *       → fetch('/api/beneficiaries', { method: 'POST', body: ... })
 *
 * Exported as a global `DB` object (no bundler required).
 */

const DB = (() => {
  const PREFIX = 'mow_';
  const INIT_FLAG = 'mow_v1_initialised';

  /* ── Seed data ─────────────────────────────────────────── */
  const SEED = {
    users: [
      {
        id: 'u1',
        name: 'Admin User',
        email: 'admin@ssvp.org',
        password: 'admin123',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'u2',
        name: 'Mary Okafor',
        email: 'mary@ssvp.org',
        password: 'sponsor123',
        role: 'sponsor',
        createdAt: '2024-01-15T00:00:00.000Z',
      },
      {
        id: 'u3',
        name: 'John Adeyemi',
        email: 'john@ssvp.org',
        password: 'sponsor123',
        role: 'sponsor',
        createdAt: '2024-02-01T00:00:00.000Z',
      },
    ],

    beneficiaries: [
      {
        id: 'b1',
        fullName: 'Emeka Obi',
        age: 67,
        phone: '+234 801 234 5678',
        address: '14 Balogun St, Lagos Island',
        category: 'elderly',
        mealType: 'cooked',
        mealFrequency: 'once_daily',
        duration: '2_months',
        notes: 'Lives alone, no family support. Mobility issues.',
        registeredBy: 'u2',
        status: 'approved',
        reviewedBy: 'u1',
        reviewedAt: '2024-02-15T10:00:00.000Z',
        createdAt: '2024-02-10T08:30:00.000Z',
      },
      {
        id: 'b2',
        fullName: 'Chidinma Eze',
        age: 28,
        phone: '+234 802 345 6789',
        address: '7 Apapa Road, Lagos Mainland',
        category: 'unemployed',
        mealType: 'raw',
        mealFrequency: 'weekly',
        duration: '1_month',
        notes: 'Recently laid off, has 2 children to feed.',
        registeredBy: 'u2',
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        createdAt: '2024-03-01T09:15:00.000Z',
      },
      {
        id: 'b3',
        fullName: 'Olawale Fashola',
        age: 8,
        phone: 'N/A',
        address: 'St. Mary Orphanage, Yaba',
        category: 'orphan',
        mealType: 'combination',
        mealFrequency: 'twice_daily',
        duration: '2_months',
        notes: 'Referred by orphanage administrator — Mrs Folake.',
        registeredBy: 'u3',
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        createdAt: '2024-03-05T11:00:00.000Z',
      },
      {
        id: 'b4',
        fullName: 'Funmilayo Adebisi',
        age: 72,
        phone: '+234 805 678 9012',
        address: '3 Eric Moore Rd, Surulere',
        category: 'sick',
        mealType: 'cooked',
        mealFrequency: 'once_daily',
        duration: '1_month',
        notes: 'Post-surgery recovery, cannot cook independently.',
        registeredBy: 'u3',
        status: 'rejected',
        reviewedBy: 'u1',
        reviewedAt: '2024-03-10T14:00:00.000Z',
        rejectionReason: 'Family member available to assist — please resubmit if situation changes.',
        createdAt: '2024-03-08T13:00:00.000Z',
      },
    ],

    partners: [
      {
        id: 'p1',
        name: 'Mama Titi Kitchen',
        type: 'vendor',
        contactPerson: 'Titilayo Adeyemi',
        phone: '+234 803 456 7890',
        email: 'titi@mamakitchen.ng',
        address: '22 Obafemi Awolowo Way, Ikeja',
        capacity: '50 meals/day',
        paymentTerms: 'weekly',
        status: 'approved',
        registeredBy: 'u2',
        createdAt: '2024-01-20T00:00:00.000Z',
      },
      {
        id: 'p2',
        name: 'FreshMart Lagos',
        type: 'grocery',
        contactPerson: 'Biodun Okonkwo',
        phone: '+234 806 789 0123',
        email: 'info@freshmartng.com',
        address: '11 Allen Avenue, Ikeja',
        capacity: 'N/A',
        paymentTerms: 'biweekly',
        status: 'pending',
        registeredBy: 'u3',
        createdAt: '2024-03-12T00:00:00.000Z',
      },
    ],
  };

  /* ── Initialise ─────────────────────────────────────────── */
  /**
   * Seeds the database on first load.
   * Safe to call on every page — only runs once.
   */
  const init = () => {
    if (localStorage.getItem(INIT_FLAG)) return;
    Object.entries(SEED).forEach(([table, rows]) => {
      localStorage.setItem(PREFIX + table, JSON.stringify(rows));
    });
    localStorage.setItem(INIT_FLAG, 'true');
  };

  /* ── Core CRUD ──────────────────────────────────────────── */

  /** Return all rows from a table */
  const getAll = (table) => {
    const raw = localStorage.getItem(PREFIX + table);
    return raw ? JSON.parse(raw) : [];
  };

  /** Return a single row by id */
  const getById = (table, id) =>
    getAll(table).find((r) => r.id === id) ?? null;

  /** Return rows matching a filter predicate */
  const query = (table, filterFn) =>
    getAll(table).filter(filterFn);

  /**
   * Insert a new row.
   * Auto-generates id from table prefix + timestamp.
   * Returns the full inserted record.
   */
  const insert = (table, data) => {
    const rows = getAll(table);
    const id = `${table.slice(0, 1)}${Date.now()}`;
    const record = { id, ...data, createdAt: new Date().toISOString() };
    rows.push(record);
    localStorage.setItem(PREFIX + table, JSON.stringify(rows));
    return record;
  };

  /**
   * Update a row by id with partial data.
   * Returns the updated record, or null if not found.
   */
  const update = (table, id, changes) => {
    const rows = getAll(table);
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], ...changes, updatedAt: new Date().toISOString() };
    localStorage.setItem(PREFIX + table, JSON.stringify(rows));
    return rows[idx];
  };

  /** Delete a row by id */
  const remove = (table, id) => {
    const rows = getAll(table).filter((r) => r.id !== id);
    localStorage.setItem(PREFIX + table, JSON.stringify(rows));
  };

  /** Count rows, optionally filtered */
  const count = (table, filterFn = null) =>
    filterFn ? query(table, filterFn).length : getAll(table).length;

  /* ── Helpers ────────────────────────────────────────────── */

  /** Look up user display name by id */
  const userName = (userId) =>
    getById('users', userId)?.name ?? 'Unknown';

  /** Hard reset — clears all data and re-seeds */
  const reset = () => {
    Object.keys(SEED).forEach((t) => localStorage.removeItem(PREFIX + t));
    localStorage.removeItem(INIT_FLAG);
    init();
  };

  /* ── Public API ─────────────────────────────────────────── */
  return { init, getAll, getById, query, insert, update, remove, count, userName, reset };
})();
