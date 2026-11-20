// V8 — 1930s Rubber Hose Cartoon, vertical 1080×1920. Greyscale, noodle limbs, white gloves, pie eyes, object characters,
// everything breathing on the beat, on twos; film damage on top. Text only what the voice says, as period titles.
import { clamp, lerp, seg, eo, ei, back, hash, vnoise, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const out = cv.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; const X = buf.getContext('2d');
const G = { ink: '#141210', white: '#f6f1e6', g1: '#d9d2c4', g2: '#b9b1a2', g3: '#958d7f', g4: '#6f685d', g5: '#4a443c', shade: '#cfc7b6' };
const BEAT = .5;                                      // 120 bpm
const tw = t => Math.floor(t * 12) / 12;               // characters on twos
let BOIL = 0;
const breathe = (t, amp = .06) => 1 + amp * Math.cos(2 * Math.PI * tw(t) / BEAT);   // stretch on the beat, squash off it

// ———— line boil + shapes ————
function boil(pts, amp = 1.2) { const n = pts.length; return pts.map(([x, y], i) => { const [x0, y0] = pts[(i - 1 + n) % n], [x1, y1] = pts[(i + 1) % n]; let nx = -(y1 - y0), ny = x1 - x0; const l = Math.hypot(nx, ny) || 1; const d = (vnoise(x * .06 + BOIL * 13.1 + y * .04) - .5) * 2 * amp; return [x + nx / l * d, y + ny / l * d]; }); }
const ell = (cx, cy, rx, ry, n = 40) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * TAU) * rx, cy + Math.sin(i / n * TAU) * ry]);
function path(p) { X.beginPath(); p.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); }
function shape(pts, fill, band = true, lw = 6) { const b = boil(pts); path(b); X.fillStyle = fill; X.fill();
  if (band && fill !== G.ink) { X.save(); path(b); X.clip(); X.translate(16, 12); X.beginPath(); X.rect(-9999, -9999, 2e4, 2e4); path(b.map(([x, y]) => [x, y])); X.fillStyle = G.shade; X.restore(); }
  path(b); X.lineWidth = lw; X.strokeStyle = G.ink; X.lineJoin = 'round'; X.stroke(); }
function noodle(a, c, b, w, col = G.ink) { X.lineCap = 'round'; X.beginPath(); X.moveTo(...a); X.quadraticCurveTo(...c, ...b); X.lineWidth = w + 12; X.strokeStyle = G.ink; X.stroke(); X.lineWidth = w; X.strokeStyle = col; X.stroke(); }
function glove(x, y, s, rot = 0, point = false) { X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const parts = point ? [ell(0, 0, 34, 30), ell(30, -30, 11, 30), ell(-26, -8, 12, 18), ell(-6, 26, 30, 10)] : [ell(0, 0, 36, 32), ell(-22, -30, 13, 22), ell(0, -36, 13, 22), ell(22, -30, 13, 22), ell(-36, 4, 12, 18)];
  for (const p of parts) { path(boil(p)); X.lineWidth = 12; X.strokeStyle = G.ink; X.stroke(); } for (const p of parts) { path(boil(p)); X.fillStyle = G.white; X.fill(); }
  X.strokeStyle = G.ink; X.lineWidth = 3; for (let i = -1; i <= 1; i++) { X.beginPath(); X.moveTo(i * 10, -4); X.lineTo(i * 10, 14); X.stroke(); }
  shape([[-30, 28], [30, 28], [36, 52], [-36, 52]], G.white, false, 5); X.restore(); }
function pieEye(x, y, rx, ry, look = 0, blink = 0) { shape(ell(x, y, rx, ry, 30), G.white, false, 5);
  if (blink) { X.fillStyle = G.white; X.fillRect(x - rx, y - ry, rx * 2, ry * 2); X.lineWidth = 5; X.strokeStyle = G.ink; X.beginPath(); X.moveTo(x - rx, y); X.lineTo(x + rx, y); X.stroke(); return; }
  const px = x + look * rx * .25, py = y + ry * .12; X.fillStyle = G.ink; X.beginPath(); X.moveTo(px, py); X.ellipse(px, py, rx * .64, ry * .74, 0, -1.1, -.45, true); X.closePath(); X.fill(); }
function mouth(x, y, w, open, kind = 'smile') { X.strokeStyle = G.ink; X.lineWidth = 6; X.lineCap = 'round';
  if (open > .15) { shape(ell(x, y + open * 18, w * .7, 10 + open * 34, 24), G.ink, false, 5); X.fillStyle = G.g2; X.beginPath(); X.ellipse(x, y + open * 36, w * .35, 10, 0, 0, TAU); X.fill(); }
  else { X.beginPath(); X.moveTo(x - w, y - 10); X.quadraticCurveTo(x, y + 26, x + w, y - 10); X.stroke(); X.beginPath(); X.moveTo(x - w - 8, y - 18); X.lineTo(x - w + 4, y - 4); X.moveTo(x + w + 8, y - 18); X.lineTo(x + w - 4, y - 4); X.stroke(); } }

// ———— the hero ————
function hero(x, y, s, t, o = {}) {
  const b = breathe(t, o.amp || .05), sq = o.squash ?? 1;
  X.save(); X.translate(x, y); X.scale(s / Math.sqrt(b * sq), s * b * sq);
  // legs + shoes
  const kick = o.dance ? Math.sin(tw(t) * Math.PI * 4) * 30 : 0;
  noodle([-40, -170], [-60 - kick, -80], [-70 - kick, 0], 24); noodle([40, -170], [60 + kick, -80], [70 + kick, 0], 24);
  shape(ell(-90 - kick, 10, 62, 30), G.ink, false); shape(ell(90 + kick, 10, 62, 30), G.ink, false); X.fillStyle = G.white; X.fillRect(-130 - kick, 0, 14, 6); X.fillRect(110 + kick, 0, 14, 6);
  // body: a black bean with white buttons
  shape([...ell(0, -290, 110, 150)], G.ink, false); X.fillStyle = G.white; for (const yy of [-300, -240]) { X.beginPath(); X.arc(0, yy, 14, 0, TAU); X.fill(); }
  // arms
  const arm = (side, hand, point) => { const sx = side * 95, sy = -360, hx = sx + hand[0], hy = sy + hand[1]; noodle([sx, sy], [sx + hand[0] * .5 + side * 40, sy + hand[1] * .5 + 40], [hx, hy], 22); glove(hx, hy, 1, side * .3 + (hand[1] < -80 ? Math.PI : 0) * (side > 0 ? 1 : -1) * 0, point); };
  arm(-1, o.armL || [-60, 170]); arm(1, o.armR || [60, 170], o.point);
  // head: white face, black hair tuft + cap
  const hy = -560 + (o.bob || 0);
  shape(ell(0, hy, 150, 140), G.white); shape([[-150, hy - 30], [-140, hy - 110], [-60, hy - 160], [60, hy - 160], [140, hy - 110], [150, hy - 30], [90, hy - 70], [0, hy - 90], [-90, hy - 70]], G.ink, false);
  shape([[-165, hy - 105], [90, hy - 150], [200, hy - 120], [180, hy - 95], [-150, hy - 75]], G.g4, false);   // a flat cap
  const blink = Math.floor(tw(t) * 12) % 37 === 0 ? 1 : 0;
  pieEye(-50, hy - 10, 40, o.wide ? 64 : 52, o.look || 0, blink); pieEye(50, hy - 10, 40, o.wide ? 64 : 52, o.look || 0, blink);
  shape(ell(0, hy + 50, 26, 20), G.ink, false);                                                               // nose
  mouth(0, hy + 90, 58, o.mouth || 0);
  X.restore();
}
// object characters
function gameBox(x, y, s, t, o = {}) {   // a 3D box seen from slightly above, face on its front
  const b = breathe(t, .06); X.save(); X.translate(x, y); X.scale(s / Math.sqrt(b), s * b);
  shape([[-130, -420], [130, -420], [170, -460], [-90, -460]], G.g1, false); shape([[130, -420], [170, -460], [170, -40], [130, 0]], G.g4, false);
  shape([[-130, -420], [130, -420], [130, 0], [-130, 0]], G.g2, false);
  X.font = "62px 'Shrikhand'"; X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineWidth = 10; X.strokeStyle = G.ink; X.strokeText('GTA 6', 0, -350); X.fillStyle = G.white; X.fillText('GTA 6', 0, -350);
  pieEye(-45, -220, 32, 44, o.look || 0, 0); pieEye(45, -220, 32, 44, o.look || 0, 0); mouth(0, -120, 50, o.mouth || 0);
  noodle([-130, -40], [-150, 20], [-150, 60], 16); noodle([130, -40], [150, 20], [150, 60], 16); shape(ell(-170, 70, 44, 20), G.ink, false); shape(ell(170, 70, 44, 20), G.ink, false);
  if (o.armUp) { noodle([-130, -260], [-220, -320], [-240, -420], 16); glove(-240, -440, .8, 0); }
  X.restore();
}
function phoneChar(x, y, s, t, o = {}) { const b = breathe(t, .05); X.save(); X.translate(x, y); X.scale(s / Math.sqrt(b), s * b);
  shape([[-110, -380], [110, -380], [110, 0], [-110, 0]], G.g5, false); shape([[-85, -340], [85, -340], [85, -40], [-85, -40]], o.screen === 'ok' ? G.g1 : G.g3, false);
  if (o.screen === 'B') { X.font = "120px 'Shrikhand'"; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = G.white; X.lineWidth = 10; X.strokeStyle = G.ink; X.strokeText('B', 0, -230); X.fillText('B', 0, -230); }
  if (o.screen === 'code') { X.fillStyle = G.ink; for (let i = 0; i < (o.n || 0); i++) { X.beginPath(); X.arc(-60 + i * 24, -230, 9, 0, TAU); X.fill(); } }
  if (o.screen === 'ok') { X.strokeStyle = G.ink; X.lineWidth = 22; X.lineCap = 'round'; X.beginPath(); X.moveTo(-50, -210); X.lineTo(-10, -160); X.lineTo(60, -260); X.stroke(); }
  pieEye(-40, -110, 22, 28, 0, 0); pieEye(40, -110, 22, 28, 0, 0); mouth(0, -60, 26, o.mouth || 0); X.restore(); }
function coinChar(x, y, s, t, o = {}) { const step = Math.sin(tw(t) * Math.PI * 6 + (o.ph || 0)); X.save(); X.translate(x, y - Math.abs(step) * 16); X.scale(s, s);
  noodle([-20, 20], [-30, 40], [-34 + step * 14, 70], 10); noodle([20, 20], [30, 40], [34 - step * 14, 70], 10); shape(ell(-40 + step * 14, 76, 20, 10), G.ink, false); shape(ell(40 - step * 14, 76, 20, 10), G.ink, false);
  shape(ell(0, -20, 60, 60), G.g1); shape(ell(0, -20, 46, 46), G.g2, false); pieEye(-18, -30, 13, 18, 0, 0); pieEye(18, -30, 13, 18, 0, 0); mouth(0, 0, 16, 0);
  if (o.wave) { noodle([50, -20], [80, -60], [90, -100 + Math.sin(t * 20) * 14], 10); glove(92, -110 + Math.sin(t * 20) * 14, .45); }
  X.restore(); }
function friend(x, y, s, t, k, i) { if (k <= 0) return; const kk = back(clamp(k), 2.5); X.save(); X.translate(x, y); X.scale(kk, kk); X.translate(-x, -y);
  hero(x, y, s, t + i * .13, { dance: true, amp: .08, armL: [-120, -150], armR: [120, -150] });
  X.save(); X.translate(x, y - 560 * s * breathe(t + i * .13, .08)); X.scale(s, s);
  if (i === 0) shape([[-120, -110], [120, -110], [100, -200], [-100, -200]], G.g5, false);                 // a top hat
  if (i === 1) { shape([[0, -150], [-90, -200], [-90, -100]], G.g3, false); shape([[0, -150], [90, -200], [90, -100]], G.g3, false); }   // a bow
  if (i === 2) shape(ell(0, -170, 110, 40), G.g2, false);                                                  // a boater
  if (i === 3) shape([[-60, -150], [0, -260], [60, -150]], G.g4, false);                                   // a party hat
  X.restore(); X.restore(); }

// ———— titles ————
function title(txt, x, y, px, a, fam = "'Shrikhand'", wave = 0, t = 0) { if (a <= 0) return; const k = back(clamp(a), 2.2);
  X.save(); X.translate(x, y); X.scale(k, k); X.font = `${px}px ${fam}`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineJoin = 'round';
  const chars = [...txt], widths = chars.map(c => X.measureText(c).width), tot = widths.reduce((a, b) => a + b, 0); let cx = -tot / 2;
  chars.forEach((c, i) => { const yy = wave ? Math.sin(tw(t) * 8 + i * .7) * px * .08 : 0, x0 = cx + widths[i] / 2;
    X.fillStyle = G.ink; X.fillText(c, x0 + px * .06, yy + px * .07); X.lineWidth = px * .14; X.strokeStyle = G.ink; X.strokeText(c, x0, yy); X.fillStyle = G.white; X.fillText(c, x0, yy); cx += widths[i]; });
  X.restore(); }
function card(x, y, w, h, fn) { X.save(); X.translate(x, y); X.fillStyle = '#16130f'; X.fillRect(-w / 2, -h / 2, w, h); X.strokeStyle = G.white; X.lineWidth = 5; X.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28); X.lineWidth = 2; X.strokeRect(-w / 2 + 24, -h / 2 + 24, w - 48, h - 48);
  for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { X.fillStyle = G.white; X.beginPath(); X.arc(cx * (w / 2 - 14), cy * (h / 2 - 14), 9, 0, TAU); X.fill(); X.strokeStyle = G.white; X.beginPath(); X.arc(cx * (w / 2 - 14), cy * (h / 2 - 14), 16, 0, TAU); X.stroke(); }
  fn(); X.restore(); }

// ———— background (painted once): wallpaper, wainscot, checker floor ————
const room = document.createElement('canvas'); room.width = W; room.height = H;
(() => { const g = room.getContext('2d'); g.fillStyle = G.g2; g.fillRect(0, 0, W, 1250);
  for (let y = 40; y < 1250; y += 110) for (let x = (y / 110 % 2) * 60; x < W; x += 120) { g.fillStyle = G.g3; g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + 8, y - 12); g.lineTo(x - 8, y - 12); g.fill(); }
  g.fillStyle = G.g4; g.fillRect(0, 1020, W, 230); g.fillStyle = G.g5; g.fillRect(0, 1020, W, 16);
  for (let y = 1250, r = 0; y < H; y += 110, r++) for (let x = 0, c = 0; x < W; x += 135, c++) { g.fillStyle = (r + c) % 2 ? G.g3 : G.g1; g.fillRect(x, y, 135, 110); }
  for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(${hash(i) > .5 ? '255,255,255' : '0,0,0'},.05)`; g.fillRect(hash(i + 1) * W, hash(i + 2) * H, 3, 3); }
  g.strokeStyle = G.g5; g.lineWidth = 6; g.strokeRect(160, 180, 760, 560); g.fillStyle = G.g1; g.fillRect(163, 183, 754, 554); })();
function bg(t, z = 1) { const b = breathe(t, .015); X.save(); X.translate(W / 2, H); X.scale(z, z * b); X.translate(-W / 2, -H); X.drawImage(room, 0, 0); X.restore(); }

// ———— scenes ————
const A = (t, t0, d = .25) => seg(t, t0, t0 + d);
function sHook(t) {
  bg(t);
  // the TV cabinet with the title, and the box character hopping out on "gratis"
  shape([[180, 200], [900, 200], [900, 760], [180, 760]], G.g4, false); shape([[230, 240], [850, 240], [850, 700], [230, 700]], G.g1, false);
  title('GTA 6', 540, 470, 180, A(t, .3, .3), "'Shrikhand'", 1, t);
  const out = A(t, T.gratis - .2, .4);
  if (out > 0) { gameBox(lerp(540, 790, eo(out)), lerp(700, 1300, eo(out)) - Math.sin(out * Math.PI) * 300, .9, t, { mouth: .8, armUp: true }); title('GRATIS!', 540, 880, 170, A(t, T.gratis, .25), "'Shrikhand'", 1, t); }
  // tag flies away
  if (t > T.gratis) { const f = seg(t, T.gratis, T.gratis + .8); X.save(); X.translate(lerp(820, 1200, f), lerp(1000, 300, f)); X.rotate(f * 6); shape([[-90, -36], [70, -36], [100, 0], [70, 36], [-90, 36]], G.white, false); X.font = "44px 'Limelight'"; X.fillStyle = G.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('79,99 €', -6, 2); X.restore(); }
  else if (t > 1.6) { X.save(); X.translate(820, 640); X.rotate(-.2); shape([[-90, -36], [70, -36], [100, 0], [70, 36], [-90, 36]], G.white, false); X.font = "44px 'Limelight'"; X.fillStyle = G.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('79,99 €', -6, 2); X.restore(); }
  // anticipation → hold → snap: he pops up into frame
  const pop = t < .15 ? lerp(1, .8, t / .15) : t < .3 ? .8 : 1 + Math.exp(-(t - .3) * 9) * Math.sin((t - .3) * 30) * .25;
  hero(out > 0 ? 300 : 540, 1640, .95, t, { squash: pop, wide: t < 2, mouth: mouthAt(t), armR: t > T.gratis ? [80, -260] : [140, -60], armL: t > T.gratis ? [-80, -260] : [-60, 170], look: t < 2 ? 0 : 1, dance: t > T.gratis });
}
function sPhone(t) {
  bg(t);
  const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)), scr = t < 7.15 ? (t < T.buddy + .1 ? 'B' : 'ok') : (t < T.amico ? 'code' : 'ok');
  const giggle = (t > 6.1 && t < 6.7) || (t > 7.4 && t < 8.0);
  phoneChar(640, 1200 + (giggle ? Math.sin(t * 40) * 6 : 0), 1.25, t, { screen: scr, n, mouth: giggle ? .7 : 0 });
  hero(260, 1680, .8, t, { mouth: mouthAt(t), look: 1, armR: [260, -210], point: true });
}
function sMoney(t) {
  bg(t);
  phoneChar(780, 1300, .9, t, { screen: 'ok', mouth: .5 });
  for (let i = 0; i < 8; i++) { const u = seg(t, 9.0 + i * .14, 10.6 + i * .14); if (u <= 0 || u >= 1) continue; coinChar(lerp(760, 260, u), 1560, .9, t, { ph: i }); }
  hero(260, 1680, .8, t, { mouth: mouthAt(t), wide: t > T.ottanta, armL: [-90, 60], armR: [120, -80] });
  title('80 €', 600, 500, 260, A(t, T.ottanta - .05), "'Shrikhand'", 1, t);
}
function sPay(t) {
  bg(t);
  const chomp = t > 12.7 && t < 13.7 ? Math.abs(Math.sin(t * 12)) : 0;
  gameBox(720, 1500, 1, t, { mouth: chomp || (t > T.risata ? .3 : 0), look: -1 });
  X.save(); X.translate(720, 930); X.rotate(-.1); shape([[-120, -44], [90, -44], [126, 0], [90, 44], [-120, 44]], G.white, false); X.font = "58px 'Limelight'"; X.fillStyle = G.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('79,99 €', -10, 2); X.restore();
  for (let i = 0; i < 6; i++) { const u = seg(t, 12.6 + i * .16, 13.1 + i * .16); if (u <= 0 || u >= 1) continue; coinChar(lerp(350, 700, u), 1500 - Math.sin(u * Math.PI) * 360 - 200 * u, .7, t, { ph: i }); }
  if (t > T.avanza - .3) { coinChar(470, 1640, .55, t, { wave: true }); title('0,01 €', 400, 1260, 100, A(t, T.centesimo - .1), "'Limelight'"); }
  const laugh = t > T.risata && t < T.risata + 1.4;
  hero(250, 1680, .8, t, { mouth: laugh ? .6 + .4 * Math.abs(Math.sin(t * 18)) : mouthAt(t), bob: laugh ? Math.sin(tw(t) * 40) * 10 : 0, armL: laugh ? [-40, 60] : [-60, 170], armR: laugh ? [40, 60] : [120, -40] });
}
function sTurn(t) {
  // iris on his face, pointing at you; then the code on a period title card; +80 €; the box winks "GRATIS!"
  const close = t < 17.3;
  bg(t, close ? 1.6 : 1);
  if (close) { hero(540, 2350, 1.6, t, { mouth: mouthAt(t), wide: true, armR: [-30, -220], point: true }); return; }
  hero(230, 1680, .75, t, { mouth: mouthAt(t), armR: [160, -160], point: true });
  if (t < 19.75) card(540, 640, 980, 300, () => { X.font = "40px 'Limelight'"; X.fillStyle = G.white; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', 0, -70);
    X.font = "700 84px 'JB Mono'"; const cw = 60, x0 = -(CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) if (t > 17.5 + i * .1) X.fillText(CODE[i], x0 + i * cw, 30); });
  else { title('+80 €', 540, 620, 200, A(t, T.ottanta2 - .05), "'Shrikhand'", 1, t);
    if (t > T.eGta) { gameBox(760, 1560, .75, t, { mouth: .5, armUp: true }); title('GRATIS!', 680, 900, 150, A(t, T.gratis2 - .05), "'Shrikhand'", 1, t); } }
}
function sFriends(t) {
  bg(t);
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], xs = [150, 360, 720, 930], end = t > T.linkBio;
  hero(540, 1700, .62, t, { mouth: mouthAt(t), dance: end, armR: end ? [40, -280] : [120, -60], point: end });
  hits.forEach((h, i) => { friend(xs[i], 1700, .5, t, A(t, h - .3, .3), i); if (!end && t > h && t < h + 1.5) title('+50 €', xs[i] < 300 ? 200 : xs[i] > 800 ? 880 : xs[i], 1100, 80, A(t, h, .2), "'Limelight'"); });
  if (end) { title('Link in bio', 540, 620, 150, A(t, T.linkBio - .05), "'Shrikhand'", 1, t); glove(540, 400 + Math.sin(tw(t) * 12) * 16, 1.4, 0, true); }
}
function codeCard(t) { if (t < 19.75) return; card(540, 250, 980, 150, () => { X.font = "700 70px 'JB Mono'"; X.fillStyle = G.white; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(CODE, 0, 4); }); }

// ———— film damage composite ————
const vign = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = g.createRadialGradient(W / 2, H / 2, H * .28, W / 2, H / 2, H * .72); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,.65)'); g.fillStyle = r; g.fillRect(0, 0, W, H); return c; })();
function film(t, cut) {
  const s = cv.width / W; out.setTransform(s, 0, 0, s, 0, 0); out.fillStyle = '#000'; out.fillRect(0, 0, W, H);
  const f = Math.floor(t * 24), wx = (vnoise(t * 3) - .5) * 2.4, wy = (vnoise(t * 2.3 + 9) - .5) * 2.4 + (cut ? 6 : 0) + (hash(f) > .985 ? 8 : 0);
  out.save(); out.filter = `brightness(${1 + (hash(f * 1.3) - .5) * .08}) contrast(1.12) grayscale(1)`; out.drawImage(buf, wx, wy); out.restore();
  out.strokeStyle = 'rgba(255,255,255,.35)'; out.lineWidth = 2; for (let i = 0; i < 2; i++) { if (hash(f * .1 + i) < .4) continue; const x = (hash(Math.floor(t * 2) + i * 7) * W + t * 20) % W; out.beginPath(); out.moveTo(x, 0); out.lineTo(x + 6, H); out.stroke(); }
  for (let i = 0; i < 6; i++) { out.fillStyle = hash(f + i) > .5 ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.5)'; out.beginPath(); out.arc(hash(f * 3 + i) * W, hash(f * 5 + i) * H, 2 + hash(f + i * 9) * 4, 0, TAU); out.fill(); }
  out.drawImage(vign, 0, 0);
}
function iris(t, t0, open = true, d = .4, cx = 540, cy = 900) { if (t < t0) return; const k = seg(t, t0, t0 + d), r = (open ? eo(k) : 1 - ei(k)) * 1300; if ((open && k >= 1) || (!open && k <= 0)) return; X.save(); X.fillStyle = '#000'; X.beginPath(); X.rect(0, 0, W, H); X.arc(cx, cy, Math.max(1, r), 0, TAU, true); X.fill(); X.restore(); }

const SCN = [[0, 4.45, sHook], [4.45, 8.75, sPhone], [8.75, 11.05, sMoney], [11.05, 16.05, sPay], [16.05, 23.4, sTurn], [23.4, 99, sFriends]];
function render(t) {
  BOIL = Math.floor(t * 12) % 3; X.setTransform(1, 0, 0, 1, 0, 0);
  SCN.find(([a, b]) => t >= a && t < b)[2](t); codeCard(t);
  iris(t, 0, true, .35, 540, 1100); iris(t, 16.05, true, .3, 540, 1000);
  if (t > 33.4) iris(t, 33.4, false, .5, 540, 620);
  film(t, SCN.some(([a]) => t >= a && t < a + 1 / 24) || (t >= 17.3 && t < 17.3 + 1 / 24));
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'iris'); ev(.3, 'boing'); ev(.32, 'pop'); ev(T.gratis - .2, 'slide'); ev(T.gratis, 'honk'); ev(T.gratis + .1, 'whistle');
ev(4.45, 'pop'); ev(6.1, 'giggle'); ev(T.buddy + .1, 'ding'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'block'); ev(7.4, 'giggle'); ev(T.amico, 'ding');
ev(8.75, 'pop'); for (let i = 0; i < 8; i++) ev(9.0 + i * .14, 'boing', { v: .5 }); ev(T.ottanta - .05, 'honk');
ev(11.05, 'pop'); for (let i = 0; i < 6; i++) ev(13.0 + i * .16, 'gulp'); ev(T.avanza - .3, 'slide'); ev(T.centesimo - .1, 'ding');
ev(16.05, 'iris'); ev(T.tocca, 'honk'); ev(17.3, 'pop'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'block', { v: .6 }); ev(T.ottanta2 - .05, 'honk'); ev(T.eGta, 'boing'); ev(T.gratis2 - .05, 'whistle');
for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .3, 'boing'); ev(h, 'ding', { v: .7 }); }
ev(T.linkBio - .05, 'honk'); ev(33.4, 'iris');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 19.75 ? [{ id: 'code', text: CODE, x0: 50, y0: 175, x1: 1030, y1: 325 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("40px 'Shrikhand'"), document.fonts.load("40px 'Limelight'"), document.fonts.load("700 40px 'JB Mono'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
