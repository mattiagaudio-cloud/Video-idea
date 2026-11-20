// V7 — Neon Tubes, vertical 1080×1920. Every word and every figure is bent glass on a night facade, mirrored in the wet street.
// Signs strike (100 % 50 ms, dark, 70 %, dark, ramp), characters switch poses on the beat, never tween. Text only what the voice says.
import { clamp, lerp, seg, eo, hash, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const W = 1080, H = 1920, STREET = 1440;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const out = cv.getContext('2d');
const fac = document.createElement('canvas'); fac.width = W; fac.height = STREET; let X = fac.getContext('2d');
const HUE = { hero: '#1ff2d9', eye: '#ff3d9e', gta: '#ff3d9e', gratis: '#52ff6a', gold: '#ffc23a', red: '#ff3a1e', blue: '#3d75ff', white: '#f4f0ff', violet: '#c06bff' };
const FR = [HUE.red, HUE.gold, HUE.violet, HUE.blue];

// ———— the facade (painted once) ————
const wall = document.createElement('canvas'); wall.width = W; wall.height = STREET;
(() => { const g = wall.getContext('2d'); g.fillStyle = '#100b12'; g.fillRect(0, 0, W, STREET);
  for (let y = 0, row = 0; y < STREET; y += 34, row++) for (let x = -(row % 2) * 40; x < W; x += 80) { const v = 22 + hash(x * .3 + y) * 14; g.fillStyle = `rgb(${v + 8},${v},${v + 4})`; g.fillRect(x + 3, y + 3, 74, 28); }
  for (const [x, y, w, h, c] of [[60, 120, 960, 300, '#0a1626'], [60, 470, 960, 760, '#120916']]) { g.fillStyle = c; g.fillRect(x, y, w, h); g.strokeStyle = '#2a2230'; g.lineWidth = 6; g.strokeRect(x, y, w, h); }
  g.fillStyle = '#07050a'; g.fillRect(0, 1260, W, 180); for (let x = 0; x < W; x += 18) { g.fillStyle = '#16121a'; g.fillRect(x, 1270, 12, 160); }   // roller shutter
  g.fillStyle = '#2a2a30'; g.fillRect(990, 0, 22, STREET); g.fillStyle = '#1c1c22'; g.fillRect(40, 1190, 120, 70); })();

// ———— tubes ————
// strike envelope for a sign switched on at t0 (and off at t1)
function strike(t, t0, t1 = 1e9) {
  if (t < t0 || t > t1 + .25) return 0; if (t > t1) return hash(Math.floor(t * 60)) > .5 ? .5 : 0;   // failing on the way out
  const u = t - t0; if (u < .05) return 1; if (u < .12) return 0; if (u < .17) return .7; if (u < .22) return 0; if (u < .32) return lerp(.3, 1, (u - .22) / .1);
  return .97 + .03 * Math.sin(t * 2 * Math.PI * 50 / 7 + t0 * 9);   // mains shimmer
}
function tubeStroke(draw, col, k, dead = false) {   // draw: a function that strokes the centreline path
  X.lineCap = 'round'; X.lineJoin = 'round';
  X.strokeStyle = '#2b2530'; X.lineWidth = 14; draw(); X.strokeStyle = '#4a4050'; X.lineWidth = 4; draw();     // the glass, unlit
  if (k <= 0 || dead) return;
  X.save(); X.globalCompositeOperation = 'lighter'; X.globalAlpha = k;
  X.shadowColor = col; X.shadowBlur = 60; X.strokeStyle = col; X.lineWidth = 22; X.globalAlpha = k * .35; draw();
  X.shadowBlur = 24; X.lineWidth = 12; X.globalAlpha = k * .9; draw();
  X.shadowBlur = 0; X.strokeStyle = '#ffffff'; X.lineWidth = 4; X.globalAlpha = k * .85; draw();
  X.restore();
}
function spill(x, y, r, col, k) { if (k <= 0) return; X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col + '30'); g.addColorStop(1, col + '00'); X.globalAlpha = k; X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2); X.restore(); }
function word(txt, x, y, px, col, k, fam = "'Fredoka'", w = 500) { if (k <= 0) return; X.font = `${w} ${px}px ${fam}`; X.textAlign = 'center'; X.textBaseline = 'middle'; tubeStroke(() => X.strokeText(txt, x, y), col, k); spill(x, y, px * 2.2, col, k); }
const poly = (pts, closed) => () => { X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); if (closed) X.closePath(); X.stroke(); };
const circ = (x, y, r) => () => { X.beginPath(); X.arc(x, y, r, 0, TAU); X.stroke(); };

// ———— the neon figure: one outline per pose; poses switch on the beat ————
// pose: arms [lx,ly, rx,ry] hand offsets from the shoulders, legs spread, jump; mouth open from the voice
function figure(x, y, s, col, k, pose = {}, t = 0, face = true) {
  X.save(); X.translate(x, y - (pose.jump || 0)); X.scale(s, s);
  const [lx, ly, rx, ry] = pose.arms || [-60, 140, 60, 140], sp = pose.legs || 40;
  const d = [circ(0, -360, 70), poly([[0, -290], [0, -110]]), poly([[-sp, 0], [0, -110], [sp, 0]]), poly([[-lx * 0 - 0, -250], [-0 + lx * .55, -250 + ly * .5], [lx, -250 + ly]]), poly([[0, -250], [rx * .55, -250 + ry * .5], [rx, -250 + ry]])];
  const lw = 1 / s; X.save(); X.scale(1, 1);
  for (const f of d) tubeStroke(f, col, k);
  if (face) { const m = clamp(pose.mouth || 0); tubeStroke(circ(-24, -372, 8), HUE.eye, k); tubeStroke(circ(24, -372, 8), HUE.eye, k);
    if (m > .25) tubeStroke(() => { X.beginPath(); X.ellipse(0, -330, 18, 6 + m * 12, 0, 0, TAU); X.stroke(); }, HUE.eye, k); else tubeStroke(poly([[-22, -334], [0, -322 + (pose.smile ? 6 : 0)], [22, -334]]), HUE.eye, k); }
  X.restore(); X.restore(); spill(x, y - 220 * s, 420 * s, col, k);
}
const beat = t => Math.floor(t / .25);                                     // poses switch on 8ths of a 120 bpm grid
const sw = (t, a, b) => (beat(t) % 2 ? a : b);

// ———— scenes: each returns nothing; signs on the upper board, figures on the lower board ————
const A = (t, t0) => strike(t, t0);
function sHook(t) {
  word('GTA 6', 540, 270, 210, HUE.gta, A(t, 0), "'Fredoka'", 600);
  const k = clamp((t - .25) / .5); figure(540, 1180, 1.25, HUE.hero, k >= 1 ? strike(t, .25) : k * (hash(Math.floor(t * 40)) > .3 ? 1 : .2),
    t < T.ioGioco ? { arms: [-70, 150, 70, 150], mouth: mouthAt(t) } : t < T.gratis ? { arms: sw(t, [-30, 40, 30, 40], [-40, 50, 40, 50]), mouth: mouthAt(t) } : { arms: sw(t, [-90, -200, 90, -200], [-120, -150, 120, -150]), jump: sw(t, 50, 0), legs: sw(t, 70, 40), mouth: mouthAt(t), smile: true }, t);
  if (t > T.ioGioco && t < T.gratis) tubeStroke(() => { X.beginPath(); X.roundRect(480, 820, 120, 50, 20); X.stroke(); }, HUE.white, strike(t, T.ioGioco));
  word('GRATIS', 540, 640, 160, HUE.gratis, A(t, T.gratis - .05), "'Fredoka'", 600);
}
function sPhone(t) {
  const ph = () => { X.beginPath(); X.roundRect(330, 520, 420, 700, 50); X.stroke(); };
  tubeStroke(ph, HUE.white, A(t, 4.5)); tubeStroke(poly([[500, 560], [580, 560]]), HUE.white, A(t, 4.5));
  if (t < 7.15) { if (t < T.buddy + .1) { tubeStroke(() => { X.beginPath(); X.roundRect(470, 760, 140, 140, 30); X.stroke(); }, HUE.gold, A(t, T.aperto)); word('B', 540, 832, 100, HUE.gold, A(t, T.aperto), "'Fredoka'", 600); }
    else tubeStroke(poly([[460, 860], [520, 920], [630, 790]]), HUE.gratis, A(t, T.buddy + .1)); }
  else { tubeStroke(() => { X.beginPath(); X.roundRect(390, 760, 300, 80, 20); X.stroke(); }, HUE.white, A(t, 7.2));
    const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)); for (let i = 0; i < n; i++) tubeStroke(circ(425 + i * 46, 800, 10), HUE.hero, 1);
    if (t > T.amico) tubeStroke(poly([[460, 980], [520, 1040], [630, 910]]), HUE.gratis, A(t, T.amico)); }
  // the finger taps on the beat
  const tap = (t > 5.9 && t < 6.6) || (t > 7.3 && t < 8.0) ? beat(t) % 2 : 0;
  tubeStroke(poly([[640, 1400], [600, 1000 + tap * 60], [580, 960 + tap * 60]]), HUE.hero, A(t, 5.8));
  figure(180, 1250, .55, HUE.hero, 1, { arms: [-60, 140, 60, -20], mouth: mouthAt(t) }, t);
}
function sMoney(t) {
  word('+80 €', 540, 290, 190, HUE.gold, A(t, T.ottanta - .05), "'Fredoka'", 600);
  for (let i = 0; i < 8; i++) { const ph = (beat(t) + i) % 8, x = 220 + (i % 4) * 210, y = 640 + Math.floor(i / 4) * 220; tubeStroke(circ(x, y, 70), HUE.gold, t > T.ottanta ? (ph < 4 ? 1 : .25) : 0); if (t > T.ottanta) word('€', x, y + 4, 80, HUE.gold, ph < 4 ? 1 : .25, "'Fredoka'", 600); }
  figure(540, 1250, .8, HUE.hero, 1, t < T.ottanta ? { arms: [-60, 140, 60, 140], mouth: mouthAt(t) } : { arms: sw(t, [-90, -200, 90, -200], [-110, -170, 110, -170]), jump: sw(t, 40, 0), mouth: mouthAt(t), smile: true }, t);
}
function sPay(t) {
  // the game box sign and its price
  tubeStroke(() => { X.beginPath(); X.rect(640, 520, 300, 400); X.stroke(); }, HUE.gta, A(t, 11.1)); word('GTA 6', 790, 600, 80, HUE.gta, A(t, 11.1), "'Fredoka'", 600);
  tubeStroke(() => { X.beginPath(); X.arc(790, 800, 80, Math.PI, 0); X.stroke(); }, HUE.gold, A(t, 11.1));
  // the price fails a section at a time when it's paid
  const die = seg(t, 13.4, 13.9); X.save(); X.beginPath(); X.rect(0, 0, 540 + (1 - die) * 500, STREET); X.clip(); word('79,99 €', 540, 270, 150, HUE.white, A(t, T.prezzo - .05) * (die > 0 && die < 1 ? (hash(Math.floor(t * 40)) > .4 ? 1 : .3) : 1), "'Fredoka'", 600); X.restore();
  // coins chase from the hero to the box in 16ths
  if (t > 12.6 && t < 13.5) for (let i = 0; i < 6; i++) { const on = (Math.floor(t * 16) + i) % 3 === 0; tubeStroke(circ(330 + i * 55, 860 - Math.sin(i / 5 * Math.PI) * 120, 22), HUE.gold, on ? 1 : .15); }
  // one cent left
  if (t > T.avanza) { tubeStroke(circ(420, 1180, 34), HUE.gold, A(t, T.avanza)); word('0,01 €', 560, 1080, 100, HUE.gold, A(t, T.centesimo - .1), "'Fredoka'", 600); }
  const laugh = t > T.risata && t < T.risata + .8;
  figure(250, 1250, .8, HUE.hero, 1, laugh ? { arms: sw(t, [-40, 60, 40, 60], [-60, 40, 60, 40]), jump: sw(t, 20, 0), mouth: sw(t, 1, .4) } : { arms: [-60, 140, t < 13.4 ? 120 : 60, t < 13.4 ? 20 : 140], mouth: mouthAt(t), smile: t > T.risata }, t);
}
function sTurn(t) {
  // the hero switches to a big pointing pose, then the code strikes letter by letter on the top board
  const big = t < 17.3;
  figure(big ? 540 : 230, big ? 1350 : 1250, big ? 1.5 : .8, HUE.hero, 1, { arms: [-60, 140, big ? 30 : 130, big ? -40 : -60], mouth: mouthAt(t), smile: true }, t);
  if (t > 19.8) { word('+80 €', 700, 640, 150, HUE.gold, A(t, T.ottanta2 - .05), "'Fredoka'", 600);
    if (t > T.eGta) { word('GTA 6', 700, 880, 110, HUE.gta, A(t, T.eGta), "'Fredoka'", 600); word('GRATIS', 700, 1060, 120, HUE.gratis, A(t, T.gratis2 - .05), "'Fredoka'", 600); } }
}
function codeSign(t) {
  if (t < 17.3) return;
  X.font = "700 74px 'JB Mono'"; X.textAlign = 'center'; X.textBaseline = 'middle'; const cw = 64, x0 = 540 - (CODE.length - 1) * cw / 2;
  for (let i = 0; i < CODE.length; i++) { const k = strike(t, 17.5 + i * .1); tubeStroke(() => X.strokeText(CODE[i], x0 + i * cw, 270), HUE.hero, k); }
  spill(540, 270, 600, HUE.hero, strike(t, 17.5));
}
function sFriends(t) {
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], xs = [150, 340, 740, 930], end = t > T.linkBio;
  figure(540, 1250, .8, HUE.hero, 1, end ? { arms: [-60, 140, 40, -330], mouth: mouthAt(t), smile: true } : { arms: [-60, 140, 120, -40], mouth: mouthAt(t) }, t);
  hits.forEach((h, i) => { const k = strike(t, h - .1); if (k <= 0) return;
    figure(xs[i], 1250, .66, FR[i], k, end ? { arms: sw(t + i * .25, [-90, -200, 90, -200], [-110, -160, 110, -160]), jump: sw(t + i * .25, 30, 0) } : { arms: sw(t + i * .25, [-70, 120, 70, 120], [-90, -120, 90, -120]) }, t, true);
    if (!end && t < h + 1.5) word('+50 €', Math.min(Math.max(xs[i], 130), 950), 900, 70, HUE.gold, strike(t, h), "'Fredoka'", 600); });
  if (end) { word('LINK IN BIO', 540, 660, 120, HUE.hero, A(t, T.linkBio - .05), "'Fredoka'", 600);
    // a chasing arrow pointing up, filling in 16ths
    const n = Math.floor((t - T.bio) * 16) % 5; for (let i = 0; i < 4; i++) tubeStroke(poly([[460, 560 - i * 50], [540, 500 - i * 50], [620, 560 - i * 50]]), HUE.gold, t > T.bio && i <= n ? 1 : .12); }
}

// ———— compose: facade, then its reflection in the wet street ————
const refl = document.createElement('canvas'); refl.width = W; refl.height = H - STREET;
const SCN = [[0, 4.45, sHook], [4.45, 8.75, sPhone], [8.75, 11.05, sMoney], [11.05, 16.05, sPay], [16.05, 23.4, sTurn], [23.4, 99, sFriends]];
function render(t) {
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.drawImage(wall, 0, 0);
  SCN.find(([a, b]) => t >= a && t < b)[2](t); codeSign(t);
  // rain
  X.save(); X.strokeStyle = 'rgba(180,200,255,.18)'; X.lineWidth = 2; for (let i = 0; i < 70; i++) { const x = hash(i) * W, y = ((hash(i + 1) * STREET + t * 1500) % STREET); X.beginPath(); X.moveTo(x, y); X.lineTo(x - 6, y + 40); X.stroke(); } X.restore();
  const s = cv.width / W; out.setTransform(s, 0, 0, s, 0, 0); out.fillStyle = '#050307'; out.fillRect(0, 0, W, H);
  out.drawImage(fac, 0, 0);
  const g = refl.getContext('2d'); g.setTransform(1, 0, 0, -1, 0, refl.height); g.clearRect(0, 0, W, refl.height); g.filter = 'blur(6px)'; g.drawImage(fac, 0, STREET - refl.height, W, refl.height, 0, 0, W, refl.height); g.filter = 'none'; g.setTransform(1, 0, 0, 1, 0, 0);
  out.fillStyle = '#0b0910'; out.fillRect(0, STREET, W, H - STREET); out.globalAlpha = .55; out.drawImage(refl, 0, STREET); out.globalAlpha = 1;
  out.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 12; i++) out.fillRect(0, STREET + i * 42 + (t * 30 % 42), W, 2);   // ripples
  out.fillStyle = '#1a141e'; out.fillRect(0, STREET - 8, W, 10);                                                         // kerb
  const v = out.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); out.fillStyle = v; out.fillRect(0, 0, W, H);
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'strike'); ev(.25, 'hum'); ev(T.ioGioco, 'click'); ev(T.gratis - .05, 'strike');
ev(4.5, 'strike'); ev(T.aperto, 'strike'); ev(6.25, 'click'); ev(T.buddy + .1, 'strike'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'tick'); ev(T.amico, 'strike');
ev(T.ottanta - .05, 'strike'); for (let i = 0; i < 8; i++) ev(T.ottanta + .25 + i * .25, 'tick', { v: .5 });
ev(11.1, 'strike'); ev(T.prezzo - .05, 'strike'); for (let i = 0; i < 6; i++) ev(12.65 + i * .14, 'tick'); ev(13.4, 'fail'); ev(T.avanza, 'strike'); ev(T.centesimo - .1, 'strike');
ev(16.05, 'hum'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'strike', { v: .45 }); ev(T.ottanta2 - .05, 'strike'); ev(T.eGta, 'strike'); ev(T.gratis2 - .05, 'strike');
for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .1, 'strike'); ev(h, 'tick'); }
ev(T.linkBio - .05, 'strike'); ev(T.bio, 'hum');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 19.2 ? [{ id: 'code', text: CODE, x0: 60, y0: 220, x1: 1020, y1: 320 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("600 40px 'Fredoka'"), document.fonts.load("700 40px 'JB Mono'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
