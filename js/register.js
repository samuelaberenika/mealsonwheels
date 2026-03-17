/**
 * MealsOnWheels — Register Beneficiary (register.js)
 * Multi-step form with validation, review, and DB insert.
 */

document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  if (!Auth.requireRole(['admin', 'sponsor'])) return;
  Auth.populateNav();

  const session = Auth.getSession();
  const adminLink = document.getElementById('navAdminLink');
  if (adminLink && session?.role === 'admin') adminLink.style.display = '';

  const navUserPill = document.getElementById('navUserPill');
  if (navUserPill) navUserPill.style.display = 'flex';
});

/* ── Step state ────────────────────────────────────────────── */
let currentStep = 1;
const TOTAL_STEPS = 4;

/* ── Navigation ─────────────────────────────────────────────── */
function nextStep(from) {
  if (!validateStep(from)) return;
  goToStep(from + 1);
  if (from + 1 === 4) renderReview();
}

function prevStep(from) {
  goToStep(from - 1);
}

function goToStep(n) {
  // Hide current
  document.getElementById(`step${currentStep}`).style.display = 'none';

  // Update progress dots
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const ps = document.getElementById(`ps${i}`);
    ps.classList.remove('active', 'done');
    if (i < n)  ps.classList.add('done');
    if (i === n) ps.classList.add('active');
    // Replace number with checkmark for done steps via CSS
    const dot = ps.querySelector('.progress-step__dot');
    dot.textContent = i < n ? '' : String(i);
  }

  // Show new step
  currentStep = n;
  document.getElementById(`step${currentStep}`).style.display = '';

  // Scroll to top of form card
  document.getElementById('formCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  clearAlert();
}

/* ── Validation ─────────────────────────────────────────────── */
function validateStep(step) {
  clearAlert();
  let valid = true;

  if (step === 1) {
    valid &= requireField('fullName', 'fullNameErr', 'Full name is required.');
    valid &= requireField('address',  'addressErr',  'Address is required.');

    const age = document.getElementById('age').value;
    if (!age) {
      showFieldError('ageErr', 'Age is required.');
      valid = false;
    } else if (age < 0 || age > 120) {
      showFieldError('ageErr', 'Enter a realistic age between 0 and 120.');
      valid = false;
    }
  }

  if (step === 2) {
    const cat = document.querySelector('input[name="category"]:checked');
    if (!cat) {
      showFieldError('categoryErr', 'Please select a beneficiary category.');
      valid = false;
    }
    const checks = ['chk1', 'chk2', 'chk3'].every((id) => document.getElementById(id).checked);
    if (!checks) {
      showFieldError('eligibilityErr', 'All three eligibility confirmations must be checked.');
      valid = false;
    }
  }

  if (step === 3) {
    const mealType = document.querySelector('input[name="mealType"]:checked');
    if (!mealType) {
      showFieldError('mealTypeErr', 'Please select a meal type.');
      valid = false;
    }
    valid &= requireSelect('mealFrequency', 'mealFrequencyErr', 'Please select a delivery frequency.');
    valid &= requireSelect('duration',      'durationErr',      'Please select an assistance duration.');
  }

  if (!valid) showAlert('Please fix the highlighted fields before continuing.', 'error');
  return Boolean(valid);
}

/* ── Review render ──────────────────────────────────────────── */
const LABELS = {
  category:      { elderly:'Sick / Elderly', orphan:'Orphan / Child', unemployed:'Unemployed', homeless:'Homeless', disabled:'Physical Disability', other:'Other' },
  mealType:      { cooked:'Cooked Food', raw:'Raw Ingredients', combination:'Combination' },
  mealFrequency: { once_daily:'Once daily', twice_daily:'Twice daily', thrice_daily:'Three times daily', weekly:'Weekly', biweekly:'Bi-weekly' },
  duration:      { '1_week':'1 week', '2_weeks':'2 weeks', '1_month':'1 month', '6_weeks':'6 weeks', '2_months':'2 months' },
  gender:        { male:'Male', female:'Female', prefer_not_to_say:'Prefer not to say', '':'Not specified' },
};

function renderReview() {
  const f = getFormData();
  const body = document.getElementById('reviewBody');

  body.innerHTML = `
    <div class="review-section">
      <p class="review-section__title">Personal details</p>
      <div class="review-rows">
        ${row('Full name',  f.fullName)}
        ${row('Age',        f.age)}
        ${row('Gender',     LABELS.gender[f.gender] ?? '—')}
        ${row('Phone',      f.phone || '—')}
        ${row('Address',    f.address)}
        ${f.notes ? row('Notes', f.notes) : ''}
      </div>
    </div>

    <div class="review-section">
      <p class="review-section__title">Eligibility</p>
      <div class="review-rows">
        ${row('Category', LABELS.category[f.category] ?? f.category)}
        ${row('Verified by sponsor', 'Yes ✓')}
      </div>
    </div>

    <div class="review-section">
      <p class="review-section__title">Meal plan</p>
      <div class="review-rows">
        ${row('Meal type',  LABELS.mealType[f.mealType])}
        ${row('Frequency', LABELS.mealFrequency[f.mealFrequency])}
        ${row('Duration',  LABELS.duration[f.duration])}
      </div>
    </div>

    <div class="alert alert-warn" style="margin-top:.25rem">
      ⚠️ Once submitted, this registration will be visible to the admin committee for review.
      You will not be able to edit it after submission.
    </div>
  `;
}

function row(key, val) {
  return `<div class="review-row">
    <span class="review-key">${key}</span>
    <span class="review-val">${val}</span>
  </div>`;
}

/* ── Submit ─────────────────────────────────────────────────── */
function submitForm() {
  const session = Auth.getSession();
  const f = getFormData();

  const btn  = document.getElementById('submitBtn');
  const text = document.getElementById('submitText');
  const spin = document.getElementById('submitSpin');

  btn.disabled = true;
  text.textContent = 'Submitting…';
  spin.classList.remove('hidden');

  setTimeout(() => {
    const record = DB.insert('beneficiaries', {
      fullName:      f.fullName,
      age:           parseInt(f.age, 10),
      gender:        f.gender,
      phone:         f.phone || 'N/A',
      address:       f.address,
      notes:         f.notes,
      category:      f.category,
      mealType:      f.mealType,
      mealFrequency: f.mealFrequency,
      duration:      f.duration,
      registeredBy:  session.userId,
      status:        'pending',
      reviewedBy:    null,
      reviewedAt:    null,
    });

    // Hide form, show success
    document.getElementById('step4').style.display = 'none';
    document.getElementById('progressBar').style.display = 'none';
    document.getElementById('formAlert').innerHTML = '';

    const successEl = document.getElementById('successScreen');
    successEl.classList.add('active');
    document.getElementById('successRef').textContent = record.id.toUpperCase();

  }, 700);
}

/* ── Helpers ────────────────────────────────────────────────── */
function getFormData() {
  return {
    fullName:      document.getElementById('fullName').value.trim(),
    age:           document.getElementById('age').value,
    gender:        document.getElementById('gender').value,
    phone:         document.getElementById('phone').value.trim(),
    address:       document.getElementById('address').value.trim(),
    notes:         document.getElementById('notes').value.trim(),
    category:      document.querySelector('input[name="category"]:checked')?.value ?? '',
    mealType:      document.querySelector('input[name="mealType"]:checked')?.value ?? '',
    mealFrequency: document.getElementById('mealFrequency').value,
    duration:      document.getElementById('duration').value,
  };
}

function requireField(inputId, errId, msg) {
  const val = document.getElementById(inputId).value.trim();
  if (!val) { showFieldError(errId, msg); return false; }
  document.getElementById(errId).textContent = '';
  return true;
}

function requireSelect(selectId, errId, msg) {
  const val = document.getElementById(selectId).value;
  if (!val) { showFieldError(errId, msg); return false; }
  document.getElementById(errId).textContent = '';
  return true;
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function showAlert(msg, type = 'error') {
  document.getElementById('formAlert').innerHTML =
    `<div class="alert alert-${type}" role="alert">${msg}</div>`;
}

function clearAlert() {
  document.getElementById('formAlert').innerHTML = '';
}
