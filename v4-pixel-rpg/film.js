// V4 — 16-bit Pixel RPG, vertical. Native 135×240 framebuffer scaled ×8 nearest-neighbour. Minimal text: only what the voice says.
import { clamp, lerp, seg, eo, back, hash } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const NW = 135, NH = 240, S = 8;
const cv = document.getElementById('c'); cv.width = innerWidth || 1080; cv.height = innerHeight || 1920;
const out = cv.getContext('2d'); out.imageSmoothingEnabled = false;
const fb = document.createElement('canvas'); fb.width = NW; fb.height = NH;
const X = fb.getContext('2d'); X.imageSmoothingEnabled = false;
const big = document.createElement('canvas'); big.width = 68; big.height = 120;   // world layer (for integer zooms)
const B = big.getContext('2d'); B.imageSmoothingEnabled = false;
let G = B;                                  // current target

const P = { K: '#181425', D: '#262b44', N: '#3a4466', B: '#5a6988', L: '#8b9bb4', W: '#ffffff', S: '#e8b796', S2: '#c28569', H: '#733e39',
  R: '#e43b44', R2: '#a22633', Y: '#feae34', Y2: '#f77622', Y3: '#fee761', G: '#63c74d', G2: '#3e8948', C: '#2ce8f5', PK: '#f6757a', U: '#0099db', U2: '#124e89', V: '#b55088', V2: '#68386c', O: '#b86f50', O2: '#743f39', O3: '#3f2832' };
const r = (x, y, w, h, c) => { G.fillStyle = P[c] || c; G.fillRect(Math.round(x), Math.round(y), w, h); };
const px = (x, y, c) => r(x, y, 1, 1, c);
function ln(x0, y0, x1, y1, c, th = 1) { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (;;) { r(x0, y0, th, th, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function dith(x, y, w, h, c1, c2, f) {   // ordered dither between two colours, f(x,y) → 0..1 share of c2
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) r(x + i, y + j, 1, 1, f(i, j) * 16 > BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] ? c2 : c1); }
function txt(s, x, y, c, align = 'left', sh = 'K') {
  G.font = "8px 'Press Start 2P'"; G.textBaseline = 'top'; G.textAlign = align;
  if (sh) { G.fillStyle = P[sh]; G.fillText(s, Math.round(x) + 1, Math.round(y) + 1); } G.fillStyle = P[c] || c; G.fillText(s, Math.round(x), Math.round(y)); }
const A = (t, t0, d = .3) => seg(t, t0, t0 + d);
const st = (t, fps = 8) => Math.floor(t * fps);          // sprites step at 8 fps

// ———— the cast (procedural sprites, feet at x,y) ————
function person(x, y, o = {}) {
  const c = { hood: 'U', hood2: 'U2', cap: 'R', cap2: 'R2', hair: null, pants: 'D', ...o.col };
  const j = Math.round(o.jump || 0); y -= j; x = Math.round(x); y = Math.round(y);
  const side = o.dir === 'right' ? 1 : o.dir === 'left' ? -1 : 0, step = o.walk ? (st(o.walk) % 2 ? 1 : -1) : 0;
  const arm = (sx, sy, ang, len = 6) => { const ex = sx + Math.sin(ang) * len, ey = sy + Math.cos(ang) * len; ln(sx, sy, ex, ey, 'K', 2); ln(sx, sy, ex, ey, c.hood); px(ex, ey, 'S'); px(ex + (ang > 0 ? 1 : 0), ey, 'S'); };
  // legs + shoes
  r(x - 3, y - 6, 6, 6, 'K'); r(x - 2, y - 6, 2, 5 + Math.max(0, step), c.pants); r(x + 1, y - 6, 2, 5 + Math.max(0, -step), c.pants);
  r(x - 4, y - 1, 3, 1, 'K'); r(x + 1, y - 1, 3, 1, 'K');
  // body
  const bw = side ? 7 : 8, bx = x - (side ? 3 : 4);
  r(bx - 1, y - 15, bw + 2, 10, 'K'); r(bx, y - 14, bw, 8, c.hood); r(bx, y - 8, bw, 2, c.hood2);
  if (!side) { r(x - 1, y - 13, 2, 3, c.hood2); }
  // arms (angles: 0 = down, π = up; left arm negative)
  arm(x - (side ? 1 : 4), y - 13, o.aL ?? -.25); arm(x + (side ? 1 : 3), y - 13, o.aR ?? .25);
  // head
  r(x - 5, y - 25, 10, 11, 'K'); r(x - 4, y - 24, 8, 9, 'S'); r(x - 4, y - 17, 8, 2, 'S2');
  if (c.hair) { r(x - 4, y - 25, 8, 3, c.hair); r(x - 5, y - 24, 1, 5, c.hair); r(x + 4, y - 24, 1, 5, c.hair); }
  else { r(x - 5, y - 26, 10, 4, 'K'); r(x - 4, y - 25, 8, 3, c.cap); r(x - 4, y - 23, 8, 1, c.cap2); if (side) r(x + side * 4, y - 23, side * 4, 1, 'K'); else r(x - 5, y - 22, 10, 1, c.cap2); }
  const blink = (st(o.t || 0, 8) + (o.seed || 0)) % 37 === 0;
  const ey = y - 20, m = o.mouth || 0;
  if (side) { r(x + side * 2, ey, 1, blink ? 1 : 2, 'K'); r(x + side * 2, y - 17, 2 * side, m > .35 ? 2 : 1, m > .35 ? 'R2' : 'O2'); }
  else { r(x - 2, ey, 1, blink ? 1 : 2, 'K'); r(x + 1, ey, 1, blink ? 1 : 2, 'K'); r(x - 1, y - 17, 2, m > .35 ? 2 : 1, m > .35 ? 'R2' : 'O2'); if (o.grin) { r(x - 2, y - 17, 4, 1, 'K'); r(x - 1, y - 16, 2, 1, 'R2'); } }
}
const HERO = {}, FRIENDS = [{ hood: 'G', hood2: 'G2', hair: 'H' }, { hood: 'PK', hood2: 'V', hair: 'Y2' }, { hood: 'Y', hood2: 'Y2', hair: 'O3' }, { hood: 'V', hood2: 'V2', hair: 'K' }];

// ———— props (world space: 68×120, shown ×2) ————
const WW = 68, WH = 120, FEET = 92;
function bang(x, y, a) { if (a <= 0) return; const k = a < .5 ? Math.round(a * 4) : 2; r(x - 4, y - 12 + 2 - k, 9, 12, 'K'); r(x - 3, y - 11 + 2 - k, 7, 10, 'W'); r(x - 1, y - 9 + 2 - k, 3, 5, 'R'); r(x - 1, y - 3 + 2 - k, 3, 2, 'R'); }
function coin(x, y, f) { const w = [4, 3, 1, 3][f % 4]; r(x - w / 2 - 1, y - 3, w + 2, 6, 'K'); r(x - w / 2, y - 2, w, 4, 'Y'); if (w > 2) px(x - w / 2, y - 2, 'Y3'); }
function sparkle(x, y, f, c = 'Y3') { const k = f % 3; px(x, y, 'W'); if (k) { px(x - k, y, c); px(x + k, y, c); px(x, y - k, c); px(x, y + k, c); } }
function tv(x, y, on) {   // 28×20 TV on a stand; the screen shows our own title card
  r(x - 1, y - 1, 30, 22, 'K'); r(x, y, 28, 20, 'D'); r(x + 2, y + 2, 24, 14, on ? 'V2' : 'K');
  if (on) { dith(x + 2, y + 2, 24, 14, 'V2', 'Y2', (i, j) => clamp((j - 3) / 10)); r(x + 9, y + 9, 10, 5, 'Y3'); r(x + 9, y + 11, 10, 1, 'Y2'); r(x + 2, y + 13, 24, 3, 'K'); for (let i = 0; i < 4; i++) r(x + 4 + i * 6, y + 10 - (i % 2) * 2, 2, 6, 'K'); }
  r(x + 11, y + 20, 6, 3, 'K'); r(x + 6, y + 22, 16, 2, 'K');
}
function room() {
  dith(0, 0, WW, 58, 'D', 'N', (i, j) => clamp(j / 58));
  r(4, 12, 18, 16, 'K'); dith(5, 13, 16, 14, 'U2', 'D', (i, j) => j / 14); r(12, 13, 1, 14, 'K'); r(5, 20, 16, 1, 'K'); r(7, 15, 3, 3, 'Y3'); px(16, 15, 'W'); px(18, 23, 'W');
  r(0, 58, WW, 1, 'K'); dith(0, 59, WW, 61, 'O2', 'O', (i, j) => (j % 7 < 1 ? 0 : .5)); for (let y = 65; y < WH; y += 7) r(0, y, WW, 1, 'O3');
}
function chest(x, y, open) {
  if (open > 0) for (let i = -3; i <= 3; i++) ln(x + 10, y - 16, x + 10 + i * 8, y - 50, 'Y3');
  r(x - 1, y - 13, 22, 14, 'K'); r(x, y - 12, 20, 12, 'O'); r(x, y - 8, 20, 1, 'O2'); r(x + 9, y - 9, 2, 3, 'Y');
  const lid = open > 0 ? 6 : 0; r(x - 1, y - 18 - lid, 22, 6, 'K'); r(x, y - 17 - lid, 20, 4, 'O'); r(x, y - 17 - lid, 20, 1, 'Y');
}
function gameBox(x, y) { r(x - 1, y - 1, 16, 20, 'K'); dith(x, y, 14, 18, 'V2', 'Y2', (i, j) => clamp((j - 4) / 12)); r(x + 3, y + 8, 8, 4, 'Y3'); r(x, y + 14, 14, 4, 'K'); r(x, y, 14, 5, 'K'); r(x + 2, y + 1, 2, 3, 'Y3'); r(x + 5, y + 1, 2, 3, 'Y3'); r(x + 8, y + 1, 4, 3, 'PK'); }
function priceTagUI(x, y, s, a, shatter = 0) {   // UI layer (native px)
  if (a <= 0) return; if (shatter > 0) { for (let i = 0; i < 22; i++) { const dx = (hash(i) - .5) * 80 * shatter, dy = (hash(i + 9) - .4) * 50 * shatter + shatter * shatter * 60; r(x + (hash(i * 3) - .5) * 40 + dx, y + 5 + dy, 3, 3, i % 3 ? 'W' : 'R'); } return; }
  const w = 62; r(x - w / 2 - 1, y - 1, w + 2, 14, 'K'); r(x - w / 2, y, w, 12, 'W'); r(x - w / 2 + 2, y + 5, 2, 2, 'K'); txt(s, x + 3, y + 2, 'K', 'center', null);
}
function box(x, y, w, h, fill = 'D') { r(x, y, w, h, 'K'); r(x + 1, y + 1, w - 2, h - 2, 'W'); r(x + 2, y + 2, w - 4, h - 4, fill); }
function arrowUp(x, y, f) { const b = f % 2; for (let i = 0; i < 8; i++) r(x - i, y + i - b, i * 2 + 1, 1, 'Y3'); r(x - 3, y + 8 - b, 7, 10, 'Y3'); }
function bigCheck(x, y, f) { for (let i = 0; i < 6; i++) r(x - 10 + i, y + i - 2, 3, 3, 'W'); for (let i = 0; i < 14; i++) r(x - 4 + i, y + 4 - i, 3, 3, 'W'); if (f % 2) sparkle(x + 14, y - 12, f); }
const UI = f => { const g = G; G = X; f(); G = g; };   // draw on the native UI layer

// ———— scenes: world (×2) + UI (×1) ————
function sceneRoom(t) {   // 0 → 4.45: the hook
  room(); tv(36, 34, t > .05); r(32, 56, 36, 3, 'O3'); r(34, 59, 2, 8, 'O3'); r(64, 59, 2, 8, 'O3');
  const grab = A(t, T.ioGioco, .2), win = A(t, T.gratis, .2), jump = Math.max(0, Math.sin(seg(t, T.gratis, T.gratis + .5) * Math.PI)) * 8;
  person(18, FEET, { dir: win > 0 ? 'front' : 'right', t, mouth: mouthAt(t), aL: win > 0 ? -2.7 : lerp(-.25, 1.4, grab), aR: win > 0 ? 2.7 : lerp(.25, 1.5, grab), jump, grin: win > 0 });
  if (grab > 0 && win <= 0) { r(23, 76, 6, 3, 'K'); r(24, 77, 4, 1, 'L'); }
  bang(18, 58, A(t, 0, .2) * (1 - seg(t, 1.6, 1.7)));
  return () => {
    if (t > .55) txt('GTA6', 100, 78, 'Y3', 'center');
    priceTagUI(100, 46, '79,99€', A(t, 2.0, .2), seg(t, T.gratis, T.gratis + .6));
    if (win > 0) { for (let i = 0; i < 10; i++) sparkle(10 + hash(i) * 115, 30 + hash(i + 4) * 120, st(t, 10) + i); txt('GRATIS!', 67, 30 + Math.round((1 - eo(A(t, T.gratis, .2))) * 10), 'Y3', 'center'); }
  };
}
function scenePhone(t) {   // 4.45 → 8.75 (UI screen): account + friend's code
  room();
  return () => {
    r(0, 0, NW, NH, 'rgba(24,20,37,.6)');
    const px0 = 30, py0 = 24; r(px0 - 2, py0 - 2, 78, 128, 'K'); r(px0 - 1, py0 - 1, 76, 126, 'L'); r(px0 + 2, py0 + 6, 70, 110, 'D'); r(px0 + 32, py0 + 1, 10, 2, 'K');
    const ok1 = t > T.buddy + .1, ok2 = t > T.amico;
    if (t < 7.15) {
      if (!ok1) { r(px0 + 23, py0 + 36, 28, 28, 'K'); r(px0 + 24, py0 + 37, 26, 26, 'Y'); r(px0 + 24, py0 + 59, 26, 4, 'Y2'); txt('B', px0 + 38, py0 + 46, 'K', 'center', null);
        const tap = A(t, 5.9, .4), hx = px0 + 44, hy = lerp(py0 + 120, py0 + 56, eo(tap)); r(hx - 1, hy, 6, 30, 'K'); r(hx, hy + 1, 4, 29, 'S'); }
      else { r(px0 + 2, py0 + 6, 70, 110, 'G2'); bigCheck(px0 + 37, py0 + 56, st(t, 10)); }
    } else {
      r(px0 + 8, py0 + 40, 58, 16, 'K'); r(px0 + 9, py0 + 41, 56, 14, 'W');
      const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)); for (let i = 0; i < n; i++) r(px0 + 14 + i * 8, py0 + 46, 5, 5, 'K');
      if (ok2) { r(px0 + 2, py0 + 66, 70, 50, 'G2'); bigCheck(px0 + 37, py0 + 88, st(t, 10)); }
    }
    box(4, 150, 46, 40, 'U2'); G.save(); G.beginPath(); G.rect(6, 152, 42, 36); G.clip(); G.translate(27, 200); G.scale(2, 2); G.translate(-27, -200); person(27, 200, { dir: 'front', t, mouth: mouthAt(t) }); G.restore();
  };
}
function sceneChest(t) {   // 8.75 → 11.05: +80 €
  room();
  const open = A(t, T.ottanta - .1, .1);
  chest(38, FEET, open);
  person(18, FEET, { dir: 'right', t, mouth: mouthAt(t), aL: open > 0 ? -2.6 : -.25, aR: open > 0 ? 2.6 : .25, jump: Math.max(0, Math.sin(seg(t, T.ottanta, T.ottanta + .5) * Math.PI)) * 6 });
  if (open > 0) { const u = seg(t, T.ottanta, T.ottanta + .6); for (let i = 0; i < 9; i++) coin(48 + (hash(i) - .5) * 26, 80 - eo(u) * (20 + hash(i + 2) * 30), st(t, 12) + i); }
  return () => { const a = A(t, T.ottanta + .05, .2); if (a > 0) { box(30, 34, 76, 28, 'U2'); txt('+80 €', 68, 44 + Math.round((1 - eo(a)) * 6), 'Y3', 'center'); } };
}
function sceneShop(t) {   // 11.05 → 16.05: 79,99 → one cent left
  dith(0, 0, WW, 60, 'O3', 'O2', (i, j) => j / 60); for (let i = 0; i < 3; i++) { r(3 + i * 22, 8, 18, 30, 'K'); r(4 + i * 22, 9, 16, 28, 'O2'); for (let k = 0; k < 4; k++) { r(6 + i * 22 + k * 4 - (k > 1 ? 8 : 0), 11 + (k > 1 ? 13 : 0), 3, 9, 'K'); r(7 + i * 22 + k * 4 - (k > 1 ? 8 : 0), 12 + (k > 1 ? 13 : 0), 1, 7, k % 2 ? 'U' : 'PK'); } }
  r(0, 60, WW, 60, 'O2'); for (let y = 66; y < WH; y += 7) r(0, y, WW, 1, 'O3');
  person(54, 72, { dir: 'left', t, col: { hood: 'G2', hood2: 'K', hair: 'L' }, mouth: 0, seed: 5 });
  r(30, 64, 38, 3, 'K'); r(30, 67, 38, 22, 'O'); r(30, 67, 38, 2, 'Y2');
  const pay = seg(t, 12.6, 13.3), got = A(t, 13.4, .3);
  gameBox(lerp(38, 18, eo(got)), lerp(45, 52, eo(got)));
  if (pay > 0 && pay < 1) for (let i = 0; i < 7; i++) { const u = clamp(pay * 1.4 - i * .06); coin(lerp(20, 44, u), 72 - Math.sin(u * Math.PI) * 18, st(t, 12) + i); }
  const laugh = t > T.risata && t < T.risata + .5 ? (st(t, 12) % 2) * 2 : 0;
  person(14, FEET, { dir: 'right', t, mouth: mouthAt(t), aR: got > 0 ? 1.6 : .25, jump: laugh, grin: t > T.risata });
  let cy = 0; if (t > T.avanza) { const b = seg(t, T.avanza, T.avanza + .5); cy = FEET - Math.abs(Math.sin(b * Math.PI * 3)) * 8 * (1 - b); coin(26, cy, st(t, 8)); sparkle(29, cy - 4, st(t, 8)); }
  return () => { priceTagUI(90, 70, '79,99€', A(t, T.prezzo - .05, .2) * (1 - got));
    const a = A(t, T.centesimo - .1, .2); if (a > 0) { box(26, 40, 82, 26, 'U2'); txt('0,01 €', 67, 49, 'Y3', 'center'); } };
}
function sceneTurn(t) {   // 16.05 → 23.4: your turn, the code, +80 €, GTA practically free
  room();
  if (t < 17.2) { // close-up: the hero turns to the viewer and points (world drawn ×2 again around him)
    G.save(); G.translate(34, 112); G.scale(2, 2); G.translate(-34, -112); person(34, 112, { dir: 'front', t, mouth: mouthAt(t), aR: lerp(.25, 1.9, eo(A(t, T.tocca, .2))), grin: true }); G.restore(); return () => {}; }
  person(14, FEET, { dir: 'front', t, mouth: mouthAt(t), aR: 1.9 });
  let ui = () => {};
  if (t > 19.8) { const open = A(t, T.ottanta2 - .1, .1); if (t < T.eGta) chest(38, FEET, open);
    if (open > 0 && t < T.eGta) { const u = seg(t, T.ottanta2, T.ottanta2 + .6); for (let i = 0; i < 8; i++) coin(48 + (hash(i) - .5) * 26, 80 - eo(u) * (20 + hash(i + 2) * 30), st(t, 12) + i); ui = () => txt('+80 €', 96, 70, 'Y3', 'center'); }
    if (t > T.eGta) { gameBox(40, 66); ui = () => { priceTagUI(94, 112, '79,99€', 1, seg(t, T.gratis2, T.gratis2 + .6)); if (t > T.gratis2) { for (let i = 0; i < 6; i++) sparkle(70 + hash(i) * 50, 110 + hash(i + 3) * 60, st(t, 10) + i); txt('GRATIS!', 94, 96, 'Y3', 'center'); } }; }
  }
  return ui;
}
function codeBox(t) {   // UI: the code, big, then docked at the top
  if (t < 17.25) return;
  if (t < 19.75) { box(4, 50, 127, 44, 'U2'); txt('CODICE AMICO', 67, 56, 'L', 'center', null);
    const n = Math.floor(clamp((t - 17.4) / .1, 0, CODE.length)); txt(CODE.slice(0, n), 11, 74, 'W', 'left');
    if (n < CODE.length && st(t, 8) % 2) r(11 + n * 8, 74, 7, 8, 'Y3'); }
  else { box(2, 20, 131, 16, 'U2'); txt(CODE, 67, 24, 'Y3', 'center'); }
}
function sceneParty(t) {   // 23.4 → 29.85: every friend +50 €
  room();
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], xs = [21, 34, 47, 60];
  person(8, FEET, { dir: 'front', t, mouth: mouthAt(t), aR: t > T.ogniAmico ? 1.4 : .25 });
  hits.forEach((h, i) => { const w = A(t, h - .55, .55); if (w <= 0) return; const x = lerp(80, xs[i], eo(w));
    person(x, FEET, { dir: w < 1 ? 'left' : 'front', walk: w < 1 ? t : 0, t, col: FRIENDS[i], seed: i * 7, jump: Math.max(0, Math.sin(seg(t, h, h + .35) * Math.PI)) * 5 }); });
  return () => hits.forEach((h, i) => { const p = A(t, h, .2); if (p > 0 && t < h + 1.5) { const yy = 118 - Math.round(eo(p) * 10); G = X; coinUI(xs[i] * 2, yy + 14, st(t, 12)); txt('+50', xs[i] * 2 + 1, yy, 'Y3', 'center'); } });
}
function coinUI(x, y, f) { const w = [6, 4, 2, 4][f % 4]; r(x - w / 2 - 1, y - 4, w + 2, 8, 'K'); r(x - w / 2, y - 3, w, 6, 'Y'); }
function sceneEnd(t) {   // 29.85 → 34: link in bio
  room();
  [8, 21, 34, 47, 60].forEach((x, i) => { const jmp = t > T.linkBio ? Math.max(0, Math.sin((t * 4 + i * .7) * Math.PI)) * 6 : 0;
    person(x, FEET, i === 0 ? { dir: 'front', t, mouth: mouthAt(t), aR: 2.8, jump: jmp } : { dir: 'front', t, col: FRIENDS[i - 1], seed: i * 7, aL: -2.6, aR: 2.6, jump: jmp }); });
  return () => { if (t > T.linkBio) { box(14, 70, 107, 26, 'U2'); txt('LINK IN BIO', 67, 79, 'Y3', 'center'); arrowUp(67, 50, st(t, 4)); } };
}

const SC = [[0, 4.45, sceneRoom], [4.45, 8.75, scenePhone], [8.75, 11.05, sceneChest], [11.05, 16.05, sceneShop], [16.05, 23.4, sceneTurn], [23.4, 29.85, sceneParty], [29.85, 99, sceneEnd]];
function render(t) {
  G = B; B.clearRect(0, 0, NW, NH);
  const s = SC.find(([a, b]) => t >= a && t < b), ui = s[2](t);
  X.clearRect(0, 0, NW, NH);
  // world ×2; the hook opens ×4 on the hero and the TV, then snaps out on the beat
  if (t < .55) X.drawImage(big, 1, 38, 34, 60, 0, 0, NW + 1, NH);
  else X.drawImage(big, 0, 0, WW, WH, 0, 0, WW * 2, WH * 2);
  G = X; ui && ui(); codeBox(t); G = B;
  for (const [a] of SC) { const k = seg(t, a, a + .1); if (k > 0 && k < 1) { X.fillStyle = `rgba(255,255,255,${.5 * (1 - k)})`; X.fillRect(0, 0, NW, NH); } }
  out.imageSmoothingEnabled = false; out.drawImage(fb, 0, 0, cv.width, cv.height);
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'alert'); ev(.05, 'boom'); ev(.55, 'blip'); ev(2.0, 'blip'); ev(T.ioGioco, 'blip'); ev(T.gratis, 'shatter'); ev(T.gratis + .05, 'fanfare');
ev(4.45, 'menu'); ev(6.25, 'blip'); ev(T.buddy + .1, 'ok'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'type'); ev(T.amico, 'ok');
ev(8.75, 'menu'); ev(T.ottanta - .1, 'chest'); ev(T.ottanta, 'fanfare');
ev(11.05, 'menu'); ev(12.6, 'coins'); ev(13.4, 'blip'); ev(T.avanza, 'coin'); ev(T.avanza + .17, 'coin', { v: .6 }); ev(T.avanza + .33, 'coin', { v: .4 });
ev(16.05, 'menu'); ev(T.tocca, 'alert'); for (let i = 0; i < CODE.length; i++) ev(17.4 + i * .1, 'type'); ev(19.75, 'ok');
ev(T.ottanta2 - .1, 'chest'); ev(T.ottanta2, 'fanfare'); ev(T.gratis2, 'shatter');
ev(23.4, 'menu'); for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .55, 'step'); ev(h, 'coinUp'); }
ev(29.85, 'menu'); ev(T.linkBio, 'fanfare');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 19.75 ? [{ id: 'code', text: CODE, x0: 0, y0: 160, x1: 1080, y1: 290 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("8px 'Press Start 2P'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
