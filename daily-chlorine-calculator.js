(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('clForm');
  var mode = 'direct', lmode = 'gl';
  var GAL_L = 3.785411784, FT3_L = 28.316847, ML_FLOZ = 29.5735295625, G_OZ = 28.349523125;

  function num(id) { var v = $(id).value.trim(); return v === '' ? NaN : Number(v); }
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { maximumFractionDigits: d === undefined ? 1 : d }); }
  function clearErrors() {
    document.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('.field.bad').forEach(function (f) { f.classList.remove('bad'); });
  }
  function fail(id, ref, msg) { $('e-' + id).textContent = msg; $(ref).closest('.field').classList.add('bad'); return false; }
  function showEmpty() { $('out').hidden = true; $('empty').hidden = false; }

  // Segmented toggles
  document.querySelectorAll('.seg.sm').forEach(function (seg) {
    seg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        seg.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        if (seg.dataset.for === 'mode') { mode = b.dataset.v; $('vDirect').hidden = mode !== 'direct'; $('vDims').hidden = mode !== 'dims'; }
        else { lmode = b.dataset.v; $('gl').hidden = lmode !== 'gl'; $('lPct').hidden = lmode !== 'pct'; }
        clearErrors(); showEmpty();
      });
    });
  });
  $('shape').addEventListener('change', function () {
    var c = $('shape').value === 'circle';
    $('gL').hidden = c; $('gW').hidden = c; $('gR').hidden = !c;
  });
  $('prod').addEventListener('change', function () {
    var p = $('prod').value;
    $('sLiquid').hidden = p !== 'liquid'; $('sGran').hidden = p !== 'granular'; $('sTab').hidden = p !== 'tablet';
    clearErrors(); showEmpty();
  });

  // Live difference display
  function diff() {
    var c = num('cur'), t = num('tgt'), d = $('diff');
    if (isNaN(c) || isNaN(t)) { d.innerHTML = 'Required increase: <strong>–</strong>'; d.classList.remove('zero'); return; }
    var inc = t - c;
    if (inc > 0) { d.innerHTML = 'Required increase: <strong>' + fmt(inc, 2) + ' ppm</strong>'; d.classList.remove('zero'); }
    else { d.innerHTML = 'Difference: <strong>' + fmt(inc, 2) + ' ppm</strong> – no increase needed'; d.classList.add('zero'); }
  }
  $('cur').addEventListener('input', diff); $('tgt').addEventListener('input', diff);

  function readVolume() {
    var litres;
    if (mode === 'direct') {
      var v = num('vol'), u = $('vUnit').value;
      if (isNaN(v) || v <= 0 || v > 1e8) { fail('vol', 'vol', 'Enter a pool volume greater than zero.'); return null; }
      litres = u === 'L' ? v : u === 'm3' ? v * 1000 : v * GAL_L;
    } else {
      var ft = $('dUnit').value === 'ft', circ = $('shape').value === 'circle', d = num('dep'), area;
      if (circ) { var r = num('rad'); if (isNaN(r) || r <= 0) { fail('vol', 'vol', 'Enter a valid radius greater than zero.'); return null; } area = Math.PI * r * r; }
      else { var l = num('len'), w = num('wid'); if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) { fail('vol', 'vol', 'Enter a valid length and width greater than zero.'); return null; } area = l * w; }
      if (isNaN(d) || d <= 0) { fail('vol', 'vol', 'Enter an average depth greater than zero.'); return null; }
      litres = area * d * (ft ? FT3_L : 1000);
      if (litres > 1e8) { fail('vol', 'vol', 'These dimensions look too large. Please check them.'); return null; }
    }
    return litres;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    var ok = true, vol = readVolume(); if (vol === null) ok = false;
    var cur = num('cur'), tgt = num('tgt');
    if (isNaN(cur) || cur < 0 || cur > 100) ok = fail('cur', 'cur', 'Enter 0 or more (max 100 ppm).') && ok;
    if (isNaN(tgt) || tgt < 0 || tgt > 100) ok = fail('tgt', 'tgt', 'Enter 0 or more (max 100 ppm).') && ok;

    var prod = $('prod').value, pct = NaN, gL = NaN, strText = '', unsupported = false;
    if (prod === 'liquid') {
      if (lmode === 'gl') {
        gL = num('gl');
        if (isNaN(gL) || gL <= 0 || gL > 1000) { ok = fail('s', 'gl', 'Enter the available chlorine in g/L (greater than zero).') && ok; }
        else strText = fmt(gL, 2) + ' g/L available chlorine';
      } else {
        var lp = num('lp'), dn = num('dens');
        if (isNaN(lp) || lp <= 0 || lp > 100) ok = fail('s', 'gl', 'Enter available chlorine % between 0 and 100.') && ok;
        else if (isNaN(dn) || dn <= 0 || dn > 3) ok = fail('s', 'gl', 'Enter the product density in kg/L (required for % conversion).') && ok;
        else { gL = lp / 100 * dn * 1000; strText = fmt(lp, 2) + '% × ' + fmt(dn, 3) + ' kg/L = ' + fmt(gL, 2) + ' g/L'; }
      }
    } else if (prod === 'granular') {
      pct = num('gp');
      if (isNaN(pct) || pct <= 0 || pct > 100) ok = fail('g', 'gp', 'Enter available chlorine % between 0 and 100.') && ok;
      else strText = fmt(pct, 2) + '% available chlorine';
    } else {
      var tv = $('tp').value.trim();
      if (tv === '') { unsupported = true; strText = 'Not provided'; }
      else { pct = Number(tv); if (isNaN(pct) || pct <= 0 || pct > 100) ok = fail('t', 'tp', 'Enter available chlorine % between 0 and 100, or leave blank.') && ok; else strText = fmt(pct, 2) + '% available chlorine'; }
    }
    if (!ok) return;

    var inc = tgt - cur, prodName = prod === 'liquid' ? 'Liquid chlorine' : prod === 'granular' ? 'Granular chlorine' : 'Tablets / other';
    $('sVol').textContent = fmt(vol, 0) + ' L (' + fmt(vol / GAL_L, 0) + ' US gal)';
    $('sCur').textContent = fmt(cur, 2) + ' ppm'; $('sTgt').textContent = fmt(tgt, 2) + ' ppm';
    $('sInc').textContent = inc > 0 ? fmt(inc, 2) + ' ppm' : 'None needed';
    $('sProd').textContent = prodName; $('sStr').textContent = strText;

    var qtyWrap = $('qtyWrap'), msg = $('msg'), alt = $('qAlt'), how = $('how');
    msg.className = 'msg'; alt.hidden = false;
    if (inc <= 0) {
      qtyWrap.hidden = true; msg.hidden = false; alt.hidden = true;
      msg.textContent = 'No additional chlorine is required to reach your selected target level.';
      how.textContent = 'Your target (' + fmt(tgt, 2) + ' ppm) is equal to or lower than your current level (' + fmt(cur, 2) + ' ppm), so no dosage was calculated. Test your water to confirm your readings.';
    } else if (unsupported) {
      qtyWrap.hidden = true; msg.hidden = false; alt.hidden = true; msg.className = 'msg warn';
      msg.textContent = 'This product cannot be accurately calculated by this tool.';
      how.textContent = 'Chlorine tablets and other products vary in available chlorine and dissolution rate, and no reliable strength was entered. Use the manufacturer’s label and instructions. If the manufacturer gives an available chlorine percentage for your exact product, enter it and calculate again.';
    } else {
      var active = inc * vol / 1000; // grams of active chlorine (1 ppm ≈ 1 mg/L)
      qtyWrap.hidden = false; msg.hidden = true;
      if (prod === 'liquid') {
        var ml = active / gL * 1000;
        $('qty').textContent = fmt(ml, 0); $('qUnit').textContent = 'mL';
        alt.textContent = '≈ ' + fmt(ml / 1000, 2) + ' L · ' + fmt(ml / ML_FLOZ, 1) + ' US fl oz';
        how.textContent = 'Active chlorine needed = ' + fmt(inc, 2) + ' ppm × ' + fmt(vol, 0) + ' L ÷ 1000 = ' + fmt(active, 1) + ' g. Liquid needed = ' + fmt(active, 1) + ' g ÷ ' + fmt(gL, 2) + ' g/L × 1000 = ' + fmt(ml, 0) + ' mL.';
      } else {
        var g = active / (pct / 100);
        $('qty').textContent = fmt(g, 0); $('qUnit').textContent = 'grams';
        alt.textContent = '≈ ' + fmt(g / 1000, 3) + ' kg · ' + fmt(g / G_OZ, 1) + ' oz';
        how.textContent = 'Active chlorine needed = ' + fmt(inc, 2) + ' ppm × ' + fmt(vol, 0) + ' L ÷ 1000 = ' + fmt(active, 1) + ' g. Product needed = ' + fmt(active, 1) + ' g ÷ (' + fmt(pct, 2) + ' ÷ 100) = ' + fmt(g, 0) + ' g of product.' +
          (prod === 'tablet' ? ' Tablets dissolve slowly, so this is only the total product weight that contains this much available chlorine, not a dosing schedule.' : '');
      }
      how.textContent += ' This is a theoretical estimate. Follow the product label and pool safety instructions, and retest your water.';
      if (tgt > 10) how.textContent += ' Your target is unusually high; check your label and local guidance.';
    }
    $('empty').hidden = true;
    var out = $('out'); out.hidden = false;
    out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';
    if (window.innerWidth <= 900) $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function reset() {
    form.reset(); clearErrors(); showEmpty(); diff();
    ['shape', 'prod'].forEach(function (id) { $(id).dispatchEvent(new Event('change')); });
    document.querySelectorAll('.seg.sm').forEach(function (s) { s.querySelector('button').click(); });
    if (window.innerWidth <= 900) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('resetBtn').addEventListener('click', reset);
  $('resetBtn2').addEventListener('click', reset);
  $('recalc').addEventListener('click', function () {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    (mode === 'direct' ? $('vol') : $('dep')).focus({ preventScroll: true });
  });

  var sel = '.btn-ghost, .seg button, .info';
  document.addEventListener('pointerdown', function (e) { var el = e.target.closest(sel); if (el) el.classList.add('press'); });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    document.addEventListener(t, function () {
      document.querySelectorAll('.btn-ghost.press, .seg .press, .info.press').forEach(function (n) {
        n.classList.remove('press'); n.classList.add('pop'); setTimeout(function () { n.classList.remove('pop'); }, 260);
      });
    }, true);
  });
})();
