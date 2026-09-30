(function () {
  'use strict';

  // ─── Animación de entrada del hero
  window.addEventListener('load', function () {
    requestAnimationFrame(function () { document.documentElement.classList.add('is-loaded'); });
  });
  // Por si la imagen tarda: no dejamos el hero oculto más de 1,5 s
  setTimeout(function () { document.documentElement.classList.add('is-loaded'); }, 1500);


  // ─── Punto exacto donde el titular pasa de blanco (foto) a negro (panel)
  var heroTitle = document.querySelector('.hero-title');
  var heroMedia = document.querySelector('.hero-media');
  function setSplit() {
    if (!heroTitle || !heroMedia) return;
    var x = heroMedia.getBoundingClientRect().right - heroTitle.getBoundingClientRect().left;
    heroTitle.style.setProperty('--split', x + 'px');
  }
  setSplit();
  window.addEventListener('resize', setSplit);

  // ─── Menú móvil
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
  }

  // ─── Aparición al hacer scroll
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // ─── Cookies
  var STORAGE_KEY = 'noir_cookie_consent';
  var banner = document.getElementById('cookie-banner');
  if (banner) {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!stored) banner.hidden = false;
    banner.addEventListener('click', function (e) {
      var v = e.target.closest('[data-cookie-accept]') ? 'accepted' : e.target.closest('[data-cookie-reject]') ? 'rejected' : null;
      if (!v) return;
      try { localStorage.setItem(STORAGE_KEY, v); } catch (err) {}
      banner.hidden = true;
    });
  }

  // ─── Modal de reserva (Booksy · Noir Pozuelo)
  var BOOKSY_URL = 'https://booksy.com/es-es/instant-experiences/widget/174546';
  var modal = document.getElementById('booking-modal');
  var iframe = document.getElementById('booking-iframe');

  function openBooking() {
    modal.classList.remove('loaded');
    iframe.src = BOOKSY_URL;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setMenu(false);
  }
  function closeBooking() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    setTimeout(function () { iframe.src = ''; modal.classList.remove('loaded'); }, 250);
  }

  if (modal && iframe) {
    iframe.addEventListener('load', function () { if (iframe.src) modal.classList.add('loaded'); });
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-booking]')) { e.preventDefault(); openBooking(); return; }
      if (e.target.closest('[data-booking-close]')) { e.preventDefault(); closeBooking(); }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modal && modal.classList.contains('active')) closeBooking();
    else setMenu(false);
  });
})();
