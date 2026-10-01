/* NOIR BARBER CLUB · JS del sitio · v2 */
(function () {
  'use strict';

  // ─── Animación de entrada del hero
  window.addEventListener('load', function () {
    requestAnimationFrame(function () { document.documentElement.classList.add('is-loaded'); });
  });
  // Por si la imagen tarda: no dejamos el hero oculto más de 1,5 s
  setTimeout(function () { document.documentElement.classList.add('is-loaded'); }, 1500);

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

  // ─── Vídeos: reproducir solo cuando se ven
  var vio = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) {
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { rootMargin: '200px 0px' }) : null;
  function watchVideos(scope) {
    var vids = (scope || document).querySelectorAll('video[data-lazy]');
    vids.forEach(function (v) {
      if (vio) vio.observe(v);
      else { if (!v.src && v.dataset.src) v.src = v.dataset.src; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }
  watchVideos(document);
  window.noirWatchVideos = watchVideos;

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

/* ─── Reel de inicio desde Instagram (Behold.so) ─── */
(function () {
  var track = document.getElementById('reel-feed');
  if (!track || !window.fetch) return;
  var feedId = (track.getAttribute('data-feed-id') || '').trim();
  if (!feedId) return;
  fetch('https://feeds.behold.so/' + encodeURIComponent(feedId))
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      var posts = (data && data.posts) || (Array.isArray(data) ? data : []);
      var frag = document.createDocumentFragment();
      posts.slice(0, 6).forEach(function (p) {
        var link = String(p.permalink || '');
        if (link.indexOf('https://www.instagram.com/') !== 0) return;
        var size = p.sizes && (p.sizes.medium || p.sizes.large || p.sizes.small);
        var thumb = (size && size.mediaUrl) || p.thumbnailUrl || '';
        var a = document.createElement('a');
        a.className = 'reel-item';
        a.href = link; a.target = '_blank'; a.rel = 'noopener';
        a.setAttribute('aria-label', 'Ver publicación de Noir en Instagram');
        if (p.mediaType === 'VIDEO' && p.mediaUrl) {
          var v = document.createElement('video');
          v.setAttribute('data-lazy', '');
          v.dataset.src = p.mediaUrl;
          if (thumb) v.poster = thumb;
          v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
          a.appendChild(v);
        } else if (thumb || p.mediaUrl) {
          var img = document.createElement('img');
          img.src = thumb || p.mediaUrl; img.loading = 'lazy';
          img.alt = String(p.prunedCaption || p.caption || 'Publicación de Noir Barber Club en Instagram').slice(0, 120);
          a.appendChild(img);
        } else { return; }
        frag.appendChild(a);
      });
      if (frag.childNodes.length) {
        track.innerHTML = '';
        track.appendChild(frag);
        if (window.noirWatchVideos) window.noirWatchVideos(track);
      }
    })
    .catch(function () { /* si falla, se quedan los clips locales */ });
})();

/* ─── Galería de Instagram (Behold.so) ───
   Para activarla: crea un feed JSON gratis en behold.so conectando @noirbarberclub
   y pega su ID en data-feed-id="" del bloque #ig-grid (nosotros.html). */
(function () {
  var grid = document.getElementById('ig-grid');
  if (!grid) return;
  var feedId = (grid.getAttribute('data-feed-id') || '').trim();
  if (!feedId || !window.fetch) return;
  fetch('https://feeds.behold.so/' + encodeURIComponent(feedId))
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      var posts = (data && data.posts) || (Array.isArray(data) ? data : []);
      var frag = document.createDocumentFragment();
      posts.slice(0, 6).forEach(function (p) {
        var size = p.sizes && (p.sizes.medium || p.sizes.large || p.sizes.small);
        var src = (size && size.mediaUrl) || (p.mediaType === 'VIDEO' ? p.thumbnailUrl : p.mediaUrl);
        var link = String(p.permalink || '');
        if (!src || link.indexOf('https://www.instagram.com/') !== 0) return;
        var a = document.createElement('a');
        a.className = 'ig-tile';
        a.href = link; a.target = '_blank'; a.rel = 'noopener';
        var img = document.createElement('img');
        img.src = src; img.loading = 'lazy';
        img.alt = String(p.prunedCaption || p.caption || 'Publicación de Noir Barber Club en Instagram').slice(0, 120);
        a.appendChild(img);
        frag.appendChild(a);
      });
      if (frag.childNodes.length) {
        grid.innerHTML = '';
        grid.appendChild(frag);
        grid.classList.add('is-feed');
      }
    })
    .catch(function () { /* si falla, se quedan las fotos del local */ });
})();
