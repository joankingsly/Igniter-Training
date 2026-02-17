/**
 * Igniter Training Academy - Shared app logic
 */

const IGNITER_KEYS = {
  TRAININGS: 'igniter_trainings',
  REGISTRATIONS: 'igniter_registrations'
};

/**
 * Get all trainings from localStorage
 * @returns {Array<{id: string, title: string, description: string, duration: string, date: string, capacity: string}>}
 */
function getTrainings() {
  try {
    const raw = localStorage.getItem(IGNITER_KEYS.TRAININGS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Save trainings array to localStorage
 * @param {Array} trainings
 */
function saveTrainings(trainings) {
  localStorage.setItem(IGNITER_KEYS.TRAININGS, JSON.stringify(trainings));
}

/**
 * Get all registrations from localStorage
 * @returns {Array<{id: string, name: string, email: string, phone: string, trainingId: string, datePreference: string, notes: string, createdAt: string}>}
 */
function getRegistrations() {
  try {
    const raw = localStorage.getItem(IGNITER_KEYS.REGISTRATIONS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Save registrations array to localStorage
 * @param {Array} registrations
 */
function saveRegistrations(registrations) {
  localStorage.setItem(IGNITER_KEYS.REGISTRATIONS, JSON.stringify(registrations));
}

/**
 * Generate a simple unique id
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Mobile nav toggle - run on DOMContentLoaded
 */
function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close when clicking a link (for in-page or same-site nav)
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Set aria-current on nav link matching current page
 */
function setCurrentPageLink() {
  const path = window.location.pathname || '';
  const page = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a[href]').forEach(function (a) {
    const href = a.getAttribute('href') || '';
    const linkPage = href.split('/').pop() || 'index.html';
    a.setAttribute('aria-current', linkPage === page ? 'page' : null);
  });
}

/**
 * Show a toast message
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} durationMs
 */
function showToast(message, type = 'info', durationMs = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, durationMs);
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    setCurrentPageLink();
  });
} else {
  initMobileNav();
  setCurrentPageLink();
}
