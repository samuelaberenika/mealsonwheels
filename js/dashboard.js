/**
 * MealsOnWheels — Admin Dashboard (dashboard.js)
 *
 * Handles: stats, tabbed beneficiary tables, search/filter,
 * beneficiary detail modal, approve/reject decisions,
 * and partner management.
 */

/* ── Label maps ─────────────────────────────────────────────── */
const CAT_LABEL = {
  elderly: 'Sick / Elderly', orphan: 'Orphan / Child',
  unemployed: 'Unemployed', homeless: 'Homeless',
  disabled: 'Physically Disabled', other: 'Other',
};
const MEAL_LABEL = {
  cooked: 'Cooked Food', raw: 'Raw Ingredients', combination: 'Combination',
};
const FREQ_LABEL = {
  once_daily: 'Once daily', twice_daily: 'Twice daily',
  thrice_daily: '3× daily', weekly: 'Weekly', biweekly: 'Bi-weekly',
};
const DUR_LABEL = {
  '1_week': '1 week', '2_weeks': '2 weeks', '1_month': '1 month',
  '6_weeks': '6 weeks', '2_months': '2 months',
};
const PARTNER_TYPE = { vendor: 'Food Vendor', grocery: 'Grocery Store', logistics: 'Logistics' };

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  if (!Auth.requireRole(['admin'])) return;
  Auth.populateNav();
  renderAll();
});

/* ── Render everything ──────────────────────────────────────── */
function renderAll() {
  const beneficiaries = DB.getAll('beneficiaries');
  const partners      = DB.getAll('partners');

  const pending  = beneficiaries.filter((b) => b.status === 'pending');
  const approved = beneficiaries.filter((b) => b.status === 'approved');
  const rejected = beneficiaries.filter((b) => b.status === 'rejected');

  // Stats
  setText('statPending',  pending.length);
  setText('statApproved', approved.length);
  setText('statRejected', rejected.length);
  setText('statPartners', partners.length);

  // Tab counts
  setText('cntPending',  pending.length);
  setText('cntApproved', approved.length);
  setText('cntRejected', rejected.length);
  setText('cntAll',      beneficiaries.length);
  setText('cntPartners', partners.length);

  // Tables
  renderBeneficiaryTable('pending',  pending);
  renderBeneficiaryTable('approved', approved);
  renderBeneficiaryTable('rejected', rejected);
  renderBeneficiaryTable('all',      beneficiaries);
  renderPartnersTable(partners);
}

/* ── Beneficiary table ─────────────────────────────────────── */
function renderBeneficiaryTable(tabKey, rows) {
  const tbody   = document.getElementById(`tbody-${tabKey}`);
  const emptyEl = document.getElementById(`empty-${tabKey}`);
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  tbody.innerHTML = rows.map((b) => beneficiaryRow(b, tabKey)).join('');
}

function beneficiaryRow(b, tabKey) {
  const date = fmtDate(b.createdAt);
  const reviewDate = b.reviewedAt ? fmtDate(b.reviewedAt) : '—';
  const registeredBy = DB.userName(b.registeredBy);

  let actionCells = '';

  if (tabKey === 'pending') {
    actionCells = `
      <div class="action-btns">
        <button class="btn btn-sm btn-primary" onclick="openReviewModal('${b.id}')">Review</button>
        <button class="btn btn-sm btn-ghost"   onclick="openDetailModal('${b.id}')">View</button>
      </div>`;
  } else if (tabKey === 'approved') {
    actionCells = `
      <div class="action-btns">
        <button class="btn btn-sm btn-ghost"   onclick="openDetailModal('${b.id}')">View</button>
        <button class="btn btn-sm btn-danger"  onclick="revokeApproval('${b.id}')">Revoke</button>
      </div>`;
  } else if (tabKey === 'rejected') {
    actionCells = `
      <div class="action-btns">
        <button class="btn btn-sm btn-ghost"    onclick="openDetailModal('${b.id}')">View</button>
        <button class="btn btn-sm btn-outline"  onclick="reopenApplication('${b.id}')">Reopen</button>
      </div>`;
  } else {
    // all tab
    actionCells = `
      <div class="action-btns">
        <button class="btn btn-sm btn-ghost" onclick="openDetailModal('${b.id}')">View</button>
        ${b.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="openReviewModal('${b.id}')">Review</button>` : ''}
      </div>`;
  }

  if (tabKey === 'pending') {
    return `<tr data-id="${b.id}" data-name="${b.fullName.toLowerCase()}" data-addr="${b.address.toLowerCase()}">
      <td><p class="table-name">${esc(b.fullName)}</p><p class="table-sub">${esc(b.address)}</p></td>
      <td>${CAT_LABEL[b.category] ?? b.category}</td>
      <td>${MEAL_LABEL[b.mealType] ?? b.mealType}<br/><span class="table-sub">${FREQ_LABEL[b.mealFrequency] ?? ''}</span></td>
      <td>${date}</td>
      <td>${esc(registeredBy)}</td>
      <td>${actionCells}</td>
    </tr>`;
  }

  if (tabKey === 'approved') {
    return `<tr data-id="${b.id}" data-name="${b.fullName.toLowerCase()}" data-addr="${b.address.toLowerCase()}">
      <td><p class="table-name">${esc(b.fullName)}</p><p class="table-sub">${esc(b.address)}</p></td>
      <td>${CAT_LABEL[b.category] ?? b.category}</td>
      <td>${MEAL_LABEL[b.mealType] ?? b.mealType}<br/><span class="table-sub">${FREQ_LABEL[b.mealFrequency] ?? ''}</span></td>
      <td>${reviewDate}</td>
      <td>${actionCells}</td>
    </tr>`;
  }

  if (tabKey === 'rejected') {
    return `<tr data-id="${b.id}">
      <td><p class="table-name">${esc(b.fullName)}</p><p class="table-sub">${esc(b.address)}</p></td>
      <td>${CAT_LABEL[b.category] ?? b.category}</td>
      <td>${reviewDate}</td>
      <td><span style="font-size:.82rem;color:var(--ink-500)">${esc(b.rejectionReason ?? '—')}</span></td>
      <td>${actionCells}</td>
    </tr>`;
  }

  // all
  return `<tr data-id="${b.id}" data-name="${b.fullName.toLowerCase()}" data-status="${b.status}">
    <td><p class="table-name">${esc(b.fullName)}</p><p class="table-sub">${esc(b.address)}</p></td>
    <td>${CAT_LABEL[b.category] ?? b.category}</td>
    <td><span class="badge badge-${b.status}">${cap(b.status)}</span></td>
    <td>${MEAL_LABEL[b.mealType] ?? b.mealType}</td>
    <td>${date}</td>
    <td>${actionCells}</td>
  </tr>`;
}

/* ── Partners table ────────────────────────────────────────── */
function renderPartnersTable(rows) {
  const tbody   = document.getElementById('tbody-partners');
  const emptyEl = document.getElementById('empty-partners');
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  tbody.innerHTML = rows.map((p) => `
    <tr data-id="${p.id}">
      <td><p class="table-name">${esc(p.name)}</p><p class="table-sub">${esc(p.address)}</p></td>
      <td>${PARTNER_TYPE[p.type] ?? p.type}</td>
      <td>
        <p class="table-name" style="font-weight:500">${esc(p.contactPerson)}</p>
        <p class="table-sub">${esc(p.phone)}</p>
      </td>
      <td><span class="badge badge-${p.status}">${cap(p.status)}</span></td>
      <td>
        <div class="action-btns">
          ${p.status === 'pending'
            ? `<button class="btn btn-sm btn-primary" onclick="approvePartner('${p.id}')">Approve</button>
               <button class="btn btn-sm btn-danger"  onclick="rejectPartner('${p.id}')">Reject</button>`
            : `<button class="btn btn-sm btn-ghost"   onclick="viewPartner('${p.id}')">View</button>`}
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── Tabs ───────────────────────────────────────────────────── */
function switchTab(key) {
  document.querySelectorAll('.tab-btn').forEach((b) => {
    const active = b.id === `tab-${key}`;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active);
  });
  document.querySelectorAll('.tab-panel').forEach((p) => {
    p.classList.toggle('active', p.id === `panel-${key}`);
  });
}

/* ── Search / Filter ────────────────────────────────────────── */
function filterTable(tabKey, query) {
  const tbody = document.getElementById(`tbody-${tabKey}`);
  if (!tbody) return;
  const q = query.toLowerCase().trim();
  tbody.querySelectorAll('tr').forEach((tr) => {
    const name = tr.dataset.name ?? '';
    const addr = tr.dataset.addr ?? '';
    tr.style.display = (!q || name.includes(q) || addr.includes(q)) ? '' : 'none';
  });
}

function filterByStatus(status) {
  const tbody = document.getElementById('tbody-all');
  tbody.querySelectorAll('tr').forEach((tr) => {
    tr.style.display = (!status || tr.dataset.status === status) ? '' : 'none';
  });
}

/* ── Detail Modal ───────────────────────────────────────────── */
function openDetailModal(id) {
  const b = DB.getById('beneficiaries', id);
  if (!b) return;

  document.getElementById('modalTitle').textContent = `${b.fullName} — Details`;
  document.getElementById('modalBody').innerHTML = detailHTML(b);
  document.getElementById('modalFooter').innerHTML = `
    <button class="btn btn-ghost" onclick="closeModal()">Close</button>
  `;
  openModal();
}

function detailHTML(b) {
  const registeredBy = DB.userName(b.registeredBy);
  const reviewedBy   = b.reviewedBy ? DB.userName(b.reviewedBy) : '—';
  return `
    <div class="detail-grid">
      <div class="detail-row">
        <span class="detail-label">Full name</span>
        <span class="detail-val">${esc(b.fullName)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Age</span>
        <span class="detail-val">${b.age}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone</span>
        <span class="detail-val">${esc(b.phone)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-val"><span class="badge badge-${b.status}">${cap(b.status)}</span></span>
      </div>
      <div class="detail-row detail-full">
        <span class="detail-label">Address</span>
        <span class="detail-val">${esc(b.address)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Category</span>
        <span class="detail-val">${CAT_LABEL[b.category] ?? b.category}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Meal type</span>
        <span class="detail-val">${MEAL_LABEL[b.mealType] ?? b.mealType}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Frequency</span>
        <span class="detail-val">${FREQ_LABEL[b.mealFrequency] ?? b.mealFrequency}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Duration</span>
        <span class="detail-val">${DUR_LABEL[b.duration] ?? b.duration}</span>
      </div>
      ${b.notes ? `<div class="detail-row detail-full">
        <span class="detail-label">Notes</span>
        <span class="detail-val">${esc(b.notes)}</span>
      </div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Registered by</span>
        <span class="detail-val">${esc(registeredBy)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Submitted</span>
        <span class="detail-val">${fmtDate(b.createdAt)}</span>
      </div>
      ${b.reviewedBy ? `
      <div class="detail-row">
        <span class="detail-label">Reviewed by</span>
        <span class="detail-val">${esc(reviewedBy)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Review date</span>
        <span class="detail-val">${fmtDate(b.reviewedAt)}</span>
      </div>` : ''}
      ${b.rejectionReason ? `
      <div class="detail-row detail-full">
        <span class="detail-label">Rejection reason</span>
        <span class="detail-val" style="color:var(--red-600)">${esc(b.rejectionReason)}</span>
      </div>` : ''}
    </div>
  `;
}

/* ── Review Modal (approve / reject) ────────────────────────── */
function openReviewModal(id) {
  const b = DB.getById('beneficiaries', id);
  if (!b) return;

  document.getElementById('modalTitle').textContent = `Review — ${b.fullName}`;
  document.getElementById('modalBody').innerHTML = `
    ${detailHTML(b)}
    <hr style="border:none;border-top:1px solid var(--ink-100)"/>
    <div class="decision-section">
      <p style="font-size:.9rem;font-weight:700;color:var(--ink-800)">Committee Decision</p>
      <div class="decision-radios">
        <label class="decision-radio">
          <input type="radio" name="decision" value="approved" id="decApprove" checked />
          <span style="color:var(--green-700)">✅ Approve</span>
        </label>
        <label class="decision-radio">
          <input type="radio" name="decision" value="rejected" id="decReject" />
          <span style="color:var(--red-600)">❌ Reject</span>
        </label>
      </div>
      <div id="rejectionReasonWrap" style="display:none">
        <div class="form-group">
          <label class="form-label" for="rejectionReason">Rejection reason <span aria-hidden="true">*</span></label>
          <textarea class="form-textarea" id="rejectionReason"
            placeholder="Explain why this application was rejected and what the sponsor should do next…"></textarea>
          <span class="form-error" id="rejectionReasonErr"></span>
        </div>
      </div>
      <div id="modalAlert" role="alert" aria-live="polite"></div>
    </div>
  `;

  document.getElementById('modalFooter').innerHTML = `
    <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" id="confirmDecisionBtn" onclick="confirmDecision('${id}')">
      <span id="decisionBtnText">Confirm decision</span>
      <span id="decisionSpin" class="spinner hidden" aria-hidden="true"></span>
    </button>
  `;

  // Toggle rejection reason field
  document.querySelectorAll('input[name="decision"]').forEach((r) => {
    r.addEventListener('change', () => {
      const isReject = document.getElementById('decReject').checked;
      document.getElementById('rejectionReasonWrap').style.display = isReject ? '' : 'none';
    });
  });

  openModal();
}

function confirmDecision(beneficiaryId) {
  const decision = document.querySelector('input[name="decision"]:checked')?.value;
  const reason   = document.getElementById('rejectionReason')?.value?.trim();
  const session  = Auth.getSession();

  // Validate rejection reason
  if (decision === 'rejected' && !reason) {
    document.getElementById('rejectionReasonErr').textContent = 'Please provide a reason for rejection.';
    return;
  }

  const btn  = document.getElementById('confirmDecisionBtn');
  const text = document.getElementById('decisionBtnText');
  const spin = document.getElementById('decisionSpin');

  btn.disabled      = true;
  text.textContent  = 'Saving…';
  spin.classList.remove('hidden');

  setTimeout(() => {
    DB.update('beneficiaries', beneficiaryId, {
      status:          decision,
      reviewedBy:      session.userId,
      reviewedAt:      new Date().toISOString(),
      rejectionReason: decision === 'rejected' ? reason : null,
    });

    closeModal();
    renderAll();

    const msg = decision === 'approved'
      ? '✅ Beneficiary approved successfully.'
      : '❌ Application rejected.';
    showGlobalAlert(msg, decision === 'approved' ? 'success' : 'warn');

    // Switch to appropriate tab
    switchTab(decision);
  }, 500);
}

/* ── Quick actions ──────────────────────────────────────────── */
function revokeApproval(id) {
  if (!confirm('Revoke this approval and return to pending?')) return;
  DB.update('beneficiaries', id, { status: 'pending', reviewedBy: null, reviewedAt: null });
  renderAll();
  showGlobalAlert('Approval revoked — application returned to pending.', 'warn');
}

function reopenApplication(id) {
  if (!confirm('Reopen this application and return it to pending?')) return;
  DB.update('beneficiaries', id, {
    status: 'pending', reviewedBy: null, reviewedAt: null, rejectionReason: null,
  });
  renderAll();
  showGlobalAlert('Application reopened and returned to pending review.', 'info');
  switchTab('pending');
}

/* ── Partner quick actions ──────────────────────────────────── */
function approvePartner(id) {
  const session = Auth.getSession();
  DB.update('partners', id, { status: 'approved', reviewedBy: session.userId, reviewedAt: new Date().toISOString() });
  renderAll();
  showGlobalAlert('Partner approved.', 'success');
}

function rejectPartner(id) {
  if (!confirm('Reject this partner application?')) return;
  DB.update('partners', id, { status: 'rejected', reviewedBy: Auth.getSession().userId, reviewedAt: new Date().toISOString() });
  renderAll();
  showGlobalAlert('Partner application rejected.', 'warn');
}

function viewPartner(id) {
  const p = DB.getById('partners', id);
  if (!p) return;
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalBody').innerHTML = `
    <div class="detail-grid">
      <div class="detail-row"><span class="detail-label">Name</span><span class="detail-val">${esc(p.name)}</span></div>
      <div class="detail-row"><span class="detail-label">Type</span><span class="detail-val">${PARTNER_TYPE[p.type] ?? p.type}</span></div>
      <div class="detail-row"><span class="detail-label">Contact person</span><span class="detail-val">${esc(p.contactPerson)}</span></div>
      <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-val">${esc(p.phone)}</span></div>
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-val">${esc(p.email)}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-val"><span class="badge badge-${p.status}">${cap(p.status)}</span></span></div>
      <div class="detail-row detail-full"><span class="detail-label">Address</span><span class="detail-val">${esc(p.address)}</span></div>
      <div class="detail-row"><span class="detail-label">Capacity</span><span class="detail-val">${esc(p.capacity)}</span></div>
      <div class="detail-row"><span class="detail-label">Payment terms</span><span class="detail-val">${cap(p.paymentTerms)}</span></div>
    </div>
  `;
  document.getElementById('modalFooter').innerHTML = `<button class="btn btn-ghost" onclick="closeModal()">Close</button>`;
  openModal();
}

/* ── Modal helpers ──────────────────────────────────────────── */
function openModal() {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// Close on backdrop click
document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ── Alert ──────────────────────────────────────────────────── */
function showGlobalAlert(msg, type = 'info') {
  const el = document.getElementById('globalAlert');
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}

/* ── Utils ──────────────────────────────────────────────────── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function cap(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
