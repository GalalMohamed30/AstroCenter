/* =========================================================
   Astro Center — Landing page scripts
   ========================================================= */

/* ---- Settings: fill these in before going live ---- */
const CONFIG = {
  // WhatsApp number in international format without "+" (e.g. "2010XXXXXXXX").
  // When set, a valid form submission opens WhatsApp with the parent's details.
  whatsappNumber: '',
  // Social links. Leave empty until the real account links are ready.
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
    whatsapp: '' // e.g. "https://wa.me/2010XXXXXXXX"
  }
};

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initActiveLinks();
  initReveal();
  initProgressBars();
  initSocialLinks();
  initForm();
  setYear();
});

/* ---------- Navbar: mobile menu + scrolled state ---------- */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.getElementById('nav-menu');
  if (!navbar || !toggle || !menu) return;

  const setOpen = (open) => {
    navbar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  };

  toggle.addEventListener('click', () => setOpen(!navbar.classList.contains('is-open')));

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (navbar.classList.contains('is-open') && !navbar.contains(e.target)) setOpen(false);
  });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Highlight the nav link of the section in view ---------- */
function initActiveLinks() {
  const links = [...document.querySelectorAll('.navbar__links a[href^="#"]')];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean)
    .map((el) => (el.classList.contains('anchor') ? el.closest('section') : el));
  if (!('IntersectionObserver' in window) || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((a) => {
        const target = document.querySelector(a.getAttribute('href'));
        const section = target && target.classList.contains('anchor') ? target.closest('section') : target;
        a.classList.toggle('is-active', section && section.id === id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  [...new Set(sections)].forEach((s) => observer.observe(s));
}

/* ---------- Reveal elements on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach((el, i) => {
    // small stagger for siblings in the same grid
    const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')) : [];
    const index = siblings.indexOf(el);
    if (index > 0) el.style.transitionDelay = `${Math.min(index, 5) * 80}ms`;
    observer.observe(el);
  });
}

/* ---------- Animate the parent dashboard bars ---------- */
function initProgressBars() {
  const bars = document.querySelectorAll('.bar__fill[data-value]');
  const fill = (bar) => { bar.style.width = `${bar.dataset.value}%`; };

  if (!('IntersectionObserver' in window)) {
    bars.forEach(fill);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.bar__fill[data-value]').forEach(fill);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  const dashboard = document.querySelector('.dashboard');
  if (dashboard) observer.observe(dashboard);
}

/* ---------- Social links from CONFIG ---------- */
function initSocialLinks() {
  document.querySelectorAll('[data-social]').forEach((a) => {
    const url = CONFIG.social[a.dataset.social];
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.addEventListener('click', (e) => e.preventDefault());
    }
  });
}

/* ---------- Registration form ---------- */
function toLatinDigits(value) {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}

function normalizePhone(value) {
  let v = toLatinDigits(value).replace(/[\s\-()]/g, '');
  if (v.startsWith('+20')) v = '0' + v.slice(3);
  else if (v.startsWith('0020')) v = '0' + v.slice(4);
  else if (v.startsWith('20') && v.length === 12) v = '0' + v.slice(2);
  return v;
}

function initForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const fields = {
    parent: form.elements.parent,
    whatsapp: form.elements.whatsapp,
    age: form.elements.age
  };
  const success = document.getElementById('form-success');
  const submitBtn = form.querySelector('button[type="submit"]');

  const rules = {
    parent: (v) => (v.trim().length >= 3 ? '' : 'من فضلك اكتب الاسم (3 أحرف على الأقل).'),
    whatsapp: (v) => (/^01[0125]\d{8}$/.test(normalizePhone(v)) ? '' : 'اكتب رقم واتساب مصري صحيح مكوّن من 11 رقماً يبدأ بـ 01.'),
    age: (v) => (v ? '' : 'من فضلك اختر عمر الطفل.')
  };

  const showError = (name, message) => {
    const input = fields[name];
    const box = input.closest('.field');
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    box.classList.toggle('has-error', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message;
  };

  const validate = (name) => {
    const message = rules[name](fields[name].value);
    showError(name, message);
    return !message;
  };

  Object.keys(fields).forEach((name) => {
    const evt = fields[name].tagName === 'SELECT' ? 'change' : 'blur';
    fields[name].addEventListener(evt, () => validate(name));
    fields[name].addEventListener('input', () => {
      if (fields[name].closest('.field').classList.contains('has-error')) validate(name);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    success.hidden = true;

    const results = Object.keys(fields).map(validate);
    if (results.includes(false)) {
      const firstInvalid = Object.values(fields).find((f) => f.getAttribute('aria-invalid') === 'true');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const data = {
      parent: fields.parent.value.trim(),
      whatsapp: normalizePhone(fields.whatsapp.value),
      age: fields.age.options[fields.age.selectedIndex].text
    };

    submitBtn.disabled = true;

    // Hook for a real backend: replace this block with a fetch() to your API if needed.
    if (CONFIG.whatsappNumber) {
      const text = [
        'مرحباً أسترو سنتر، أود حجز مقعد لطفلي.',
        `اسم ولي الأمر: ${data.parent}`,
        `رقم واتساب: ${data.whatsapp}`,
        `عمر الطفل: ${data.age}`
      ].join('\n');
      window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    }

    form.reset();
    Object.keys(fields).forEach((name) => showError(name, ''));
    success.hidden = false;
    submitBtn.disabled = false;
  });
}

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}
