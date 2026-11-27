(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('hwForm'), hUnit = 'cm', wUnit = 'kg';
  var LB = 2.20462, MIN_BMI = 18.5, MAX_BMI = 24.9;

  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function num(id) { var v = $(id).value.trim(); return v === '' ? NaN : Number(v); }
  function clearErrors() {
    document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('.field.bad').forEach(function (f) { f.classList.remove('bad'); });
  }
  function fail(id, ref, msg) { $('e-' + id).textContent = msg; $(ref).closest('.field').classList.add('bad'); return false; }
  function showEmpty() { $('out').hidden = true; $('empty').hidden = false; }

  document.querySelectorAll('.seg.sm').forEach(function (seg) {
    seg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        if (seg.dataset.for === 'h') { hUnit = b.dataset.u; $('hCm').hidden = hUnit !== 'cm'; $('hFt').hidden = hUnit === 'cm'; }
        else { wUnit = b.dataset.u; $('wt').placeholder = 'Optional – e.g. ' + (wUnit === 'kg' ? '68' : '150'); }
        clearErrors(); showEmpty();
      });
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault(); clearErrors();
    var ok = true, cm, hText;
    var age = num('age');
    if (isNaN(age) || age <= 0 || age % 1 !== 0 || age > 120) ok = fail('age', 'age', 'Enter a whole age between 1 and 120.') && ok;

    if (hUnit === 'cm') {
      cm = num('cm');
      if (isNaN(cm) || cm < 50 || cm > 272) ok = fail('h', 'cm', 'Enter a height between 50 and 272 cm.') && ok;
      hText = fmt(cm, 1) + ' cm';
    } else {
      var ft = num('ft'), inch = $('inch').value.trim() === '' ? 0 : num('inch'), tot = ft * 12 + inch;
      if (isNaN(ft) || isNaN(inch) || ft < 0 || inch < 0 || inch >= 12 || tot < 20 || tot > 107) ok = fail('h', 'ft', 'Enter a valid height (e.g. 5 ft 7 in).') && ok;
      cm = tot * 2.54; hText = fmt(ft, 0) + ' ft ' + fmt(inch, 1).replace(/\.0$/, '') + ' in';
    }

    var cw = NaN, hasW = $('wt').value.trim() !== '';
    if (hasW) {
      var w = num('wt'); cw = wUnit === 'kg' ? w : w / LB;
      if (isNaN(w) || w <= 0 || cw < 10 || cw > 500) ok = fail('wt', 'wt', 'Enter a valid weight, or leave it blank.') && ok;
    }
    if (!ok) return;

    $('empty').hidden = true; $('out').hidden = false;
    var out = $('out'); out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';

    if (age < 18) {
      $('noticeCard').hidden = false; $('resBody').hidden = true;
      $('noticeMsg').textContent = 'This adult BMI range is not suitable for children or teenagers. Their healthy weight must be assessed with age- and sex-specific growth charts, so please ask a doctor or paediatrician.';
      return;
    }
    $('noticeCard').hidden = true; $('resBody').hidden = false;

    var m = cm / 100, m2 = m * m, minKg = MIN_BMI * m2, maxKg = MAX_BMI * m2;
    var minLb = minKg * LB, maxLb = maxKg * LB;
    var pk = wUnit === 'kg';

    $('rMain').textContent = pk ? fmt(minKg, 1) + ' – ' + fmt(maxKg, 1) + ' kg' : fmt(minLb, 1) + ' – ' + fmt(maxLb, 1) + ' lbs';
    $('rAlt').textContent = pk ? '≈ ' + fmt(minLb, 1) + ' – ' + fmt(maxLb, 1) + ' lbs' : '≈ ' + fmt(minKg, 1) + ' – ' + fmt(maxKg, 1) + ' kg';
    $('sMin').textContent = fmt(minKg, 1) + ' kg / ' + fmt(minLb, 1) + ' lbs';
    $('sMax').textContent = fmt(maxKg, 1) + ' kg / ' + fmt(maxLb, 1) + ' lbs';
    $('sH').textContent = hText + (hUnit === 'cm' ? '' : ' (' + fmt(cm, 1) + ' cm)') + (hUnit === 'cm' ? ' (' + fmt(cm / 2.54 / 12, 2) + ' ft)' : '');
    $('sKg').textContent = fmt(minKg, 1) + ' – ' + fmt(maxKg, 1) + ' kg';
    $('sLb').textContent = fmt(minLb, 1) + ' – ' + fmt(maxLb, 1) + ' lbs';

    // Indicator: scale from 75% of min to 130% of max
    var lo = minKg * 0.75, hi = maxKg * 1.3, span = hi - lo;
    var p1 = (minKg - lo) / span * 100, p2 = (maxKg - minKg) / span * 100, p3 = 100 - p1 - p2;
    $('z1').style.flexBasis = '0%'; $('z2').style.flexBasis = '0%'; $('z3').style.flexBasis = '0%';
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      $('z1').style.flexBasis = p1 + '%'; $('z2').style.flexBasis = p2 + '%'; $('z3').style.flexBasis = p3 + '%';
    }); });
    var vMin = $('vMin'), vMax = $('vMax');
    vMin.textContent = pk ? fmt(minKg, 1) + ' kg' : fmt(minLb, 1) + ' lbs'; vMin.style.left = p1 + '%';
    vMax.textContent = pk ? fmt(maxKg, 1) + ' kg' : fmt(maxLb, 1) + ' lbs'; vMax.style.left = (p1 + p2) + '%';

    var mark = $('mark'), pos = $('pos');
    if (!isNaN(cw)) {
      var bmi = cw / m2, where = bmi < MIN_BMI ? 'below' : bmi > MAX_BMI ? 'above' : 'within';
      mark.hidden = false; mark.style.left = '0%';
      var pct = Math.max(0, Math.min(100, (cw - lo) / span * 100));
      requestAnimationFrame(function () { requestAnimationFrame(function () { mark.style.left = pct + '%'; }); });
      pos.textContent = 'You entered ' + (pk ? fmt(cw, 1) + ' kg' : fmt(cw * LB, 1) + ' lbs') + ' (BMI ' + fmt(bmi, 1) + '). This is ' + where + ' the BMI screening range for your height. This is a screening result only, not a diagnosis.';
    } else {
      mark.hidden = true;
      pos.textContent = 'You did not enter your current weight, so only the estimated range is shown.';
    }

    $('how').textContent = 'Height ' + fmt(m, 2) + ' m → ' + fmt(m, 2) + ' × ' + fmt(m, 2) + ' = ' + fmt(m2, 3) + '. Minimum = 18.5 × ' + fmt(m2, 3) + ' = ' + fmt(minKg, 1) + ' kg. Maximum = 24.9 × ' + fmt(m2, 3) + ' = ' + fmt(maxKg, 1) + ' kg. Pounds use 1 kg = 2.20462 lbs. This is a general screening estimate for adults, not an individualised ideal weight. BMI does not measure body fat or separate muscle from fat, and pregnancy or medical conditions need professional guidance.';
    if (window.innerWidth <= 900) $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function reset() {
    form.reset(); clearErrors(); showEmpty();
    document.querySelectorAll('.seg.sm').forEach(function (s) { s.querySelector('button').click(); });
    if (window.innerWidth <= 900) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('resetBtn').addEventListener('click', reset);
  $('resetBtn2').addEventListener('click', reset);
  $('recalc').addEventListener('click', function () { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); (hUnit === 'cm' ? $('cm') : $('ft')).focus({ preventScroll: true }); });

  var sel = '.btn-ghost, .seg button, .pills span, .info';
  document.addEventListener('pointerdown', function (e) { var el = e.target.closest(sel); if (el) el.classList.add('press'); });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    document.addEventListener(t, function () {
      document.querySelectorAll('.btn-ghost.press, .seg .press, .pills .press, .info.press').forEach(function (n) {
        n.classList.remove('press'); n.classList.add('pop'); setTimeout(function () { n.classList.remove('pop'); }, 260);
      });
    }, true);
  });
})();
