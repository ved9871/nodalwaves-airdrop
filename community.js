/* NodalWaves — Community Partner page: level-unlock explorer (reads NW_CONFIG.community) */
(function () {
  'use strict';
  var CFG = (window.NW_CONFIG && window.NW_CONFIG.community) || {};
  var RATES = CFG.levelRatesBps || [500, 500, 400, 300, 300];   // basis points per generation
  var MAX = CFG.maxRateBps || RATES.reduce(function (a, b) { return a + b; }, 0);
  var PER = 1000;                                                // example activation quantity, in NODAL
  var seg = document.getElementById('seg');
  var levels = document.getElementById('levels');
  var read = document.getElementById('ctlRead');
  var pct = document.getElementById('ctlPct');
  var maxEl = document.getElementById('levelsMax');
  if (!seg || !levels) return;

  function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }

  function setDirects(n) {
    var total = 0;
    Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) {
      var on = Number(b.dataset.n) === n;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    Array.prototype.forEach.call(levels.querySelectorAll('li'), function (li, i) {
      var on = n >= i + 1;
      li.classList.toggle('on', on);
      if (on) total += RATES[i] || 0;
    });
    if (pct) pct.textContent = (total / 100) + '%';
    if (read) {
      if (n === 0) {
        read.innerHTML = 'No qualified directs yet. Your own participation stands on its own: <b>your qualifying purchase and promotional NODAL never depend on bringing anyone.</b>';
      } else if (n < RATES.length) {
        read.innerHTML = '<b>' + n + ' qualified ' + (n === 1 ? 'direct' : 'directs') + '</b> unlocks <b>L1' + (n > 1 ? ' to L' + n : '') + '</b>. When someone activates in those generations of your community, ' + (total / 100) + '% of their qualifying purchased quantity is allocated to you, per activation, in token units.';
      } else {
        read.innerHTML = '<b>All five levels open.</b> Every qualifying activation across your five generations allocates up to <b>' + (MAX / 100) + '%</b> of its purchased quantity to you, in token units.';
      }
    }
  }

  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) setDirects(Number(b.dataset.n));
  });
  seg.addEventListener('keydown', function (e) {
    var cur = seg.querySelector('button[aria-checked="true"]');
    if (!cur) return;
    var n = Number(cur.dataset.n);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); n = Math.min(RATES.length, n + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); n = Math.max(0, n - 1); }
    else return;
    setDirects(n);
    seg.querySelector('button[data-n="' + n + '"]').focus();
  });

  // rates + example quantities from config (floor in base units, like the spec)
  Array.prototype.forEach.call(levels.querySelectorAll('li'), function (li, i) {
    var rate = li.querySelector('.lv-rate'), ex = li.querySelector('.lv-ex b');
    if (rate) rate.textContent = (RATES[i] / 100) + '%';
    if (ex) ex.textContent = fmt(Math.floor(PER * 100 * RATES[i] / 10000) / 100);
  });
  if (maxEl) maxEl.textContent = (MAX / 100) + '%';
  var talkMax = document.getElementById('talkMax');
  if (talkMax) talkMax.textContent = (MAX / 100) + '%';
  setDirects(3);
})();
