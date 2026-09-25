/* NodalWaves landing page — behaviour (no dependencies)
   Reads window.NW_CONFIG (config.js). Everything degrades gracefully: the page reads
   correctly with JS disabled, and no number is shown unless it was actually computed. */
(function () {
  'use strict';

  var CFG = window.NW_CONFIG || {};
  var ENTRY = CFG.entry || { amountUsd: 10, currencySymbol: '$', commitmentMonths: 24, promoRatio: 1 };
  var PRICE = CFG.price || { source: 'placeholder', placeholderUsd: null };
  var LINKS = CFG.links || {};
  var FLOW = CFG.flow || { mode: 'prelaunch', integrations: {} };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function fmtMoney(n) { return ENTRY.currencySymbol + (Number.isInteger(n) ? n : n.toFixed(2)); }
  function fmtQty(n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function fmtPrice(p) {
    var d = p >= 1 ? 2 : p >= 0.01 ? 4 : 6;
    return ENTRY.currencySymbol + p.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtTime(d) { return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }

  /* ---------- 1. Config bindings: keep the few shared values in sync ---------- */
  var BIND = {
    'entry.amount': fmtMoney(ENTRY.amountUsd),
    'entry.months': String(ENTRY.commitmentMonths)
  };
  $$('[data-cfg]').forEach(function (el) {
    var v = BIND[el.getAttribute('data-cfg')];
    if (v != null) el.textContent = v;
  });
  $$('[data-link]').forEach(function (a) {
    var key = a.getAttribute('data-link');
    var href = (key === 'passport' && FLOW.passportUrl) || (key === 'firstQuest' && FLOW.firstQuestUrl) || LINKS[key];
    if (href) a.setAttribute('href', href);
  });

  /* ---------- 2. Navigation: mobile menu + current-section highlight ---------- */
  var burger = $('.nav-burger');
  var menu = $('#menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('is-locked', open);
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }
  var navLinks = $$('.nav-links a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-current'); });
        var a = byId[en.target.id];
        if (a) a.classList.add('is-current');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- 3. Price provider (modular; never fakes live data) ---------- */
  function getPath(obj, path) {
    return String(path || '').split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function resolvePrice() {
    var src = PRICE.source || 'placeholder';
    if (src === 'api' && PRICE.api && PRICE.api.url) {
      return fetch(PRICE.api.url, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (json) {
          var p = Number(getPath(json, PRICE.api.jsonPath));
          if (!(p > 0)) throw new Error('No price at ' + PRICE.api.jsonPath);
          return { usd: p, label: PRICE.api.label || 'Live reference price', live: true, at: new Date() };
        });
    }
    if (src === 'static' && PRICE.staticUsd > 0) {
      return Promise.resolve({ usd: PRICE.staticUsd, label: PRICE.staticLabel || 'Reference quote', live: false, at: null });
    }
    if (PRICE.placeholderUsd > 0) {
      return Promise.resolve({ usd: PRICE.placeholderUsd, label: 'Development placeholder', placeholder: true, live: false, at: null });
    }
    return Promise.reject(new Error('No price source configured'));
  }

  /* ---------- 4. Live NODAL calculator ---------- */
  var calc = {
    receipt: $('#calcReceipt'), buy: $('#calcBuy'), promo: $('#calcPromo'), total: $('#calcTotal'),
    status: $('#calcStatus'), priceV: $('#priceValue'), priceS: $('#priceSource')
  };
  function renderCalc(q) {
    var d = PRICE.quantityDecimals || 0;
    var bought = ENTRY.amountUsd / q.usd;
    var promo = bought * (ENTRY.promoRatio == null ? 1 : ENTRY.promoRatio);
    if (calc.buy) calc.buy.textContent = fmtQty(bought, d);
    if (calc.promo) calc.promo.textContent = fmtQty(promo, d);
    if (calc.total) calc.total.textContent = fmtQty(bought + promo, d);
    if (calc.receipt) calc.receipt.classList.remove('is-unavailable');
    if (calc.priceV) calc.priceV.textContent = fmtPrice(q.usd) + ' / NODAL';
    if (calc.priceS) {
      calc.priceS.innerHTML = q.placeholder
        ? '<span class="tag">Dev placeholder</span>Not live market data. Replace with the applicable price source before launch.'
        : (q.live ? q.label + ' · updated ' + fmtTime(q.at) : q.label);
    }
    if (calc.status) calc.status.textContent = 'Estimate at ' + fmtPrice(q.usd) + ' per NODAL. Final quantity depends on the applicable execution price.';
  }
  function failCalc(err) {
    ['buy', 'promo', 'total'].forEach(function (k) { if (calc[k]) calc[k].textContent = '—'; });
    if (calc.receipt) calc.receipt.classList.add('is-unavailable');
    if (calc.priceV) calc.priceV.textContent = 'Unavailable';
    if (calc.priceS) calc.priceS.textContent = 'The reference price could not be loaded right now. No estimate is shown until it can.';
    if (calc.status) calc.status.textContent = '';
    if (window.console) console.warn('[NodalWaves] price unavailable:', err && err.message);
  }
  function refreshCalc() { resolvePrice().then(renderCalc, failCalc); }
  if (calc.receipt) {
    refreshCalc();
    if (PRICE.source === 'api' && PRICE.api && PRICE.api.refreshMs > 0) setInterval(refreshCalc, PRICE.api.refreshMs);
  }

  /* ---------- 5. Rails: light items as they enter, fill the connecting line ---------- */
  $$('.rail').forEach(function (rail) {
    var items = $$('[data-rail-item]', rail);
    if (!items.length) return;
    var lit = 0;
    function setProgress(n) {
      lit = Math.max(lit, n);
      rail.style.setProperty('--progress', items.length > 1 ? (lit - 1) / (items.length - 1) : 1);
    }
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (li) { li.classList.add('lit'); });
      setProgress(items.length);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = items.indexOf(en.target);
        for (var k = 0; k <= i; k++) items[k].classList.add('lit');
        setProgress(i + 1);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0.4 });
    items.forEach(function (li) { io.observe(li); });
  });

  /* ---------- 6. Passport / Quest tabs (WAI-ARIA tabs) ---------- */
  var tablist = $('.device-tabs');
  if (tablist) {
    var tabs = $$('[role="tab"]', tablist);
    function selectTab(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { selectTab(t); });
      t.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(t), n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = tabs.length - 1;
        if (n === null) return;
        e.preventDefault(); selectTab(tabs[n]); tabs[n].focus();
      });
    });
  }

  /* ---------- 7. Growth figure: draw when it comes into view ---------- */
  var grow = $('#grow');
  if (grow) {
    if (!('IntersectionObserver' in window) || reduceMotion) grow.classList.add('in');
    else {
      var gio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { grow.classList.add('in'); gio.disconnect(); } });
      }, { threshold: 0.35 });
      gio.observe(grow);
    }
  }

  /* ---------- 8. Launch-list forms (footer + flow step 3) ---------- */
  function submitLaunch(form) {
    var email = form.querySelector('input[type="email"]');
    if (email && !email.checkValidity()) { email.reportValidity(); return Promise.reject(new Error('invalid')); }
    var done = form.querySelector('.form-done');
    var btn = form.querySelector('button[type="submit"]');
    var finish = function () {
      $$('input, button', form).forEach(function (el) { el.hidden = true; });
      if (done) done.hidden = false;
      form.classList.add('is-done');
    };
    if (!FLOW.launchListEndpoint) { finish(); return Promise.resolve(); }   // front-end demo until the CRM is wired
    if (btn) btn.disabled = true;
    return fetch(FLOW.launchListEndpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, source: location.href })
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); finish(); })
      .catch(function (err) {
        if (btn) btn.disabled = false;
        if (done) { done.hidden = false; done.textContent = 'That didn’t go through. Please try again in a moment.'; }
        throw err;
      });
  }
  $$('[data-launch-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) { e.preventDefault(); submitLaunch(form).catch(function () {}); });
  });

  /* ---------- 9. Start-my-journey flow (7-step dialog with pluggable integrations) ---------- */
  var dlg = $('#flowDialog');
  if (dlg) {
    var steps = $$('.flow-step', dlg);
    var marks = $$('#flowSteps li', dlg);
    var btnNext = $('[data-flow-next]', dlg);
    var btnBack = $('[data-flow-back]', dlg);
    var checks = $$('#flowChecks input', dlg);
    var hint = $('#flowChecksHint', dlg);
    var mode = FLOW.mode === 'live' ? 'live' : 'prelaunch';
    var hooks = FLOW.integrations || {};
    var stepDone = {};   // steps whose action has completed (live mode)
    var current = 1;
    var lastFocus = null;

    $$('[data-flow-mode]', dlg).forEach(function (el) { el.hidden = el.getAttribute('data-flow-mode') !== mode; });

    function allChecked() { return checks.length > 0 && checks.every(function (c) { return c.checked; }); }
    function actionFor(step) { return $('.flow-step[data-step="' + step + '"] [data-flow-action]', dlg); }
    function canAdvance(step) {
      if (step === 2) return allChecked();
      if (step >= 3 && step <= 6 && mode === 'live') return !!stepDone[step];
      return true;
    }
    function render() {
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== current; });
      marks.forEach(function (m) {
        var n = Number(m.getAttribute('data-step'));
        m.classList.toggle('done', n < current);
        m.classList.toggle('now', n === current);
      });
      var last = mode === 'prelaunch' ? 3 : 7;
      btnBack.hidden = current === 1 || current === 7;
      if (current === 7) { btnNext.textContent = 'Done'; }
      else if (current === last && mode === 'prelaunch') { btnNext.textContent = 'Close for now'; }
      else if (current === 2) { btnNext.textContent = 'I understand, continue'; }
      else { btnNext.textContent = 'Continue'; }
      var gated = !canAdvance(current);
      btnNext.setAttribute('aria-disabled', gated ? 'true' : 'false');
      var body = $('#flowBody', dlg); if (body) body.scrollTop = 0;
      var heading = $('.flow-step[data-step="' + current + '"] h3', dlg);
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
    function go(n) { current = Math.max(1, Math.min(7, n)); render(); }
    function openFlow(trigger) {
      lastFocus = trigger || document.activeElement;
      setMenu(false);
      current = 1;
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      document.body.classList.add('is-locked');
      render();
    }
    function closeFlow() {
      if (dlg.open && typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
      document.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    $$('[data-flow-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openFlow(el); });
    });
    if (location.hash === '#start-journey') {   // deep link from other pages (e.g. community.html)
      history.replaceState(null, '', location.pathname + location.search + '#start');
      setTimeout(function () { openFlow(null); }, 250);
    }
    $$('[data-flow-close]', dlg).forEach(function (el) { el.addEventListener('click', closeFlow); });
    dlg.addEventListener('close', function () { document.body.classList.remove('is-locked'); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeFlow(); });   // click on backdrop
    btnBack.addEventListener('click', function () { go(current - 1); });
    btnNext.addEventListener('click', function () {
      if (current === 7 || (mode === 'prelaunch' && current === 3)) { closeFlow(); return; }
      if (!canAdvance(current)) {
        if (current === 2 && hint) { hint.classList.add('is-error'); hint.textContent = 'Please confirm all three statements to continue.'; }
        return;
      }
      go(current + 1);
    });
    checks.forEach(function (c) {
      c.addEventListener('change', function () {
        if (hint && allChecked()) { hint.classList.remove('is-error'); hint.textContent = 'Thanks. You can continue.'; }
        render();
      });
    });

    /* live-mode actions: each button calls its integration hook, then unlocks "Continue" */
    $$('[data-flow-action]', dlg).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-flow-action');
        var step = Number(btn.closest('.flow-step').getAttribute('data-step'));
        var status = btn.parentElement.querySelector('[data-flow-status]');
        var fn = hooks[name];
        if (typeof fn !== 'function') {
          if (status) { status.classList.add('is-error'); status.textContent = 'This step is not connected in this build (NW_CONFIG.flow.integrations.' + name + ').'; }
          return;
        }
        btn.disabled = true;
        if (status) { status.classList.remove('is-error'); status.textContent = 'Working…'; }
        Promise.resolve()
          .then(function () { return fn({ amountUsd: ENTRY.amountUsd, commitmentMonths: ENTRY.commitmentMonths }); })
          .then(function (res) {
            stepDone[step] = true;
            if (status) status.textContent = (res && res.message) || 'Done.';
            render();
          })
          .catch(function (err) {
            btn.disabled = false;
            if (status) { status.classList.add('is-error'); status.textContent = (err && err.message) || 'Something went wrong. Please try again.'; }
          });
      });
    });
  }

  /* ---------- 10. Scroll reveals: resting state is visible; only defer what is below the fold ---------- */
  if ('IntersectionObserver' in window && !reduceMotion && window.innerHeight > 0) {
    var items = $$('[data-reveal]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal-pending');
        io.observe(el);
      } else {
        el.classList.add('in');
      }
    });
    setTimeout(function () {   // safety: never leave anything hidden
      $$('.reveal-pending:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 4000);
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }
})();
