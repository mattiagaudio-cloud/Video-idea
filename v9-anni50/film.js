// V9 — Mid-century Cartoon, vertical 1080×1920. 1950s flat colour printed a few px off a breathing, broken ink line;
// a held presenter whose hands, eyes and mouth act; colour-plane rooms, starbursts, sunburst rays. Text only what the voice says.
import { clamp, lerp, seg, eo, ei, back, hash, vnoise, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W, X = cv.getContext('2d');
const C = { paper: '#f3ead7', ink: '#2b2420', coral: '#ef6f5c', mustard: '#e8b13a', turq: '#3fb6a8', turqD: '#2c8c82', sand: '#e6d3ad', skin: '#f2c9a0', skinD: '#d9a67b', olive: '#9aa04a', plum: '#8a4f7d', sky: '#a9cfd6', white: '#fffaf0' };
const tw = t => Math.floor(t * 12);
let OFF = [4, 3];                                       // off-register offset, re-rolled on twos
const A = (t, t0, d = .25) => seg(t, t0, t0 + d);
const pop = (t, t0) => back(A(t, t0, .25), 2.6);

// ———— printed cel: colour plate off its broken, breathing ink line ————
function cel(pathFn, fill, lw = 4, shade = null, shadeFn = null) {
  X.save(); X.translate(OFF[0], OFF[1]); pathFn(); X.fillStyle = fill; X.fill();
  if (shade && shadeFn) { pathFn(); X.clip(); shadeFn(); X.fillStyle = shade; X.fill(); }
  X.restore();
  // ink ribbon with breaks: dash pattern varies with the drawing
  const k = tw(window.__t || 0); X.save(); X.setLineDash([60 + hash(k) * 40, 8 + hash(k + 1) * 10, 30 + hash(k + 2) * 30, 6]); X.lineDashOffset = hash(k + 3) * 50;
  pathFn(); X.lineWidth = lw * (.8 + .4 * hash(k + 5)); X.strokeStyle = C.ink; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(); X.restore();
}
const E = (x, y, rx, ry, r = 0) => () => { X.beginPath(); X.ellipse(x, y, rx, ry, r, 0, TAU); };
const R = (x, y, w, h, r = 0) => () => { X.beginPath(); X.roundRect(x, y, w, h, r); };
const P = pts => () => { X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); };
function burst(x, y, r1, r2, n, col, rot = 0) { cel(() => { X.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + rot, r = i % 2 ? r2 : r1; X.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } X.closePath(); }, col, 4); }
function sparkle(x, y, s, rot = 0) { X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); X.fillStyle = C.ink; X.beginPath(); X.moveTo(0, -40); X.quadraticCurveTo(4, -4, 40, 0); X.quadraticCurveTo(4, 4, 0, 40); X.quadraticCurveTo(-4, 4, -40, 0); X.quadraticCurveTo(-4, -4, 0, -40); X.fill(); X.restore(); }
function rays(x, y, t, col, a = 1) { if (a <= 0) return; X.save(); X.globalAlpha = .28 * a; X.fillStyle = col; X.translate(x, y); X.rotate(t * .4); for (let i = 0; i < 30; i++) { X.beginPath(); X.moveTo(0, 0); X.arc(0, 0, 1600, i / 30 * TAU, (i + .45) / 30 * TAU); X.closePath(); X.fill(); } X.restore(); }
function slab(txt, x, y, px, col, a, plate = C.mustard) { if (a <= 0) return; const k = back(clamp(a), 2.6); X.save(); X.translate(x, y); X.scale(k, k);
  X.font = `${px}px 'Alfa Slab One'`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = plate; X.fillText(txt, OFF[0] * 2, OFF[1] * 2); X.fillStyle = col; X.fillText(txt, 0, 0); X.restore(); }
function script(txt, x, y, px, col, a, rot = -.08) { if (a <= 0) return; X.save(); X.translate(x, y); X.rotate(rot); X.font = `700 ${px}px 'Oleo Script'`; X.textAlign = 'center'; X.textBaseline = 'middle';
  const w = X.measureText(txt).width; X.beginPath(); X.rect(-w / 2 - 20, -px, (w + 40) * eo(clamp(a)), px * 2); X.clip();          // writes on left → right
  X.fillStyle = C.ink; X.fillText(txt, OFF[0], OFF[1]); X.fillStyle = col; X.fillText(txt, 0, 0); X.restore(); }
function medallion(x, y, r, txt, a, col = C.coral) { if (a <= 0) return; const k = back(clamp(a), 2.6); X.save(); X.translate(x, y); X.scale(k, k); burst(0, 0, r, r * .82, 14, col); slab(txt, 0, 4, r * .62, C.paper, 1, C.ink); X.restore(); }

// ———— the presenter: a held drawing; only arms, hands, eyes and mouth act ————
function hand(x, y, s, kind = 'open', rot = 0) { X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  if (kind === 'point') cel(() => { X.beginPath(); X.ellipse(0, 0, 34, 28, 0, 0, TAU); X.moveTo(20, -14); X.roundRect(10, -22, 80, 18, 9); }, C.white, 3.5);
  else cel(() => { X.beginPath(); X.ellipse(0, 0, 36, 30, 0, 0, TAU); for (let i = 0; i < 4; i++) { X.moveTo(-24 + i * 16, -14); X.roundRect(-30 + i * 16, -64, 14, 50, 7); } }, C.white, 3.5);
  X.restore(); }
function presenter(x, y, s, t, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  // legs + shoes
  cel(R(-70, -40, 50, 230, 20), C.ink, 3); cel(R(20, -40, 50, 230, 20), C.ink, 3); cel(E(-60, 200, 60, 24), C.ink, 3); cel(E(60, 200, 60, 24), C.ink, 3);
  // jacket: a trapezoid with lapels, held
  cel(P([[-150, -420], [150, -420], [180, 0], [-180, 0]]), C.turq, 4, C.turqD, () => { X.beginPath(); X.rect(60, -430, 140, 440); });
  cel(P([[-50, -420], [0, -300], [50, -420]]), C.paper, 3); cel(P([[-46, -414], [0, -380], [46, -414], [46, -440], [0, -404], [-46, -440]]), C.coral, 3);   // bow tie
  // arms (the acting part)
  const arm = (side, hx, hy, kind, rot) => { X.lineCap = 'round'; X.strokeStyle = C.ink; X.lineWidth = 50; X.beginPath(); X.moveTo(side * 140, -390); X.quadraticCurveTo(side * 190 + hx * .3, -250 + hy * .3, side * 140 + hx, -390 + hy); X.stroke();
    X.strokeStyle = C.turq; X.lineWidth = 40; X.stroke(); hand(side * 140 + hx, -390 + hy, 1, kind, rot); };
  const [lx, ly, lk, lr] = o.armL || [-30, 300, 'open', 0], [rx, ry, rk, rr] = o.armR || [30, 300, 'open', 0];
  arm(-1, lx, ly, lk, lr); arm(1, rx, ry, rk, rr);
  // head: an egg with the nose on its outline; hair swoop; glasses
  const hy = -600;
  cel(P([[-120, hy - 100], [-130, hy + 20], [-90, hy + 120], [0, hy + 150], [80, hy + 110], [120, hy + 40], [150, hy + 30], [118, hy + 0], [125, hy - 100], [40, hy - 175], [-60, hy - 170]]), C.skin, 4, C.skinD, () => { X.beginPath(); X.rect(-140, hy + 60, 300, 120); });
  cel(P([[-130, hy - 80], [-80, hy - 190], [60, hy - 200], [140, hy - 120], [60, hy - 140], [-20, hy - 110], [-90, hy - 120]]), C.ink, 3);
  const blink = tw(t) % 43 === 0 || o.happy;
  for (const ex of [-55, 45]) { X.lineWidth = 6; X.strokeStyle = C.ink; X.beginPath(); X.arc(ex, hy - 20, 42, 0, TAU); X.stroke();
    if (blink) { X.beginPath(); X.arc(ex, hy - 10, 18, Math.PI * 1.1, Math.PI * 1.9); X.stroke(); } else { X.fillStyle = C.ink; X.beginPath(); X.ellipse(ex + (o.look || 0) * 8, hy - 18, 9, o.wide ? 16 : 12, 0, 0, TAU); X.fill(); } }
  X.beginPath(); X.moveTo(-13, hy - 20); X.lineTo(3, hy - 20); X.stroke();
  // mouth
  const m = clamp(o.mouth || 0);
  if (o.jaw) cel(E(0, hy + 95, 40, 52), C.ink, 3);
  else if (m > .2) cel(() => { X.beginPath(); X.moveTo(-40, hy + 80); X.quadraticCurveTo(0, hy + 80 + m * 70, 40, hy + 80); X.closePath(); }, '#7a2b2b', 3);
  else { X.lineWidth = 5; X.beginPath(); X.moveTo(-40, hy + 78); X.quadraticCurveTo(0, hy + 100 + (o.smile ? 14 : 0), 40, hy + 78); X.stroke(); }
  X.restore();
}
function gtaBox(x, y, s, a, o = {}) {   // the product keeps one colour through the film: mustard
  if (a <= 0) return; const k = back(clamp(a), 2.4); X.save(); X.translate(x, y); X.scale(s * k, s * k);
  cel(R(-150, -210, 300, 420, 14), C.mustard, 5, '#c9932a', () => { X.beginPath(); X.rect(80, -220, 100, 440); });
  cel(E(0, 60, 100, 100), C.coral, 3); cel(R(-150, 90, 300, 120, 0), C.plum, 3);
  slab('GTA 6', 0, -120, 92, C.ink, 1, C.paper);
  X.restore(); }
function tag(x, y, txt, a, rot = -.08, strike = 0) { if (a <= 0) return; const k = back(clamp(a), 2.6); X.save(); X.translate(x, y); X.rotate(rot); X.scale(k, k);
  cel(P([[-170, -50], [140, -50], [180, 0], [140, 50], [-170, 50]]), C.paper, 4); sparkle(-140, 0, .35); X.font = "500 64px 'Jost'"; X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(txt, 0, 4);
  if (strike > 0) { X.strokeStyle = C.coral; X.lineWidth = 12; X.lineCap = 'round'; X.beginPath(); X.moveTo(-120, 20); X.lineTo(-120 + 240 * eo(strike), -14); X.stroke(); }
  X.restore(); }
function coinStack(x, y, n, a) { if (a <= 0) return; for (let i = 0; i < n; i++) { const k = back(A(window.__t, (window.__s || 0) + i * .05, .2), 2.4); if (k <= 0) continue; cel(E(x, y - i * 26, 70 * k, 22 * k), C.mustard, 3); } }
// friends: geometric people, each in a colour that isn't the presenter's
function person(x, y, s, a, kind, t) { if (a <= 0) return; const k = back(clamp(a), 2.6); X.save(); X.translate(x, y); X.scale(s * k, s * k);
  const col = [C.coral, C.olive, C.plum, C.sky][kind];
  cel(R(-40, -30, 30, 140, 12), C.ink, 3); cel(R(10, -30, 30, 140, 12), C.ink, 3);
  if (kind === 0) cel(P([[-90, -300], [90, -300], [110, 0], [-110, 0]]), col, 4); if (kind === 1) cel(E(0, -150, 110, 160), col, 4); if (kind === 2) cel(P([[0, -330], [120, 0], [-120, 0]]), col, 4); if (kind === 3) cel(R(-90, -320, 180, 330, 30), col, 4);
  const hy = kind === 2 ? -380 : -400; cel(E(0, hy, 80, 95), C.skin, 4); X.fillStyle = C.ink; X.beginPath(); X.arc(-26, hy - 10, 8, 0, TAU); X.arc(26, hy - 10, 8, 0, TAU); X.fill();
  X.lineWidth = 5; X.strokeStyle = C.ink; X.beginPath(); X.moveTo(-26, hy + 40); X.quadraticCurveTo(0, hy + 60, 26, hy + 40); X.stroke();
  const wave = Math.sin(tw(t) * 1.6 + kind) > 0 ? -1 : -.6; hand(110, -240 + wave * 120, .8, 'open', .3);
  X.restore(); }

// ———— rooms: one colour plane, a floor band, a horizon line with gaps ————
function room(col, floor) { X.fillStyle = col; X.fillRect(0, 0, W, H); X.fillStyle = floor; X.fillRect(0, 1380, W, H - 1380);
  X.strokeStyle = C.ink; X.lineWidth = 5; for (let x = 0; x < W; x += 220) { X.beginPath(); X.moveTo(x, 1380); X.lineTo(x + 170, 1380); X.stroke(); }
  X.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 9; i++) { X.beginPath(); X.ellipse(120 + i * 120, 120 + (i % 3) * 60, 30, 14, -.6, 0, TAU); X.fill(); } }

// ———— scenes ————
function sHook(t) {
  room(C.paper, C.sand); rays(700, 700, t, C.coral, A(t, 0, .2));
  burst(700, 700, 380 * pop(t, 0), 300 * pop(t, 0), 16, C.coral, t * .3);
  gtaBox(700, 720, 1, A(t, .05, .3));
  for (let i = 0; i < 5; i++) if (t > .2 + i * .1) sparkle(420 + hash(i) * 560, 330 + hash(i + 3) * 760, .7 + .3 * Math.sin(tw(t) + i), tw(t) * .2);
  if (t > T.gratis - .1) { burst(730, 1240, 260 * pop(t, T.gratis - .1), 200 * pop(t, T.gratis - .1), 18, C.mustard); script('Gratis!', 730, 1240, 150, C.coral, A(t, T.gratis - .05, .35)); }
  presenter(250, 1640, .8, t, { jaw: t < T.ioGioco, wide: t < T.ioGioco, mouth: mouthAt(t), look: 1, smile: t > T.gratis, armL: t > T.gratis ? [-60, -200, 'open', 0] : [-30, 300, 'open', 0], armR: t > T.gratis ? [80, -220, 'open', 0] : [140, -40, 'point', -.4] });
}
function sPhone(t) {
  room(C.sky, C.turqD);
  // the phone card in his hand (the hand taps: anticipation, fast tap, recoil)
  X.save(); X.translate(640, 900); X.rotate(.05); cel(R(-170, -300, 340, 600, 40), C.ink, 4); cel(R(-140, -250, 280, 480, 18), C.paper, 3);
  if (t < 7.15) { if (t < T.buddy + .1) { cel(R(-70, -110, 140, 140, 30), C.mustard, 4); slab('B', 0, -36, 100, C.ink, 1, C.paper); } else { burst(0, -40, 150, 120, 12, C.olive); X.strokeStyle = C.paper; X.lineWidth = 26; X.lineCap = 'round'; X.beginPath(); X.moveTo(-60, -40); X.lineTo(-15, 10); X.lineTo(70, -90); X.stroke(); } }
  else { cel(R(-110, -150, 220, 80, 16), C.white, 3); const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)); X.fillStyle = C.ink; for (let i = 0; i < n; i++) { X.beginPath(); X.arc(-80 + i * 32, -110, 11, 0, TAU); X.fill(); }
    if (t > T.amico) { burst(0, 90, 130, 104, 12, C.olive); X.strokeStyle = C.paper; X.lineWidth = 22; X.lineCap = 'round'; X.beginPath(); X.moveTo(-50, 90); X.lineTo(-10, 130); X.lineTo(60, 50); X.stroke(); } }
  X.restore();
  const tapPh = (u => u < .3 ? -40 * (u / .3) : u < .5 ? lerp(-40, 30, (u - .3) / .2) : lerp(30, 0, (u - .5) / .5));
  const tp = t > 5.9 && t < 6.6 ? tapPh(seg(t, 5.9, 6.6)) : t > 7.35 && t < 8.1 ? tapPh((t - 7.35) % .25 / .25) : 0;
  presenter(240, 1680, .78, t, { mouth: mouthAt(t), look: 1, armR: [330, -330 + tp, 'point', -.6] });
}
function sMoney(t) {
  room(C.paper, C.sand); rays(640, 700, t, C.mustard, A(t, T.ottanta - .1, .2));
  window.__s = T.ottanta - .3; coinStack(650, 1000, 8, 1);
  medallion(650, 560, 240, '80 €', A(t, T.ottanta - .05, .25), C.coral);
  for (let i = 0; i < 4; i++) if (t > T.ottanta) sparkle(380 + i * 180, 330 + (i % 2) * 520, .8, tw(t) * .3 + i);
  presenter(240, 1680, .78, t, { mouth: mouthAt(t), wide: t > T.ottanta, armL: [-40, -200, 'open', 0], armR: [120, -220, 'open', 0] });
}
function sPay(t) {
  room(C.sand, C.olive);
  gtaBox(740, 820, .95, A(t, 11.1, .3)); tag(740, 1180, '79,99 €', A(t, T.prezzo - .05), -.06);
  for (let i = 0; i < 6; i++) { const u = seg(t, 12.6 + i * .14, 13.2 + i * .14); if (u <= 0 || u >= 1) continue; cel(E(lerp(380, 740, u), lerp(1300, 820, u) - Math.sin(u * Math.PI) * 300, 54, 18), C.mustard, 3); }
  if (t > T.avanza - .1) { cel(E(470, 1236, 26 * pop(t, T.avanza - .1), 10 * pop(t, T.avanza - .1)), C.mustard, 3); sparkle(510, 1190, .5, tw(t) * .4); tag(470, 920, '0,01 €', A(t, T.centesimo - .1), .05); }
  const laugh = t > T.risata && t < T.risata + 1.5;
  presenter(240, 1680, .78, t, { mouth: laugh ? .6 : mouthAt(t), happy: laugh, smile: t > T.risata, armR: t > T.avanza - .1 ? [180, 30, 'open', -1.6] : [190, -120, 'open', 0], armL: laugh ? [60, -60, 'open', 0] : [-30, 300, 'open', 0] });
}
function sTurn(t) {
  const close = t < 17.3;
  room(C.coral, C.plum); if (close) rays(540, 900, t, C.mustard, 1);
  if (close) { presenter(540, 2600, 1.75, t, { mouth: mouthAt(t), smile: true, armR: [-60, -280, 'point', -2.2] }); return; }
  presenter(220, 1680, .74, t, { mouth: mouthAt(t), smile: true, armR: [180, -260, 'point', -.9] });
  if (t < 19.75) { X.save(); X.translate(540, 640); cel(R(-500, -150, 1000, 300, 30), C.paper, 5); sparkle(-450, -100, .4, tw(t) * .3); sparkle(450, 100, .4, tw(t) * .3);
    X.font = "600 36px 'Jost'"; X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', 0, -90);
    X.font = "700 86px 'JB Mono'"; const cw = 62, x0 = -(CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) if (t > 17.5 + i * .1) X.fillText(CODE[i], x0 + i * cw, 25); X.restore(); }
  else { medallion(560, 640, 230, '+80 €', A(t, T.ottanta2 - .05), C.mustard);
    if (t > T.eGta) { gtaBox(760, 1100, .7, A(t, T.eGta, .25)); if (t > T.gratis2 - .1) { burst(700, 1000, 200, 160, 16, C.paper); script('Gratis!', 700, 1000, 120, C.coral, A(t, T.gratis2 - .05, .35)); } } }
}
function sFriends(t) {
  room(C.turq, C.turqD);
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], xs = [400, 590, 780, 960], end = t > T.linkBio;
  presenter(170, 1680, .66, t, { mouth: mouthAt(t), smile: true, armR: end ? [60, -360, 'point', -1.5] : [120, -80, 'open', 0], armL: [-30, 300, 'open', 0] });
  hits.forEach((h, i) => { person(xs[i], 1660, .8, A(t, h - .25, .25), i, t); if (!end && t > h && t < h + 1.6) medallion(Math.min(xs[i], 940), 900, 115, '+50 €', A(t, h, .2), [C.mustard, C.coral, C.paper, C.mustard][i]); });
  if (end) { burst(540, 640, 300 * pop(t, T.linkBio - .1), 250 * pop(t, T.linkBio - .1), 18, C.mustard); script('Link in bio', 540, 640, 120, C.ink, A(t, T.linkBio - .05, .4));
    X.save(); X.translate(540, 380 + Math.sin(tw(t) * .9) * 16); cel(P([[0, -90], [80, 0], [30, 0], [30, 70], [-30, 70], [-30, 0], [-80, 0]]), C.coral, 5); X.restore(); }
}
function codeCard(t) { if (t < 19.75) return; X.save(); X.translate(540, 250); cel(R(-490, -70, 980, 140, 30), C.paper, 4); X.font = "700 70px 'JB Mono'"; X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(CODE, 0, 4); X.restore(); }

const SCN = [[0, 4.45, sHook], [4.45, 8.75, sPhone], [8.75, 11.05, sMoney], [11.05, 16.05, sPay], [16.05, 23.4, sTurn], [23.4, 99, sFriends]];
const grain = (() => { const c = document.createElement('canvas'); c.width = 270; c.height = 480; const g = c.getContext('2d'); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(60,40,20,${hash(i) * .08})`; g.fillRect(hash(i + 1) * 270, hash(i + 2) * 480, 1, 1); } return c; })();
function render(t) {
  window.__t = t; const k = tw(t); OFF = [3 + Math.round(hash(k) * 2), 2 + Math.round(hash(k + 7) * 2)];
  X.setTransform(SC, 0, 0, SC, 0, 0);
  SCN.find(([a, b]) => t >= a && t < b)[2](t); codeCard(t);
  X.drawImage(grain, 0, 0, W, H);
  // a soft iris on every scene change (the period's wipe)
  for (const [a] of SCN.slice(1)) { const u = seg(t, a, a + .3); if (u > 0 && u < 1) { X.save(); X.fillStyle = C.ink; X.beginPath(); X.rect(0, 0, W, H); X.arc(540, 960, eo(u) * 1200, 0, TAU, true); X.fill(); X.restore(); } }
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'boom'); ev(.05, 'pop'); ev(.25, 'tink'); ev(T.gratis - .1, 'pop'); ev(T.gratis, 'vibe');
for (const [a] of SCN.slice(1)) ev(a, 'iris');
ev(6.2, 'tap'); ev(T.buddy + .1, 'vibe'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'tap', { v: .6 }); ev(T.amico, 'vibe');
for (let i = 0; i < 8; i++) ev(T.ottanta - .3 + i * .05, 'tink', { v: .4 }); ev(T.ottanta - .05, 'pop'); ev(T.ottanta, 'vibe');
ev(11.1, 'pop'); ev(T.prezzo - .05, 'pop'); for (let i = 0; i < 6; i++) ev(12.6 + i * .14, 'tink'); ev(T.avanza - .1, 'tink'); ev(T.centesimo - .1, 'pop');
ev(17.3, 'pop'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'tap', { v: .5 }); ev(19.75, 'pop'); ev(T.ottanta2 - .05, 'vibe'); ev(T.eGta, 'pop'); ev(T.gratis2 - .05, 'vibe');
for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .25, 'pop'); ev(h, 'tink'); }
ev(T.linkBio - .1, 'vibe');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 19.75 ? [{ id: 'code', text: CODE, x0: 50, y0: 180, x1: 1030, y1: 320 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("40px 'Alfa Slab One'"), document.fonts.load("700 40px 'Oleo Script'"), document.fonts.load("600 40px 'Jost'"), document.fonts.load("700 40px 'JB Mono'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
