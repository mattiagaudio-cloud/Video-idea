// V10 — Crime-action game trailer, vertical 1080×1920. An original illustration look in the genre: thick ink outlines, flat colour,
// halftone shading, a sunset coastal city, letterbox, slow camera drifts and hard title slams. No official logos, fonts or characters.
import { clamp, lerp, seg, eo, ei, back, hash, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const W = 1080, H = 1920, BAR = 110;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W, X = cv.getContext('2d');
const C = { ink: '#120d14', sky0: '#2a1a5e', sky1: '#a93a7a', sky2: '#ff7a4a', sky3: '#ffc25a', sea: '#1f6f8a', sea2: '#2aa3a8', sun: '#ffe08a', city: '#3a1f4f', city2: '#25143a',
  win: '#ffd27a', skin: '#d9926a', skin2: '#a8603f', hair: '#1a1214', shirt: '#ff5d8f', shirt2: '#c23a6a', flower: '#ffd23a', car: '#e3262f', car2: '#9a1420', chrome: '#e8e3f0',
  palm: '#1b0f22', road: '#3a2b3f', gold: '#ffc23a', green: '#3ae07a', white: '#fff8ee' };
const A = (t, t0, d = .3) => seg(t, t0, t0 + d);

// ———— ink + halftone ————
const dots = (() => { const c = document.createElement('canvas'); c.width = c.height = 14; const g = c.getContext('2d'); g.fillStyle = 'rgba(18,13,20,.55)'; g.beginPath(); g.arc(7, 7, 3.6, 0, TAU); g.fill(); return c; })();
let DOT = null;
function ink(pathFn, fill, lw = 7, shadeFn = null) {
  pathFn(); X.fillStyle = fill; X.fill();
  if (shadeFn) { X.save(); pathFn(); X.clip(); shadeFn(); DOT = DOT || X.createPattern(dots, 'repeat'); X.fillStyle = DOT; X.fill(); X.restore(); }
  pathFn(); X.lineWidth = lw; X.strokeStyle = C.ink; X.lineJoin = 'round'; X.stroke();
}
const P = pts => () => { X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); };
const E = (x, y, rx, ry, r = 0) => () => { X.beginPath(); X.ellipse(x, y, rx, ry, r, 0, TAU); };
const Rr = (x, y, w, h, r = 0) => () => { X.beginPath(); X.roundRect(x, y, w, h, r); };

// trailer title: condensed, italic, white with a heavy ink outline and drop
function slam(txt, x, y, px, a, fill = C.white, rot = -.06) {
  if (a <= 0) return; const k = a < 1 ? lerp(1.8, 1, eo(a)) : 1;
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(k, k); X.transform(1, 0, -.18, 1, 0, 0);
  X.font = `${px}px 'Anton'`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineJoin = 'round';
  X.fillStyle = C.ink; X.fillText(txt, px * .05, px * .06); X.lineWidth = px * .1; X.strokeStyle = C.ink; X.strokeText(txt, 0, 0);
  const g = X.createLinearGradient(0, -px / 2, 0, px / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(1, fill); X.fillStyle = g; X.fillText(txt, 0, 0);
  X.restore();
  if (a < 1) { X.fillStyle = `rgba(255,240,200,${.5 * (1 - a)})`; X.fillRect(0, 0, W, H); }
}
function flare(x, y, s, a = 1) { if (a <= 0) return; X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = a;
  const g = X.createRadialGradient(x, y, 0, x, y, 260 * s); g.addColorStop(0, 'rgba(255,240,200,.9)'); g.addColorStop(.2, 'rgba(255,160,90,.35)'); g.addColorStop(1, 'rgba(255,120,80,0)'); X.fillStyle = g; X.fillRect(x - 300 * s, y - 300 * s, 600 * s, 600 * s);
  X.fillStyle = 'rgba(255,220,160,.5)'; X.fillRect(x - 600 * s, y - 3, 1200 * s, 6); X.restore(); }

// ———— the coastal city at sunset (painted once, then slid) ————
const city = document.createElement('canvas'); city.width = 1500; city.height = 1300;
(() => { const g = city.getContext('2d'); const s = g.createLinearGradient(0, 0, 0, 900); s.addColorStop(0, C.sky0); s.addColorStop(.45, C.sky1); s.addColorStop(.8, C.sky2); s.addColorStop(1, C.sky3);
  g.fillStyle = s; g.fillRect(0, 0, 1500, 1300); g.fillStyle = C.sun; g.beginPath(); g.arc(750, 780, 190, 0, TAU); g.fill();
  g.fillStyle = C.sky1; for (let i = 0; i < 6; i++) g.fillRect(560, 700 + i * 30, 380, 6 + i * 2);
  for (const [col, base, hmin, hmax] of [[C.city, 900, 120, 380], [C.city2, 920, 60, 240]]) { let x = 0, k = 0; while (x < 1500) { const w = 60 + hash(k) * 110, h = hmin + hash(k + 9) * (hmax - hmin); g.fillStyle = col; g.fillRect(x, base - h, w, h + 10);
      for (let wy = base - h + 16; wy < base - 10; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 16) if (hash(wx * .9 + wy * 1.7) < .3) { g.fillStyle = C.win; g.fillRect(wx, wy, 7, 10); g.fillStyle = col; }
      x += w + 4; k++; } }
  const sea = g.createLinearGradient(0, 910, 0, 1300); sea.addColorStop(0, C.sea2); sea.addColorStop(1, C.sea); g.fillStyle = sea; g.fillRect(0, 910, 1500, 390);
  g.fillStyle = 'rgba(255,224,138,.6)'; for (let i = 0; i < 26; i++) { const w = 260 - i * 8; g.fillRect(750 - w / 2 + (hash(i) - .5) * 40, 920 + i * 14, w, 4); }
  g.strokeStyle = C.ink; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 912); g.lineTo(1500, 912); g.stroke(); })();
function palm(x, y, s, t, ph = 0) { X.save(); X.translate(x, y); X.scale(s, s);
  X.lineCap = 'round'; X.strokeStyle = C.palm; X.lineWidth = 34; X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(40, -300, 110, -620); X.stroke();
  X.fillStyle = C.palm; const sw = Math.sin(t * 1.4 + ph) * .06;
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * .45 + sw; X.save(); X.translate(110, -620); X.rotate(a); X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(150, -60, 320, 50); X.quadraticCurveTo(150, -10, 0, 12); X.fill(); X.restore(); }
  X.restore(); }

// ———— the protagonist (original): slick hair, aviators, open floral shirt, gold chain ————
function hero(x, y, s, t, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  // shirt + chain
  ink(P([[-300, 520], [-250, 200], [-110, 140], [110, 140], [250, 200], [300, 520]]), C.shirt, 8, () => { X.beginPath(); X.rect(60, 120, 300, 420); });
  X.fillStyle = C.flower; for (const [fx, fy] of [[-200, 300], [-120, 430], [180, 260], [220, 420], [-240, 470]]) for (let p = 0; p < 5; p++) { X.beginPath(); X.ellipse(fx + Math.cos(p / 5 * TAU) * 18, fy + Math.sin(p / 5 * TAU) * 18, 14, 9, p / 5 * TAU, 0, TAU); X.fill(); }
  ink(P([[-90, 140], [0, 330], [90, 140]]), C.skin, 6, () => { X.beginPath(); X.rect(30, 120, 100, 240); });
  X.strokeStyle = C.gold; X.lineWidth = 9; X.beginPath(); X.arc(0, 150, 95, .35, Math.PI - .35); X.stroke(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke();
  // neck + head: square jaw
  ink(P([[-55, 40], [55, 40], [62, 160], [-62, 160]]), C.skin, 7, () => { X.beginPath(); X.rect(10, 30, 80, 140); });
  ink(P([[-125, -190], [-130, -40], [-100, 60], [-40, 110], [40, 110], [100, 60], [128, -40], [125, -190], [0, -230]]), C.skin, 8, () => { X.beginPath(); X.moveTo(40, -240); X.lineTo(140, -240); X.lineTo(140, 120); X.lineTo(20, 120); X.closePath(); });
  X.fillStyle = 'rgba(18,13,20,.35)'; for (let i = 0; i < 40; i++) { X.beginPath(); X.arc(-90 + hash(i) * 180, 40 + hash(i + 3) * 60, 2.2, 0, TAU); X.fill(); }   // stubble
  // slick hair with a pompadour
  ink(P([[-135, -120], [-140, -220], [-90, -300], [20, -330], [120, -290], [150, -200], [135, -120], [110, -200], [40, -215], [-40, -205], [-110, -190]]), C.hair, 8);
  X.strokeStyle = '#5a4a6a'; X.lineWidth = 6; X.beginPath(); X.moveTo(-80, -280); X.quadraticCurveTo(20, -315, 110, -270); X.stroke();
  // nose, mouth (on the voice)
  X.strokeStyle = C.ink; X.lineWidth = 6; X.beginPath(); X.moveTo(5, -40); X.lineTo(22, 10); X.lineTo(-2, 16); X.stroke();
  const m = clamp(o.mouth || 0);
  if (m > .15) ink(E(5, 62, 34 + (o.grin ? 12 : 0), 6 + m * 22), '#5a1626', 5); else { X.lineWidth = 7; X.beginPath(); X.moveTo(-36, 58 - (o.grin ? 8 : 0)); X.quadraticCurveTo(5, 66 + (o.grin ? 14 : 0), 46, 54 - (o.grin ? 10 : 0)); X.stroke(); }
  // aviators (lowered = eyes visible)
  const low = o.lower || 0, gy = -70 + low * 40;
  if (low > .3) { for (const ex of [-55, 55]) { ink(E(ex, -82, 26, 16), '#fffaf0', 4); X.fillStyle = C.ink; X.beginPath(); X.arc(ex + 4, -80, 9, 0, TAU); X.fill(); }
    X.lineWidth = 8; X.beginPath(); X.moveTo(-90, -118); X.lineTo(-25, -122); X.moveTo(25, -124); X.lineTo(95, -116); X.stroke(); }
  for (const sd of [-1, 1]) { const lens = P([[sd * 12, gy - 30], [sd * 110, gy - 34], [sd * 104, gy + 18], [sd * 64, gy + 40], [sd * 22, gy + 16]]);
    lens(); const g = X.createLinearGradient(0, gy - 34, 0, gy + 40); g.addColorStop(0, '#2a1a5e'); g.addColorStop(.5, '#ff7a4a'); g.addColorStop(1, '#ffc25a'); X.fillStyle = g; X.fill(); X.lineWidth = 7; X.strokeStyle = C.ink; X.stroke();
    X.fillStyle = 'rgba(255,255,255,.7)'; X.fillRect(sd * 40 - 10, gy - 22, 18, 6); }
  X.lineWidth = 6; X.beginPath(); X.moveTo(-12, gy - 28); X.lineTo(12, gy - 28); X.stroke();
  if (o.point) { // finger pointing at the lens, foreshortened
    const k = o.point; X.save(); X.translate(230 * k + 60, 420 - 180 * k); X.scale(.7 + .7 * k, .7 + .7 * k);
    ink(Rr(-70, -40, 140, 110, 40), C.skin, 7, () => { X.beginPath(); X.rect(20, -50, 80, 140); }); ink(E(-10, -70, 30, 46), C.skin, 6); X.restore(); }
  X.restore();
}
// the convertible (an original design), side view, facing right
function car(x, y, s, t, withHero, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s); const bump = Math.sin(t * 22) * 2;
  X.translate(0, bump);
  if (withHero) { X.save(); hero(-40, -330, .55, t, o); X.restore(); }
  ink(P([[-420, -40], [-400, -150], [-120, -170], [-60, -240], [120, -240], [200, -170], [420, -140], [440, -40], [380, 20], [-380, 20]]), C.car, 8, () => { X.beginPath(); X.rect(-460, -60, 920, 100); });
  ink(P([[120, -240], [170, -320], [190, -320], [150, -238]]), 'rgba(170,220,255,.5)', 6);
  X.fillStyle = C.chrome; X.fillRect(-380, -110, 760, 10); X.strokeStyle = C.ink; X.lineWidth = 4; X.strokeRect(-380, -110, 760, 10);
  for (const wx of [-260, 280]) { ink(E(wx, 20, 78, 78), C.ink, 4); ink(E(wx, 20, 46, 46), C.chrome, 5); X.save(); X.translate(wx, 20); X.rotate(t * 20); X.strokeStyle = C.ink; X.lineWidth = 6; for (let i = 0; i < 5; i++) { X.rotate(TAU / 5); X.beginPath(); X.moveTo(0, 0); X.lineTo(40, 0); X.stroke(); } X.restore(); }
  ink(E(420, -90, 18, 12), C.sun, 4);
  X.restore();
}
function friend(x, y, s, a, col, kind, t) {   // the crew walking in slow motion: ink silhouettes with sunset rim light
  if (a <= 0) return; X.save(); X.translate(x, y); X.scale(s, s); X.globalAlpha = clamp(a * 1.5);
  const step = Math.sin(t * 5 + kind) * 30;
  const body = () => { X.beginPath(); X.moveTo(-70, -480); X.lineTo(70, -480); X.lineTo(90, -200); X.lineTo(50, -200); X.lineTo(50 + step * .3, 0); X.lineTo(10, 0); X.lineTo(0, -180); X.lineTo(-10, 0); X.lineTo(-50 - step * .3, 0); X.lineTo(-50, -200); X.lineTo(-90, -200); X.closePath();
    X.moveTo(60, -560); X.ellipse(0, -560, 60, 72, 0, 0, TAU); };
  ink(body, C.ink, 4); X.save(); body(); X.clip(); X.fillStyle = col; X.fillRect(-100, -480, 200, 280); X.fillStyle = C.ink; X.fillRect(-100, -480, 40, 300); X.restore();
  if (kind === 0) ink(P([[-70, -620], [80, -630], [120, -600], [-70, -590]]), C.ink, 4);          // a cap
  if (kind === 1) ink(P([[-62, -600], [-90, -440], [-60, -470], [60, -470], [90, -440], [62, -600]]), C.ink, 4);   // long hair
  if (kind === 2) ink(E(0, -640, 50, 26), C.ink, 4);                                               // a bun
  X.strokeStyle = C.sky3; X.lineWidth = 6; X.beginPath(); X.moveTo(64, -600); X.lineTo(66, -520); X.moveTo(72, -470); X.lineTo(88, -210); X.stroke();   // rim light
  for (const ex of [-25, 25]) { X.fillStyle = C.ink; X.fillRect(ex - 22, -580, 44, 16); }
  X.restore(); }

// ———— scenes ————
function bgCity(t, ox, oy, z) { ox = ox % 400; X.fillStyle = C.sky0; X.fillRect(0, 0, W, H); X.save(); X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-W / 2, -H / 2); X.drawImage(city, -210 - ox, -oy, 1500, 1300 * (H / 1300) * .74 + 400); X.restore(); }
function road(t, y0) { X.fillStyle = C.road; X.fillRect(0, y0, W, H - y0); X.fillStyle = C.sun; for (let i = 0; i < 8; i++) { const x = ((i * 220 - t * 1400) % 1760 + 1760) % 1760 - 300; X.fillRect(x, y0 + 120, 120, 14); } X.strokeStyle = C.ink; X.lineWidth = 6; X.beginPath(); X.moveTo(0, y0); X.lineTo(W, y0); X.stroke(); }
function sHook(t) {
  if (t < 1.3) {   // aerial: the city at sunset, push-in, the title slams
    const z = lerp(1.25, 1.05, eo(t / 1.3)); bgCity(t, t * 30, 0, z);
    palm(60, 1700, 1.4, t); palm(1000, 1760, 1.2, t, 2);
    slam('GTA 6', 540, 640, 290, A(t, .05, .14)); flare(760, 700, 1.2, A(t, .1, .3));
    return; }
  // the drive: convertible on the coast road, palms passing in parallax
  bgCity(t, 120 + t * 20, -80, 1.05); road(t, 1250);
  for (let i = 0; i < 4; i++) palm(((i * 420 - t * 900) % 1680 + 1680) % 1680 - 200, 1260, .9, t, i);
  car(540, 1430, 1, t, true, { mouth: mouthAt(t), grin: t > T.gratis });
  slam('GRATIS', 540, 560, 260, A(t, T.gratis - .04, .14), C.gold); if (t > T.gratis) flare(820, 470, .9, 1 - seg(t, T.gratis + .4, T.gratis + .6));
}
function sPhone(t) {   // in the car at sunset: the phone in his hand
  bgCity(t, 300 + t * 15, -60, 1.15); X.fillStyle = 'rgba(42,26,94,.35)'; X.fillRect(0, 0, W, H);
  X.save(); X.translate(580, 860); X.rotate(-.06);
  ink(Rr(-210, -380, 420, 760, 50), '#1a1420', 8); X.save(); X.beginPath(); X.roundRect(-180, -330, 360, 660, 20); X.clip(); const g = X.createLinearGradient(0, -330, 0, 330); g.addColorStop(0, '#2a1a5e'); g.addColorStop(1, '#5a2a6a'); X.fillStyle = g; X.fillRect(-190, -340, 380, 680);
  if (t < 7.15) { if (t < T.buddy + .1) { ink(Rr(-80, -100, 160, 160, 36), C.gold, 6); X.font = "110px 'Anton'"; X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('B', 0, -16); }
    else { X.strokeStyle = C.green; X.lineWidth = 34; X.lineCap = 'round'; X.beginPath(); X.moveTo(-90, -10); X.lineTo(-25, 60); X.lineTo(100, -90); X.stroke(); } }
  else { ink(Rr(-150, -170, 300, 90, 18), C.white, 5); const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)); X.fillStyle = C.ink; for (let i = 0; i < n; i++) { X.beginPath(); X.arc(-110 + i * 44, -125, 13, 0, TAU); X.fill(); }
    if (t > T.amico) { X.strokeStyle = C.green; X.lineWidth = 30; X.lineCap = 'round'; X.beginPath(); X.moveTo(-80, 100); X.lineTo(-20, 160); X.lineTo(90, 30); X.stroke(); } }
  X.restore();
  const tap = (t > 5.9 && t < 6.6) || (t > 7.3 && t < 8.0) ? Math.abs(Math.sin(t * 14)) : 0;
  ink(Rr(-260, 200, 160, 260, 60), C.skin, 7); ink(E(150, 260 - tap * 70, 46, 86, -.4), C.skin, 7, () => { X.beginPath(); X.rect(150, 160, 80, 220); });
  X.restore();
  X.fillStyle = C.ink; X.fillRect(0, H - 360, W, 360); hero(250, 1660, .55, t, { mouth: mouthAt(t) });
}
function sMoney(t) {   // cash rains over the convertible
  bgCity(t, 500 + t * 20, -80, 1.05); road(t, 1250); palm(80, 1260, 1, t); palm(980, 1260, .9, t, 1);
  car(540, 1430, 1, t, true, { mouth: mouthAt(t), grin: t > T.ottanta });
  for (let i = 0; i < 26; i++) { const u = seg(t, T.ottanta - .2 + hash(i) * .5, T.ottanta + 1.4 + hash(i) * .5); if (u <= 0) continue; const x = hash(i + 3) * W + Math.sin(t * 4 + i) * 40, y = lerp(150, 1300, u);
    X.save(); X.translate(x, y); X.rotate(Math.sin(t * 5 + i * 2) * .8); X.scale(1, Math.abs(Math.cos(t * 6 + i))); ink(Rr(-60, -30, 120, 60, 6), '#7fd08a', 4); X.fillStyle = '#3a8a4a'; X.beginPath(); X.arc(0, 0, 16, 0, TAU); X.fill(); X.restore(); }
  slam('+80 €', 540, 560, 250, A(t, T.ottanta - .05, .14), C.green);
}
function sPay(t) {     // night strip: the game store window; he pays; one cent flips in slow motion
  X.fillStyle = '#1a0f2e'; X.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { X.fillStyle = `rgba(255,255,255,${.3 + hash(i) * .4})`; X.fillRect(hash(i + 1) * W, hash(i + 2) * 500, 3, 3); }
  ink(Rr(80, 260, 920, 900, 10), '#2a1a3e', 8); ink(Rr(130, 420, 820, 680, 6), '#120a20', 6);
  X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = '#ff3d9e'; X.shadowColor = '#ff3d9e'; X.shadowBlur = 30; X.lineWidth = 10; X.strokeRect(150, 440, 780, 640); X.restore();
  // the game box in the window
  X.save(); X.translate(540, 760); ink(Rr(-170, -240, 340, 470, 10), '#5a1b7a', 8, () => { X.beginPath(); X.rect(80, -260, 120, 500); });
  X.fillStyle = C.sky2; X.beginPath(); X.arc(0, 60, 110, Math.PI, 0); X.fill(); X.fillStyle = C.ink; for (let i = 0; i < 5; i++) X.fillRect(-160 + i * 70, 20 - (i % 2) * 50, 40, 150); X.restore();
  slam('GTA 6', 540, 590, 110, 1, C.white, -.04);
  // price sticker
  if (t > T.prezzo - .05) { X.save(); X.translate(780, 1000); X.rotate(.1); X.scale(back(A(t, T.prezzo - .05, .2), 2), back(A(t, T.prezzo - .05, .2), 2)); ink(E(0, 0, 150, 90), C.gold, 7); X.font = "80px 'Anton'"; X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('79,99 €', 0, 4); X.restore(); }
  // bills slapped down
  for (let i = 0; i < 5; i++) { const u = seg(t, 12.7 + i * .12, 13.2 + i * .12); if (u <= 0) continue; X.save(); X.translate(lerp(300, 520 + i * 20, u), lerp(1500, 1220, u)); X.rotate(-.3 + i * .15); ink(Rr(-80, -40, 160, 80, 6), '#7fd08a', 5); X.restore(); }
  // the cent: spotlight, slow-motion flip
  if (t > T.avanza - .3) { const u = seg(t, T.avanza - .3, T.avanza + 1.2); X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(780, 1230, 0, 780, 1230, 260); g.addColorStop(0, 'rgba(255,220,140,.5)'); g.addColorStop(1, 'rgba(255,220,140,0)'); X.fillStyle = g; X.fillRect(520, 970, 520, 520); X.restore();
    X.save(); X.translate(780, 1260 - Math.sin(u * Math.PI) * 220); X.scale(Math.abs(Math.cos(u * 9)) * .9 + .1, 1); ink(E(0, 0, 50, 50), '#e8a24a', 6); X.restore();
    slam('0,01 €', 780, 1080, 110, A(t, T.centesimo - .05, .14), C.gold); }
  const laugh = t > T.risata && t < T.risata + 1.4;
  X.save(); X.translate(0, laugh ? Math.sin(t * 30) * 6 : 0); hero(290, 1560, .72, t, { mouth: laugh ? .7 : mouthAt(t), grin: t > T.risata }); X.restore();
}
function sTurn(t) {    // he lowers the aviators and points at you; the code as a trailer card; +80 €; GRATIS
  bgCity(t, 700 + t * 10, -40, 1.2); X.fillStyle = 'rgba(18,13,20,.3)'; X.fillRect(0, 0, W, H);
  if (t < 17.3) { const k = eo(A(t, T.tocca, .4)); hero(540, 1300, lerp(1.25, 1.55, k), t, { mouth: mouthAt(t), lower: k, grin: true, point: A(t, T.tocca + .2, .25) }); return; }
  hero(300, 1600, .78, t, { mouth: mouthAt(t), lower: 1, grin: true });
  if (t < 19.75) { X.save(); X.translate(540, 700); X.fillStyle = C.ink; X.fillRect(-500, -150, 1000, 300); X.strokeStyle = C.gold; X.lineWidth = 6; X.strokeRect(-480, -130, 960, 260);
    X.font = "40px 'Anton'"; X.fillStyle = C.gold; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', 0, -80);
    X.font = "700 86px 'JB Mono'"; X.fillStyle = C.white; const cw = 62, x0 = -(CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) if (t > 17.5 + i * .1) X.fillText(CODE[i], x0 + i * cw, 30); X.restore(); }
  else { slam('+80 €', 600, 600, 230, A(t, T.ottanta2 - .05, .14), C.green);
    if (t > T.eGta) { slam('GTA 6', 640, 860, 150, A(t, T.eGta, .14)); slam('GRATIS', 660, 1040, 190, A(t, T.gratis2 - .05, .14), C.gold); } }
}
function sCrew(t) {    // the crew walks in, slow motion, on the boardwalk at sunset; then link in bio
  bgCity(t, 900 + t * 6, -60, 1.05); X.fillStyle = '#5a3a3a'; X.fillRect(0, 1450, W, H - 1450); for (let x = 0; x < W; x += 90) { X.fillStyle = '#4a2e30'; X.fillRect(x, 1450, 6, H - 1450); }
  palm(40, 1460, 1.1, t); palm(1040, 1460, 1, t, 3);
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], xs = [170, 330, 750, 910], cols = ['#3fb6ff', '#ffd23a', '#7bff8a', '#c07bff'], end = t > T.linkBio;
  hits.forEach((h, i) => { const a = A(t, h - .4, .4); friend(lerp(i < 2 ? -100 : 1180, xs[i], eo(a)), 1520, .62, a, cols[i], i, t); if (!end && t > h && t < h + 1.5) slam('+50 €', xs[i] < 300 ? 210 : xs[i] > 800 ? 870 : xs[i], 1000, 90, A(t, h, .12), C.green); });
  hero(540, 1600, .62, t, { mouth: mouthAt(t), grin: true, lower: 1 });
  if (end) { slam('LINK IN BIO', 540, 620, 150, A(t, T.linkBio - .05, .14));
    X.save(); X.translate(540, 430 + Math.sin(t * 8) * 16); ink(P([[0, -90], [80, 0], [30, 0], [30, 70], [-30, 70], [-30, 0], [-80, 0]]), C.gold, 7); X.restore(); }
}
function codeStrip(t) { if (t < 19.75) return; X.fillStyle = C.ink; X.fillRect(60, BAR + 40, 960, 120); X.strokeStyle = C.gold; X.lineWidth = 4; X.strokeRect(72, BAR + 52, 936, 96); X.font = "700 70px 'JB Mono'"; X.fillStyle = C.white; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(CODE, 540, BAR + 102); }

const SCN = [[0, 4.45, sHook], [4.45, 8.75, sPhone], [8.75, 11.05, sMoney], [11.05, 16.05, sPay], [16.05, 23.4, sTurn], [23.4, 99, sCrew]];
const grain = (() => { const c = document.createElement('canvas'); c.width = 360; c.height = 640; const g = c.getContext('2d'); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${hash(i) > .5 ? '255,255,255' : '0,0,0'},${hash(i + 5) * .07})`; g.fillRect(hash(i + 1) * 360, hash(i + 2) * 640, 1, 1); } return c; })();
function render(t) {
  X.setTransform(SC, 0, 0, SC, 0, 0); X.globalAlpha = 1; X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  SCN.find(([a, b]) => t >= a && t < b)[2](t); codeStrip(t);
  X.drawImage(grain, (hash(Math.floor(t * 30)) * 40) | 0, 0, W, H);
  const v = X.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,0,20,.45)'); X.fillStyle = v; X.fillRect(0, 0, W, H);
  X.fillStyle = '#000'; X.fillRect(0, 0, W, BAR); X.fillRect(0, H - BAR, W, BAR);          // letterbox
  for (const [a] of [...SCN.slice(1), [1.3]]) { const k = seg(t, a, a + .1); if (k > 0 && k < 1) { X.fillStyle = `rgba(0,0,0,${1 - k})`; X.fillRect(0, 0, W, H); } }   // hard cuts through black
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'boom'); ev(.05, 'riser'); ev(1.3, 'engine'); ev(T.gratis - .04, 'boom'); ev(T.gratis, 'siren');
ev(4.45, 'cut'); ev(6.25, 'tap'); ev(T.buddy + .1, 'ok'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'tap', { v: .6 }); ev(T.amico, 'ok');
ev(8.75, 'engine'); ev(T.ottanta - .05, 'boom'); ev(T.ottanta, 'cash');
ev(11.05, 'cut'); ev(T.prezzo - .05, 'hit'); for (let i = 0; i < 5; i++) ev(12.75 + i * .12, 'slap'); ev(T.avanza - .3, 'ting'); ev(T.centesimo - .05, 'hit');
ev(16.05, 'cut'); ev(T.tocca, 'riser'); ev(17.3, 'hit'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'tap', { v: .45 }); ev(T.ottanta2 - .05, 'boom'); ev(T.eGta, 'hit'); ev(T.gratis2 - .05, 'boom');
ev(23.4, 'cut'); for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .4, 'whoosh'); ev(h, 'cash', { v: .7 }); }
ev(T.linkBio - .05, 'boom'); ev(T.linkBio, 'siren');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 19.75 ? [{ id: 'code', text: CODE, x0: 60, y0: 150, x1: 1020, y1: 270 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("40px 'Anton'"), document.fonts.load("700 40px 'JB Mono'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
