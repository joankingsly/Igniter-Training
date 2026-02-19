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
 * Banner slider - run only on index page
 */
function initBannerSlider() {
  const slider = document.querySelector('[data-banner-slider]');
  if (!slider) return;

  const slides = slider.querySelectorAll('.banner-slide');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');
  const dotBtns = slider.querySelectorAll('.slider-dots button');
  const total = slides.length;
  let currentSlide = 0;
  let autoInterval = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goToSlide(n) {
    currentSlide = ((n % total) + total) % total;
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === currentSlide);
      s.setAttribute('aria-current', i === currentSlide ? 'true' : null);
    });
    dotBtns.forEach(function (b, i) {
      b.setAttribute('aria-current', i === currentSlide ? 'true' : null);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAuto() {
    if (prefersReducedMotion) return;
    stopAuto();
    autoInterval = setInterval(nextSlide, 5000);
  }

  function stopAuto() {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      prevSlide();
      stopAuto();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      nextSlide();
      stopAuto();
    });
  }
  dotBtns.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      goToSlide(i);
      stopAuto();
    });
  });

  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('focusin', stopAuto);
  slider.addEventListener('focusout', function () {
    if (!slider.contains(document.activeElement)) startAuto();
  });

  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
      stopAuto();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
      stopAuto();
    }
  });
  slider.setAttribute('tabindex', '0');

  startAuto();
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
    initBannerSlider();
  });
} else {
  initMobileNav();
  setCurrentPageLink();
  initBannerSlider();
}
