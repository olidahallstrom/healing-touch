/* ===========================
   main.js — Dr. Lee Anna Edgerton Chiropractic
   =========================== */

'use strict';

/* ─── Hamburger / Mobile Nav ─── */
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
}

/* ─── Testimonial Carousel ─── */
const track = document.getElementById('testimonial-track');

if (track) {
  const slides   = track.querySelectorAll('.testimonial-slide');
  const dots     = document.querySelectorAll('.carousel-dot');
  const prevBtn  = document.getElementById('carousel-prev');
  const nextBtn  = document.getElementById('carousel-next');
  let current    = 0;
  let autoplayTimer;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', String(i === current));
      dot.setAttribute('tabindex', i === current ? '0' : '-1');
    });
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo(current + 1), 5500);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); startAutoplay(); });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); startAutoplay(); });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stopAutoplay(); goTo(i); startAutoplay(); });
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        stopAutoplay();
        goTo(i);
        startAutoplay();
      }
    });
  });

  // Keyboard arrow navigation on carousel
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { stopAutoplay(); goTo(current - 1); startAutoplay(); }
    if (e.key === 'ArrowRight') { stopAutoplay(); goTo(current + 1); startAutoplay(); }
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAutoplay();
      goTo(current + (diff > 0 ? 1 : -1));
      startAutoplay();
    }
  });

  startAutoplay();
}

/* ─── FAQ Accordion ─── */
document.querySelectorAll('.faq-question').forEach(question => {
  question.setAttribute('aria-expanded', 'false');

  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const isOpen = question.getAttribute('aria-expanded') === 'true';

    // Close all other open items
    document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(q => {
      if (q !== question) {
        q.setAttribute('aria-expanded', 'false');
        q.nextElementSibling.style.maxHeight = '0';
      }
    });

    if (isOpen) {
      question.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0';
    } else {
      question.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });

  // Keyboard support
  question.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      question.click();
    }
  });
});

/* ─── Form Validation ─── */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\d\s\-\(\)\+\.]{7,}$/.test(phone);
}

function showError(field, errorEl, message) {
  field.classList.add('error');
  errorEl.textContent = message;
  errorEl.classList.add('show');
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', errorEl.id);
}

function clearError(field, errorEl) {
  field.classList.remove('error');
  errorEl.classList.remove('show');
  field.removeAttribute('aria-invalid');
}

function validateField(field, errorEl) {
  const value = field.value.trim();

  if (field.required && !value) {
    showError(field, errorEl, 'This field is required.');
    return false;
  }
  if (field.type === 'email' && value && !validateEmail(value)) {
    showError(field, errorEl, 'Please enter a valid email address.');
    return false;
  }
  if (field.dataset.type === 'phone' && value && !validatePhone(value)) {
    showError(field, errorEl, 'Please enter a valid phone number.');
    return false;
  }
  if (field.dataset.minlength && value.length < parseInt(field.dataset.minlength, 10)) {
    showError(field, errorEl, `Please enter at least ${field.dataset.minlength} characters.`);
    return false;
  }
  if (field.type === 'date' && field.required && value) {
    const selected = new Date(value);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      showError(field, errorEl, 'Please select a future date.');
      return false;
    }
  }

  clearError(field, errorEl);
  return true;
}

function initForm(formId, successId) {
  const form       = document.getElementById(formId);
  const successMsg = document.getElementById(successId);
  if (!form) return;

  // Real-time validation on blur
  form.querySelectorAll('.form-control').forEach(field => {
    const errorEl = document.getElementById(`${field.id}-error`);
    if (!errorEl) return;

    field.addEventListener('blur',  () => validateField(field, errorEl));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field, errorEl);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('.form-control').forEach(field => {
      const errorEl = document.getElementById(`${field.id}-error`);
      if (errorEl && !validateField(field, errorEl)) valid = false;
    });

    if (valid && successMsg) {
      form.style.display = 'none';
      successMsg.classList.add('show');
      successMsg.setAttribute('tabindex', '-1');
      successMsg.focus();
    }
  });
}

initForm('contact-form',  'contact-success');
initForm('booking-form',  'booking-success');

/* ─── Time Slot Selection ─── */
document.querySelectorAll('.time-slots').forEach(group => {
  const hiddenInput = group.nextElementSibling;

  group.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      group.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      if (hiddenInput && hiddenInput.type === 'hidden') {
        hiddenInput.value = slot.textContent.trim();
      }
    });

    // Keyboard support
    slot.setAttribute('role', 'button');
    slot.setAttribute('tabindex', '0');
    slot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); slot.click(); }
    });
  });
});

/* ─── Active Nav Highlighting ─── */
(function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}());

/* ─── Sticky Navbar Shadow on Scroll ─── */
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(0, 0, 0, 0.12)'
      : '0 2px 8px rgba(0, 0, 0, 0.08)';
  }, { passive: true });
}

/* ─── Set minimum booking date to today ─── */
const dateInput = document.getElementById('appointment-date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}
