(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('bmrForm');
  var hUnit = 'cm', wUnit = 'kg';
  var ACT = {
    '1.2': 'Sedentary', '1.375': 'Lightly Active', '1.55': 'Moderately Active',
    '1.725': 'Very Active', '1.9': 'Extra Active'
  };

  // Unit toggles (height / weight)
  document.querySelectorAll('.seg.sm').forEach(function (seg) {
    seg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (x) {
          x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b);
        });
        if (seg.dataset.for === 'h') {
          hUnit = b.dataset.u; $('hCm').hidden = hUnit !== 'cm'; $('hFt').hidden = hUnit === 'cm';
        } else {
          wUnit = b.dataset.u;
          var w = $('kg'); w.placeholder = wUnit === 'kg' ? 'e.g. 68' : 'e.g. 150';
          document.querySelector('label[for="kg"]').textContent = 'Weight';
        }
        clearErrors(); showEmpty();
      });
    });
  });

  function clearErrors() {
    document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('.field.bad').forEach(function (f) { f.classList.remove('bad'); });
  }
  function fail(id, ref, msg) { $('e-' + id).textContent = msg; $(ref).closest('.field').classList.add('bad'); return false; }
  function num(id) { var v = $(id).value.trim(); return v === '' ? NaN : Number(v); }
  function showEmpty() { $('out').hidden = true; $('empty').hidden = false; }
  function round(n) { return Math.round(n).toLocaleString('en-US'); }

  function readValues() {
    var ok = true, sexEl = form.querySelector('input[name="sex"]:checked'), v = {};
    clearErrors();
    if (!sexEl) ok = fail('sex', 'age', 'Please choose the male or female equation.') && ok;
    v.sex = sexEl ? sexEl.value : null;

    v.age = num('age');
    if (isNaN(v.age) || v.age <= 0 || v.age % 1 !== 0 || v.age < 5 || v.age > 120) ok = fail('age', 'age', 'Enter a whole age between 5 and 120.') && ok;

    if (hUnit === 'cm') {
      v.cm = num('cm');
      if (isNaN(v.cm) || v.cm < 50 || v.cm > 272) ok = fail('h', 'cm', 'Enter a height between 50 and 272 cm.') && ok;
    } else {
      var ft = num('ft'), inch = $('inch').value.trim() === '' ? 0 : num('inch'), tot = ft * 12 + inch;
      if (isNaN(ft) || isNaN(inch) || ft < 0 || inch < 0 || inch >= 12 || tot < 20 || tot > 107) ok = fail('h', 'ft', 'Enter a valid height (e.g. 5 ft 7 in).') && ok;
      v.cm = tot * 2.54;
    }

    var w = num('kg');
    if (wUnit === 'kg') {
      if (isNaN(w) || w < 10 || w > 500) ok = fail('w', 'kg', 'Enter a weight between 10 and 500 kg.') && ok;
      v.kg = w;
    } else {
      if (isNaN(w) || w < 22 || w > 1100) ok = fail('w', 'kg', 'Enter a weight between 22 and 1100 lbs.') && ok;
      v.kg = w * 0.45359237;
    }
    v.ok = ok;
    return v;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = readValues();
    if (!v.ok) return;
    // Mifflin-St Jeor
    var bmr = 10 * v.kg + 6.25 * v.cm - 5 * v.age + (v.sex === 'male' ? 5 : -161);
    if (!(bmr > 0)) { fail('h', 'cm', 'These values give an unrealistic result. Please check your entries.'); return; }

    var sexName = v.sex === 'male' ? 'Male equation (+5)' : 'Female equation (−161)';
    $('bmrVal').textContent = round(bmr);
    $('formulaChip').textContent = 'Mifflin-St Jeor · ' + sexName;
    $('bmrText').textContent = 'Your body is estimated to burn about ' + round(bmr) + ' calories per day at complete rest to power breathing, circulation and cell repair.' +
      (v.age < 18 ? ' Note: this equation was developed for adults, so the estimate may be less accurate for under-18s.' : '') +
      ' This is an estimate, not an exact measurement. It is not a calorie target.';

    var mult = $('act').value, tcard = $('tdeeCard');
    if (mult) {
      var tdee = bmr * Number(mult);
      $('tdeeVal').textContent = round(tdee);
      $('actChip').textContent = ACT[mult] + ' · BMR × ' + mult;
      $('tdeeText').textContent = 'Including your activity, you are estimated to burn about ' + round(tdee) + ' calories per day. Eating around this amount would roughly maintain your current weight.';
      tcard.hidden = false;
    } else tcard.hidden = true;

    $('empty').hidden = true;
    var out = $('out'); out.hidden = false;
    out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';
    if (window.innerWidth <= 900) $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function reset() {
    form.reset(); clearErrors(); showEmpty();
    if (window.innerWidth <= 900) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('resetBtn').addEventListener('click', reset);
  $('resetBtn2').addEventListener('click', reset);
  $('recalc').addEventListener('click', function () {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('age').focus({ preventScroll: true });
  });

  // Click animation for page-specific buttons (shared script.js covers the rest)
  var sel = '.btn-ghost, .seg button, .pills span, .info';
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest(sel); if (el) el.classList.add('press');
  });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    document.addEventListener(t, function () {
      document.querySelectorAll('.btn-ghost.press, .seg .press, .pills .press, .info.press').forEach(function (n) {
        n.classList.remove('press'); n.classList.add('pop');
        setTimeout(function () { n.classList.remove('pop'); }, 260);
      });
    }, true);
  });
})();
