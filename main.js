/* NodalWaves 5x5 — page behaviour (no dependencies) */
(function () {
  'use strict';

  /* ---------- Build your 5: level unlock explorer ---------- */
  var BASE = 2898;                        // example activation quantity from the program spec
  var RATES = [500, 500, 400, 300, 300];  // basis points per generation (5 / 5 / 4 / 3 / 3)
  var seg = document.getElementById('seg');
  var levels = document.getElementById('levels');
  var read = document.getElementById('ctlRead');
  var pct = document.getElementById('ctlPct');

  function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function setDirects(n) {
    if (!seg || !levels) return;
    var total = 0;
    Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) {
      var on = Number(b.dataset.n) === n;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    Array.prototype.forEach.call(levels.querySelectorAll('li'), function (li, i) {
      var on = n >= i + 1;
      li.classList.toggle('on', on);
      if (on) total += RATES[i];
    });
    if (pct) pct.textContent = (total / 100) + '%';
    if (read) {
      if (n === 0) {
        read.innerHTML = 'No qualified directs yet. Your own activation stands on its own: <b>the $10 purchase and the 1:1 promo match never depend on bringing anyone.</b>';
      } else if (n < 5) {
        var unlocked = 'L1' + (n > 1 ? ' to L' + n : '');
        read.innerHTML = '<b>' + n + ' qualified ' + (n === 1 ? 'direct' : 'directs') + '</b> unlocks <b>' + unlocked + '</b>. When someone activates in those generations of your network, ' + (total / 100) + '% of their purchased quantity is allocated to you, per activation, in token units.';
      } else {
        read.innerHTML = '<b>All five levels open.</b> Five qualified directs is also the SPARK threshold. Every activation across your five generations allocates up to <b>20%</b> of its purchased quantity to you.';
      }
    }
  }

  if (seg) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) setDirects(Number(b.dataset.n));
    });
    seg.addEventListener('keydown', function (e) {
      var cur = seg.querySelector('button[aria-checked="true"]');
      if (!cur) return;
      var n = Number(cur.dataset.n);
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); n = Math.min(5, n + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); n = Math.max(0, n - 1); }
      else return;
      setDirects(n);
      seg.querySelector('button[data-n="' + n + '"]').focus();
    });
    // write the example quantities from the same formula the spec uses (floor in base units)
    Array.prototype.forEach.call(levels.querySelectorAll('.lv-ex b'), function (el, i) {
      el.textContent = fmt(Math.floor(BASE * 100 * RATES[i] / 10000) / 100);
    });
    setDirects(3);
  }

  /* ---------- Launch list form (demo: no backend wired yet) ---------- */
  var form = document.getElementById('joinForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]');
      if (email && !email.checkValidity()) { email.reportValidity(); return; }
      form.closest('.join').classList.add('is-done');
    });
  }

  /* ---------- Scroll reveals: resting state is visible; only defer what is below the fold ---------- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce && window.innerHeight > 0) {
    var items = document.querySelectorAll('[data-reveal]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(items, function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal-pending');
        io.observe(el);
      }
    });
    // safety: never leave anything hidden
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal-pending:not(.in)'), function (el) { el.classList.add('in'); });
    }, 4000);
  }

  /* ---------- Receipt: live timestamp so the example never looks stale ---------- */
  var ts = document.getElementById('rcDate');
  if (ts) {
    var d = new Date();
    var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    var hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
    ts.textContent = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear() + ' · ' + hh + ':' + mm;
  }
})();
