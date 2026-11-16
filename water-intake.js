(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('wForm'), wUnit = 'kg';
  var KEY = 'fitcalc_water_tracker';
  var OZ = 29.5735, CUP = 236.588, LB = 0.45359237;
  var ACT_ADJ = [0, 250, 500, 750];            // mL, activity level
  var EX_ADJ = [0, 250, 450, 750, 1050];       // mL, ~600 mL/hour × midpoint of duration band
  var target = 0, consumed = 0;

  function fmt(n, d) { return Number(n).toLocaleString('en-US', { maximumFractionDigits: d === undefined ? 0 : d }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function clearErrors() {
    document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('.field.bad').forEach(function (f) { f.classList.remove('bad'); });
  }
  function fail(id, ref, msg) { $('e-' + id).textContent = msg; var f = $(ref).closest('.field'); if (f) f.classList.add('bad'); return false; }
  function showEmpty() { $('out').hidden = true; $('empty').hidden = false; }

  // kg / lbs toggle
  document.querySelectorAll('.seg.sm button').forEach(function (b) {
    b.addEventListener('click', function () {
      wUnit = b.dataset.u;
      document.querySelectorAll('.seg.sm button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      $('wt').placeholder = wUnit === 'kg' ? 'e.g. 68' : 'e.g. 150';
      clearErrors(); showEmpty();
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault(); clearErrors();
    var ok = true, age = Number($('age').value.trim() || NaN), w = Number($('wt').value.trim() || NaN);
    if (isNaN(age) || age <= 0 || age % 1 !== 0 || age > 120) ok = fail('age', 'age', 'Enter a whole age between 1 and 120.') && ok;
    var kg = wUnit === 'kg' ? w : w * LB;
    if (isNaN(w) || w <= 0) ok = fail('wt', 'wt', 'Enter a body weight greater than zero.') && ok;
    else if (kg < 20 || kg > 300) ok = fail('wt', 'wt', 'Enter a realistic weight (20–300 kg or 44–660 lbs).') && ok;
    var act = Number($('act').value), ex = Number($('ex').value);
    if (!(ex >= 0 && ex <= 4) || !(act >= 0 && act <= 3)) ok = false;
    if (!ok) return;

    $('empty').hidden = true; $('out').hidden = false;
    var out = $('out'); out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';

    if (age < 18 || age > 100) {
      $('noticeCard').hidden = false; $('resBody').hidden = true;
      $('noticeMsg').textContent = age < 18
        ? 'This estimator is designed for healthy adults. Children and teenagers have different fluid needs, so please ask a doctor or paediatrician for personalised guidance.'
        : 'This estimator is designed for adults up to 100 years old. Please ask a healthcare professional for personalised hydration guidance.';
      return;
    }
    $('noticeCard').hidden = true; $('resBody').hidden = false;

    var baseline = kg * 33;
    var actAdj = ACT_ADJ[act], exAdj = EX_ADJ[ex], activityAdj = Math.max(actAdj, exAdj);
    var climAdj = Number($('cl').value);
    var total = baseline + activityAdj + climAdj;
    var tMl = Math.round(total / 10) * 10, bMl = Math.round(baseline / 10) * 10;
    var adjMl = tMl - bMl;

    $('rL').textContent = fmt(tMl / 1000, 2);
    $('rChip').textContent = '≈ ' + fmt(tMl) + ' mL per day';
    $('sL').textContent = fmt(tMl / 1000, 2) + ' L';
    $('sMl').textContent = fmt(tMl) + ' mL';
    $('sOz').textContent = fmt(tMl / OZ, 1) + ' fl oz';
    $('sCup').textContent = fmt(tMl / CUP, 1) + ' cups';
    $('sBase').textContent = fmt(bMl) + ' mL';
    $('sAdj').textContent = (adjMl >= 0 ? '+' : '') + fmt(adjMl) + ' mL';

    var how = 'Baseline: ' + fmt(kg, 1) + ' kg × 33 mL = ' + fmt(bMl) + ' mL (a general educational estimate, not a medical formula). ';
    how += activityAdj > 0 ? 'Activity/exercise allowance: +' + fmt(activityAdj) + ' mL (the larger of your activity-level and exercise-duration allowances, never both). ' : 'No activity or exercise allowance added. ';
    how += climAdj > 0 ? 'Hot-climate allowance: +' + fmt(climAdj) + ' mL for extra sweat loss. ' : 'No climate allowance added. ';
    how += 'Total ≈ ' + fmt(tMl) + ' mL. Some of this fluid comes from other drinks and food. Do not force excessive water consumption.';
    if (tMl > 4000) how += ' This is a high figure. Spread fluids through the day and speak to a healthcare professional if unsure.';
    $('how').textContent = how;

    setTarget(tMl, true);
    if (window.innerWidth <= 900) $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function reset() {
    form.reset(); clearErrors(); showEmpty();
    document.querySelector('.seg.sm button[data-u="kg"]').click();
    if (window.innerWidth <= 900) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('resetBtn').addEventListener('click', reset);
  $('resetBtn2').addEventListener('click', reset);
  $('recalc').addEventListener('click', function () { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); $('age').focus({ preventScroll: true }); });

  // ---- Tracker ----
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ d: today(), t: target, c: consumed })); } catch (e) {} }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.d === today() && s.t > 0) { target = s.t; consumed = s.c || 0; render(); $('tracker').hidden = false; }
    } catch (e) {}
  }
  function setTarget(t, isNew) {
    target = t; $('tracker').hidden = false; render(); save();
  }
  function render() {
    var pct = target > 0 ? consumed / target * 100 : 0, shown = Math.min(100, pct);
    $('tTarget').textContent = fmt(target) + ' mL (' + fmt(target / 1000, 2) + ' L)';
    $('tDone').textContent = fmt(consumed) + ' mL';
    $('tLeft').textContent = fmt(Math.max(0, target - consumed)) + ' mL';
    $('barFill').style.width = shown + '%'; $('fill').style.height = shown + '%';
    $('glassPct').textContent = fmt(pct) + '%';
    $('bar').setAttribute('aria-valuenow', Math.round(shown));
    $('tMsg').textContent = consumed >= target && target > 0
      ? 'You have reached your estimated target. There is no need to drink more just to hit a number.'
      : (consumed > 0 ? 'Keep going at a comfortable pace and sip through the day.' : 'Log what you drink to see your progress.');
  }
  function add(ml) {
    consumed += ml; render(); save();
  }
  $('addBtn').addEventListener('click', function () {
    $('e-add').textContent = '';
    var v = Number($('addAmt').value.trim() || NaN), ml = $('addUnit').value === 'l' ? v * 1000 : v;
    if (isNaN(v) || v <= 0) { $('e-add').textContent = 'Enter an amount greater than zero.'; return; }
    if (ml > 3000) { $('e-add').textContent = 'That is a lot at once. Enter 3,000 mL (3 L) or less per entry.'; return; }
    add(Math.round(ml)); $('addAmt').value = '';
  });
  document.querySelectorAll('[data-q]').forEach(function (b) { b.addEventListener('click', function () { $('e-add').textContent = ''; add(Number(b.dataset.q)); }); });
  $('clearLog').addEventListener('click', function () { consumed = 0; render(); save(); });

  // Click animation for page-specific buttons
  var sel = '.btn-ghost, .seg button, .pills span, .info';
  document.addEventListener('pointerdown', function (e) { var el = e.target.closest(sel); if (el) el.classList.add('press'); });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    document.addEventListener(t, function () {
      document.querySelectorAll('.btn-ghost.press, .seg .press, .pills .press, .info.press').forEach(function (n) {
        n.classList.remove('press'); n.classList.add('pop'); setTimeout(function () { n.classList.remove('pop'); }, 260);
      });
    }, true);
  });

  load();
})();
