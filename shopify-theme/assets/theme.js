/* theme.js — header scroll, quiz open, subscribe banner, page transitions */

(function () {
  'use strict';

  /* ── Ship date helpers ── */
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function computeShipDate(today) {
    const d = today || new Date();
    let year = d.getFullYear(), month = d.getMonth();
    if (d.getDate() >= 15) {
      month += 1;
      if (month > 11) { month = 0; year++; }
    }
    return new Date(year, month, 15);
  }

  function fmtShipShort(d) {
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
  }

  window.OLNIAN = window.OLNIAN || {};
  window.OLNIAN.shipDate = computeShipDate(new Date());
  window.OLNIAN.fmtShipShort = fmtShipShort;

  /* ── Sticky header ── */
  const header = document.getElementById('site-header');
  if (header) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 80) {
        header.classList.add('site-header--scrolled');
      } else {
        header.classList.remove('site-header--scrolled');
      }
      lastY = y;
    }, { passive: true });
  }

  /* ── Subscribe banner (appears after scrolling past hero) ── */
  const banner = document.getElementById('subscribe-banner');
  const hero = document.getElementById('hero');
  if (banner && hero) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          banner.classList.add('is-visible');
          banner.removeAttribute('aria-hidden');
        } else {
          banner.classList.remove('is-visible');
          banner.setAttribute('aria-hidden', 'true');
        }
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    obs.observe(hero);
  }

  /* ── Quiz open button ── */
  const quizOpenBtn = document.getElementById('quiz-open-btn');
  if (quizOpenBtn) {
    quizOpenBtn.addEventListener('click', () => {
      window.OLNIAN.openQuiz && window.OLNIAN.openQuiz();
    });
  }

  /* ── Cart toggle ── */
  const cartToggle = document.getElementById('cart-toggle');
  if (cartToggle) {
    cartToggle.addEventListener('click', () => {
      window.OLNIAN.openCart && window.OLNIAN.openCart();
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ── Update ship date displays ── */
  document.addEventListener('DOMContentLoaded', () => {
    const sd = window.OLNIAN.shipDate;
    document.querySelectorAll('[data-ship-date]').forEach(el => {
      el.textContent = fmtShipShort(sd);
    });
  });
})();
