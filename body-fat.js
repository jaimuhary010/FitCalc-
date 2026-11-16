(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('bfForm'), hUnit = 'cm', cUnit = 'cm', wUnit = 'kg';
  var CIRC = 2 * Math.PI * 52, LB = 2.20462;

  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function num(id) { var v = $(id).value.trim(); return v === '' ? NaN : Number(v); }
  function clearErrors() {
    document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('.field.bad').forEach(function (f) { f.classList.remove('bad'); });
  }
  function fail(id, ref, msg) { $('e-' + id).textContent = msg; $(ref).closest('.field').classList.add('bad'); return false; }
  function showEmpty() { $('out').hidden = true; $('empty').hidden = false; }

  // Pure calculation (U.S. Navy / Hodgdon-Beckett). These coefficients are defined for CENTIMETRES.
  function navy(sex, h, neck, waist, hip) {
    var d;
    if (sex === 'male') {
      d = 1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h);
      return 495 / d - 450;
    }
    d = 1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h);
    return 495 / d - 450;
  }

  // Toggles
  document.querySelectorAll('.seg.sm').forEach(function (seg) {
    seg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        var k = seg.dataset.for;
        if (k === 'h') { hUnit = b.dataset.u; $('hCm').hidden = hUnit !== 'cm'; $('hFt').hidden = hUnit === 'cm'; }
        else if (k === 'c') {
          cUnit = b.dataset.u;
          var ex = cUnit === 'cm' ? ['38', '85', '98'] : ['15', '33.5', '38.5'];
          ['neck', 'waist', 'hip'].forEach(function (id, i) { $(id).placeholder = 'e.g. ' + ex[i]; });
        } else { wUnit = b.dataset.u; $('wt').placeholder = 'Optional – e.g. ' + (wUnit === 'kg' ? '75' : '165'); }
        clearErrors(); showEmpty();
      });
    });
  });
  document.querySelectorAll('input[name="sex"]').forEach(function (r) {
    r.addEventListener('change', function () { $('hipWrap').hidden = r.value !== 'female' || !r.checked; clearErrors(); showEmpty(); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault(); clearErrors();
    var ok = true, sexEl = form.querySelector('input[name="sex"]:checked'), sex = sexEl ? sexEl.value : null;
    if (!sex) ok = fail('sex', 'cm', 'Please choose the male or female equation.') && ok;

    var hCm;
    if (hUnit === 'cm') hCm = num('cm');
    else { var ft = num('ft'), inch = $('inch').value.trim() === '' ? 0 : num('inch'); hCm = (isNaN(ft) || isNaN(inch) || ft < 0 || inch < 0 || inch >= 12) ? NaN : (ft * 12 + inch) * 2.54; }
    if (isNaN(hCm) || hCm < 100 || hCm > 250) ok = fail('h', hUnit === 'cm' ? 'cm' : 'ft', 'Enter a valid height (100–250 cm, or about 3 ft 4 in to 8 ft 2 in).') && ok;

    var k = cUnit === 'cm' ? 1 : 2.54;
    var neck = num('neck') * k, waist = num('waist') * k, hip = num('hip') * k;
    if (isNaN(neck) || neck < 20 || neck > 70) ok = fail('neck', 'neck', 'Enter a realistic neck measurement (about 20–70 cm / 8–27.5 in).') && ok;
    if (isNaN(waist) || waist < 40 || waist > 250) ok = fail('waist', 'waist', 'Enter a realistic waist measurement (about 40–250 cm / 16–98 in).') && ok;
    if (sex === 'female' && (isNaN(hip) || hip < 50 || hip > 250)) ok = fail('hip', 'hip', 'Hip is required for the female equation (about 50–250 cm / 20–98 in).') && ok;
    if (ok && sex === 'male' && waist <= neck) ok = fail('waist', 'waist', 'For the male equation, waist must be greater than neck.') && ok;
    if (ok && sex === 'female' && waist + hip <= neck) ok = fail('waist', 'waist', 'For the female equation, waist + hip must be greater than neck.') && ok;

    var hasW = $('wt').value.trim() !== '', w = num('wt'), wKg = wUnit === 'kg' ? w : w / LB;
    if (hasW && (isNaN(w) || w <= 0 || wKg < 20 || wKg > 500)) ok = fail('wt', 'wt', 'Enter a valid weight, or leave it blank.') && ok;
    if (!ok) return;

    var bf = navy(sex, hCm, neck, waist, hip);
    if (!isFinite(bf) || bf < 2 || bf > 70) {
      fail('waist', 'waist', 'These measurements give an unrealistic result (' + (isFinite(bf) ? fmt(bf, 1) + '%' : 'invalid') + '). Please re-measure and check your units.');
      return;
    }

    $('empty').hidden = true; $('out').hidden = false;
    var out = $('out'); out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';
    $('bfVal').textContent = fmt(bf, 1);
    var eq = sex === 'male' ? 'Male equation (U.S. Navy)' : 'Female equation (U.S. Navy)';
    $('eqChip').textContent = eq; $('sEq').textContent = eq;
    var fg = $('ringFg'); fg.style.strokeDashoffset = CIRC;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fg.style.strokeDashoffset = CIRC * (1 - bf / 100); }); });

    function both(cm) { return fmt(cm, 1) + ' cm / ' + fmt(cm / 2.54, 1) + ' in'; }
    $('sH').textContent = both(hCm); $('sN').textContent = both(neck); $('sW').textContent = both(waist);
    $('sHipBox').hidden = sex !== 'female'; if (sex === 'female') $('sHip').textContent = both(hip);

    var show = hasW;
    $('sWtBox').hidden = $('sFatBox').hidden = $('sLeanBox').hidden = !show;
    if (show) {
      var fat = w * bf / 100, lean = w - fat, u = wUnit === 'kg' ? ' kg' : ' lbs';
      $('sWt').textContent = fmt(w, 1) + u; $('sFat').textContent = fmt(fat, 1) + u; $('sLean').textContent = fmt(lean, 1) + u;
    }
    if (window.innerWidth <= 900) $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function reset() {
    form.reset(); clearErrors(); showEmpty(); $('hipWrap').hidden = true;
    document.querySelectorAll('.seg.sm').forEach(function (s) { s.querySelector('button').click(); });
    if (window.innerWidth <= 900) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('resetBtn').addEventListener('click', reset);
  $('resetBtn2').addEventListener('click', reset);
  $('recalc').addEventListener('click', function () { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); $('neck').focus({ preventScroll: true }); });

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
