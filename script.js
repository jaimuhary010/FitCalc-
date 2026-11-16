(function () {
  'use strict';

  // Click animation: subtle scale-down then scale-up on every interactive element
  var targets = '.btn, .card, .links a, .q, .footer a, .logo, .menu-btn';
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest(targets);
    if (!el) return;
    el.classList.remove('pop');
    el.classList.add('press');
  });
  function release(e) {
    var el = e.target.closest ? e.target.closest(targets) : null;
    document.querySelectorAll('.press').forEach(function (n) {
      n.classList.remove('press');
      void n.offsetWidth;
      n.classList.add('pop');
      setTimeout(function () { n.classList.remove('pop'); }, 260);
    });
  }
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
    document.addEventListener(t, release, true);
  });

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.nav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.links a, .cta-nav').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // FAQ accordion (one open at a time)
  var items = document.querySelectorAll('.acc .item');
  items.forEach(function (item) {
    var q = item.querySelector('.q');
    var a = item.querySelector('.a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      items.forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.q').setAttribute('aria-expanded', 'false');
        o.querySelector('.a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
  window.addEventListener('resize', function () {
    var o = document.querySelector('.acc .item.open .a');
    if (o) o.style.maxHeight = o.scrollHeight + 'px';
  });
})();
