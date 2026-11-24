(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var unit = 'metric';
  var form = $('bmiForm');

  // Unit switch
  document.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      unit = b.dataset.unit;
      document.querySelectorAll('.seg button').forEach(function (x) {
        var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on);
      });
      var m = unit === 'metric';
      $('hMetric').hidden = !m; $('wMetric').hidden = !m;
      $('hImp').hidden = m; $('wImp').hidden = m;
      clearErrors(); showEmpty();
    });
  });

  function clearErrors() {
    document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('.field.bad').forEach(function (f) { f.classList.remove('bad'); });
  }
  function fail(id, msg) {
    $('e-' + id).textContent = msg;
    $(id).closest('.field').classList.add('bad');
    return false;
  }
  function num(id) {
    var v = $(id).value.trim();
    return v === '' ? NaN : Number(v);
  }
  function showEmpty() { $('out').hidden = true; $('empty').hidden = false; }

  function validate() {
    clearErrors();
    var ok = true, age = num('age');
    if (isNaN(age) || age < 2 || age > 120 || age % 1 !== 0) ok = fail('age', 'Enter a whole age between 2 and 120.') && ok;
    if (unit === 'metric') {
      var cm = num('cm'), kg = num('kg');
      if (isNaN(cm) || cm < 50 || cm > 272) ok = fail('cm', 'Enter a height between 50 and 272 cm.') && ok;
      if (isNaN(kg) || kg < 10 || kg > 500) ok = fail('kg', 'Enter a weight between 10 and 500 kg.') && ok;
    } else {
      var ft = num('ft'), inch = $('inch').value.trim() === '' ? 0 : num('inch'), lb = num('lb');
      if (isNaN(ft) || ft < 0 || ft > 8 || isNaN(inch) || inch < 0 || inch >= 12 || ft * 12 + inch < 20 || ft * 12 + inch > 107)
        ok = fail('ft', 'Enter a valid height (e.g. 5 ft 7 in).') && ok;
      if (isNaN(lb) || lb < 22 || lb > 1100) ok = fail('lb', 'Enter a weight between 22 and 1100 lbs.') && ok;
    }
    return ok;
  }

  function category(b) {
    if (b < 18.5) return { n: 'Underweight', c: '#1aa0ff', t: 'Your BMI is below the healthy range for adults. Being underweight can be linked to nutritional deficiencies or other conditions, so consider speaking with a healthcare professional.' };
    if (b < 25) return { n: 'Normal Weight', c: '#2fb863', t: 'Your BMI is within the healthy range for adults. Keep up balanced eating, regular activity and good sleep.' };
    if (b < 30) return { n: 'Overweight', c: '#f2a900', t: 'Your BMI is above the healthy range for adults. Small, steady changes in diet and activity can help, and a professional can give personal advice.' };
    return { n: 'Obesity', c: '#f23a12', t: 'Your BMI is in the obesity range for adults, which is associated with higher health risks. Please consider discussing a plan with a healthcare professional.' };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var bmi, age = num('age');
    if (unit === 'metric') {
      var m = num('cm') / 100;
      bmi = num('kg') / (m * m);
    } else {
      var inches = num('ft') * 12 + ($('inch').value.trim() === '' ? 0 : num('inch'));
      bmi = num('lb') * 703 / (inches * inches);
    }
    bmi = Math.round(bmi * 10) / 10;
    var cat, badge, text;
    if (age < 20) {
      badge = 'Percentile chart needed'; var color = '#7b6df0';
      text = 'Because you entered an age under 20, adult BMI categories do not apply. For children and teenagers, BMI must be compared with age- and sex-specific percentile charts. Please ask a doctor or paediatrician to interpret this number.';
      cat = { n: badge, c: color, t: text };
    } else cat = category(bmi);

    $('score').textContent = bmi.toFixed(1);
    $('cat').textContent = cat.n; $('cat').style.background = cat.c;
    $('explain').textContent = cat.t;
    var meter = document.querySelector('.meter');
    meter.style.opacity = age < 20 ? '.35' : '1';
    $('empty').hidden = true;
    var out = $('out'); out.hidden = false;
    out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';
    var pos = Math.max(0, Math.min(100, (bmi - 10) / 30 * 100));
    $('marker').style.left = '0%';
    requestAnimationFrame(function () { requestAnimationFrame(function () { $('marker').style.left = pos + '%'; }); });
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
    var first = unit === 'metric' ? $('age') : $('age'); first.focus({ preventScroll: true });
  });

  // Extend shared click animation to the ghost buttons (script.js handles the rest)
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.btn-ghost, .seg button, .pills span, .info');
    if (el) el.classList.add('press');
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
