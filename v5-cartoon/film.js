// V5 — Sci-Fi Sitcom Toon, vertical 1080×1920. Boiling thick outlines, flat fills with hard shadows, big white eyes, elastic mouths.
// An original cast; inspired by adult-swim-era sci-fi sitcom cartoons. Minimal text: only what the voice says, written into the world.
import { clamp, lerp, seg, eo, ei, back, hash, vnoise, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W, X = cv.getContext('2d');
const C = { line: '#1d1028', wall: '#3b2b63', wall2: '#2f2250', floor: '#2a1d3f', couch: '#d0533f', couch2: '#9e3a2d', skin: '#f2c49b', skin2: '#d39a72',
  beanie: '#ff8a1e', beanie2: '#d46a08', hood: '#2bb5a8', hood2: '#1d8a80', white: '#ffffff', tv: '#5d5a6e', tv2: '#45425a', glow: '#8ef0ff',
  portal: '#ff3fb4', portal2: '#ffd1ef', gold: '#ffcf3a', gold2: '#e0a200', alien: '#9be35a', alien2: '#6db53a', mouth: '#5a1630', red: '#ff4a4a' };
const LW = 7;
let ZOOM = 1, BOIL = 0;

// ———— boil: every outline is resampled and nudged along its normal, 3 drawings cycled at 12 fps ————
function boil(pts, amp = 1.7) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) { const [x, y] = pts[i], [x0, y0] = pts[(i - 1 + n) % n], [x1, y1] = pts[(i + 1) % n];
    let nx = -(y1 - y0), ny = x1 - x0; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const d = (vnoise(x * .05 + BOIL * 17.3 + y * .031) - .5) * 2 * amp / ZOOM; out.push([x + nx * d, y + ny * d]); }
  return out;
}
const ell = (cx, cy, rx, ry, rot = 0, n = 0) => { n = n || Math.max(24, Math.round((rx + ry) * ZOOM / 5)); const c = Math.cos(rot), s = Math.sin(rot);
  return Array.from({ length: n }, (_, i) => { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; }); };
function rrect(x, y, w, h, r) { const p = [], seg2 = (ax, ay, bx, by) => { const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) * ZOOM / 8)); for (let i = 0; i < n; i++) p.push([lerp(ax, bx, i / n), lerp(ay, by, i / n)]); };
  const arc = (cx, cy, a0) => { for (let i = 0; i < 6; i++) { const a = a0 + i / 6 * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  seg2(x + r, y, x + w - r, y); arc(x + w - r, y + r, -Math.PI / 2); seg2(x + w, y + r, x + w, y + h - r); arc(x + w - r, y + h - r, 0); seg2(x + w - r, y + h, x + r, y + h); arc(x + r, y + h - r, Math.PI / 2); seg2(x, y + h - r, x, y + r); arc(x + r, y + r, Math.PI); return p; }
function path(pts) { X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); }
// flat fill + one hard shadow shape clipped inside + boiling outline
function shape(pts, fill, shade, sdx = -14, sdy = -10, lw = LW) {
  const b = boil(pts); path(b); X.fillStyle = fill; X.fill();
  if (shade) { X.save(); path(b); X.clip(); X.translate(-sdx, -sdy); path(b); X.restore(); X.save(); path(b); X.clip(); X.beginPath(); X.rect(-9999, -9999, 1e5, 1e5); X.translate(sdx, sdy); path(b); X.fillStyle = shade; X.fill('evenodd'); X.restore(); }
  path(b); X.lineWidth = lw / ZOOM; X.strokeStyle = C.line; X.lineJoin = 'round'; X.stroke();
}
function tube(pts, w, fill) {   // a limb: thick stroke with an outline
  const b = pts; X.lineCap = 'round'; X.lineJoin = 'round';
  X.beginPath(); b.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.lineWidth = w + 2 * LW / ZOOM; X.strokeStyle = C.line; X.stroke(); X.lineWidth = w; X.strokeStyle = fill; X.stroke();
}
const font = (px, fam) => (X.font = `${px}px ${fam}`);
const A = (t, t0, d = .3) => seg(t, t0, t0 + d);

// ———— the hero ————
// o: x, y (hip), s (scale), look (-1..1), mouth (0..1), lid (0..1 deadpan), armL/armR: [ex, ey] hand positions relative to the shoulder, smile
function hero(o) {
  const { x, y, s = 1 } = o; X.save(); X.translate(x, y); X.scale(s, s);
  const z0 = ZOOM; ZOOM = z0 * s;
  // legs (sitting or standing)
  if (o.stand) { tube([[-40, 0], [-50, 170]], 44, '#3b3f6b'); tube([[40, 0], [50, 170]], 44, '#3b3f6b'); shape(ell(-56, 180, 46, 22), C.line, null); shape(ell(56, 180, 46, 22), C.line, null); }
  else { tube([[-40, 0], [-60, 60], [-70, 150]], 44, '#3b3f6b'); tube([[40, 0], [60, 60], [70, 150]], 44, '#3b3f6b'); shape(ell(-80, 160, 42, 20), C.line, null); shape(ell(80, 160, 42, 20), C.line, null); }
  // body: hoodie
  shape(rrect(-110, -250, 220, 270, 70), C.hood, C.hood2);
  shape(rrect(-40, -230, 80, 40, 18), C.hood2, null);
  // arms
  const arm = (side, hand) => { const sx = side * 92, sy = -200, hx = sx + hand[0], hy = sy + hand[1]; tube([[sx, sy], [lerp(sx, hx, .5) + side * 30, lerp(sy, hy, .5) + 20], [hx, hy]], 46, C.hood); shape(ell(hx, hy, 30, 28), C.skin, C.skin2); return [hx, hy]; };
  const hL = arm(-1, o.armL || [-20, 190]), hR = arm(1, o.armR || [20, 190]);
  // head: egg + beanie
  const hy = -400 + (o.bob || 0);
  shape(ell(0, hy, 150, 165), C.skin, C.skin2, -20, -14);
  shape([...ell(0, hy - 60, 156, 125)].filter(([px, py]) => py < hy - 70).concat([[150, hy - 70], [-150, hy - 70]]), C.beanie, C.beanie2);
  shape(rrect(-162, hy - 95, 324, 50, 25), C.beanie2, null);
  shape(ell(0, hy - 205, 30, 26), C.beanie, null);
  // eyes: big, touching, tiny pupils, heavy lids for deadpan
  const lk = (o.look || 0) * 14, lid = o.lid ?? .35, blink = (Math.floor(o.t * 12) % 47) < 2 ? 1 : 0;
  for (const sd of [-1, 1]) { const ex = sd * 54, ey = hy - 10; shape(ell(ex, ey, 58, 64), C.white, null);
    X.fillStyle = C.line; X.beginPath(); X.arc(ex + lk, ey + 8 + (o.lookY || 0) * 10, 6, 0, TAU); X.fill();
    const L = Math.max(lid, blink); if (L > 0) { X.save(); path(ell(ex, ey, 58, 64)); X.clip(); X.fillStyle = C.skin; X.fillRect(ex - 70, ey - 70, 140, 128 * L); X.lineWidth = LW / ZOOM; X.strokeStyle = C.line; X.beginPath(); X.moveTo(ex - 62, ey - 64 + 128 * L); X.lineTo(ex + 62, ey - 64 + 128 * L); X.stroke(); X.restore(); } }
  // brows
  X.lineWidth = 9 / ZOOM; X.lineCap = 'round'; X.strokeStyle = C.line; const br = o.brow || 0;
  for (const sd of [-1, 1]) { X.beginPath(); X.moveTo(sd * 20, hy - 88 - br * 20 * (sd > 0 ? 1 : .6)); X.lineTo(sd * 95, hy - 82 + br * 6); X.stroke(); }
  // mouth: parametric (open, width, curl)
  const m = clamp(o.mouth || 0), mw = 46 + (o.smile || 0) * 20, my = hy + 92, curl = (o.smile || 0) * 16;
  if (m > .08) { const mp = ell(0, my + m * 12, mw, 8 + m * 34); shape(mp, C.mouth, null); X.save(); path(mp); X.clip(); X.fillStyle = '#ff8aa0'; X.beginPath(); X.ellipse(0, my + 12 + m * 40, mw * .6, 18, 0, 0, TAU); X.fill(); X.fillStyle = C.white; X.fillRect(-mw, my - 10, mw * 2, 12 + m * 4); X.restore(); }
  else { X.lineWidth = 7 / ZOOM; X.beginPath(); X.moveTo(-mw, my - curl); X.quadraticCurveTo(0, my + curl * 1.4, mw, my - curl); X.stroke(); }
  ZOOM = z0; X.restore();
  return { hL: [x + hL[0] * s, y + hL[1] * s], hR: [x + hR[0] * s, y + hR[1] * s] };
}
// friends: simple variants (hair colour) and one three-eyed alien
function friend(x, y, s, kind, t, pop) {
  if (pop <= 0) return; const k = back(clamp(pop), 2.4); X.save(); X.translate(x, y); X.scale(s * k, s * k); const z0 = ZOOM; ZOOM = z0 * s;
  if (kind === 'alien') { shape(rrect(-80, -170, 160, 190, 60), C.alien, C.alien2); shape(ell(0, -260, 110, 100), C.alien, C.alien2);
    for (const [ex, er] of [[-50, 30], [0, 38], [50, 30]]) { shape(ell(ex, -275, er, er + 6), C.white, null); X.fillStyle = C.line; X.beginPath(); X.arc(ex, -270, 5, 0, TAU); X.fill(); }
    shape(ell(0, -200, 30, 10), C.mouth, null); tube([[-30, -350], [-50, -400]], 12, C.alien2); tube([[30, -350], [50, -400]], 12, C.alien2); }
  else { const [hc, hc2, top] = kind;
    shape(rrect(-90, -180, 180, 200, 60), top, null); shape(ell(0, -290, 110, 120), C.skin, C.skin2);
    shape([...ell(0, -330, 118, 95)].filter(([px, py]) => py < -330), hc, hc2);
    for (const sd of [-1, 1]) { shape(ell(sd * 40, -290, 42, 46), C.white, null); X.fillStyle = C.line; X.beginPath(); X.arc(sd * 40, -282, 5, 0, TAU); X.fill(); }
    X.lineWidth = 7 / ZOOM; X.strokeStyle = C.line; X.beginPath(); X.moveTo(-30, -215); X.quadraticCurveTo(0, -195, 30, -215); X.stroke(); }
  ZOOM = z0; X.restore();
}
const FRIENDS = [['#6a3c1e', '#4a2810', '#ffcf3a'], 'alien', ['#ffe066', '#d4b23a', '#ff6fa8'], ['#1d1028', '#000000', '#7b6cff']];

// ———— set ————
function room(t) {
  X.fillStyle = C.wall; X.fillRect(0, 0, W, H);
  X.fillStyle = C.wall2; for (let i = 0; i < 6; i++) X.fillRect(0, 300 + i * 160, W, 70);      // flat colour bands
  X.fillStyle = C.floor; X.fillRect(0, 1330, W, H - 1330);
  shape(rrect(760, 260, 220, 300, 30), '#24183d', null); shape(ell(870, 360, 50, 50), '#ffe9a8', null);   // window + a moon
}
function tvSet(x, y, s, t, on) {
  const z0 = ZOOM; X.save(); X.translate(x, y); X.scale(s, s); ZOOM = z0 * s;
  if (on) { X.fillStyle = 'rgba(142,240,255,.10)'; X.beginPath(); X.ellipse(0, 0, 520, 420, 0, 0, TAU); X.fill(); X.fillStyle = 'rgba(142,240,255,.08)'; X.beginPath(); X.ellipse(0, 0, 720, 560, 0, 0, TAU); X.fill(); }
  shape(rrect(-260, -170, 520, 340, 40), C.tv, C.tv2);
  const scr = rrect(-225, -135, 450, 270, 22);
  if (on) { const b = boil(scr); path(b); const g = X.createLinearGradient(0, -135, 0, 135); g.addColorStop(0, '#2a0a4a'); g.addColorStop(.55, '#ff4f8b'); g.addColorStop(.56, '#ff9a3a'); g.addColorStop(1, '#2a0a4a'); X.fillStyle = '#ff6a6a'; X.fill();
    X.save(); path(b); X.clip(); X.fillStyle = '#5a1b7a'; X.fillRect(-240, -140, 480, 140); X.fillStyle = '#ff9a3a'; X.fillRect(-240, 0, 480, 40); X.fillStyle = '#ffe066'; X.beginPath(); X.arc(0, 10, 70, Math.PI, 0); X.fill();
    X.fillStyle = '#241044'; for (let i = 0; i < 7; i++) X.fillRect(-230 + i * 68, -10 - (i % 3) * 30, 44, 160); X.restore();
    font(130, "'Lilita One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineWidth = 14 / ZOOM; X.strokeStyle = C.line; X.strokeText('GTA 6', 0, -40); X.fillStyle = '#fff3b0'; X.fillText('GTA 6', 0, -40);
    path(b); X.lineWidth = LW / ZOOM; X.strokeStyle = C.line; X.stroke(); }
  else shape(scr, '#111', null);
  shape(rrect(-40, 170, 80, 60, 10), C.tv2, null); shape(rrect(-160, 225, 320, 30, 12), C.tv2, null);
  ZOOM = z0; X.restore();
}
function couch(x, y) { shape(rrect(x - 420, y - 260, 840, 220, 80), C.couch, C.couch2); shape(rrect(x - 470, y - 120, 940, 200, 60), C.couch, C.couch2); shape(rrect(x - 500, y - 200, 110, 260, 50), C.couch2, null); shape(rrect(x + 390, y - 200, 110, 260, 50), C.couch2, null); }
function phone(x, y, s, rot, screenFn) {
  const z0 = ZOOM; X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); ZOOM = z0 * s;
  shape(rrect(-110, -200, 220, 400, 34), '#2d2a3c', null); const scr = rrect(-92, -170, 184, 340, 18); shape(scr, '#151022', null);
  X.save(); path(scr); X.clip(); screenFn && screenFn(); X.restore(); ZOOM = z0; X.restore();
}
function portal(x, y, r, a, t) {   // a magenta hexagonal portal (our own device)
  if (a <= 0) return; const k = back(clamp(a), 1.8), rr2 = r * k;
  const hex = rot => Array.from({ length: 6 }, (_, i) => { const an = i / 6 * TAU + rot; return [x + Math.cos(an) * rr2, y + Math.sin(an) * rr2 * .55]; });
  X.fillStyle = 'rgba(255,63,180,.18)'; X.beginPath(); X.ellipse(x, y, rr2 * 1.5, rr2 * .85, 0, 0, TAU); X.fill();
  shape(hex(t * 2), C.portal, null); shape(hex(-t * 3).map(([px, py]) => [lerp(x, px, .62), lerp(y, py, .62)]), C.portal2, null); shape(hex(t * 4).map(([px, py]) => [lerp(x, px, .3), lerp(y, py, .3)]), C.white, null);
}
function coin(x, y, r, spin, label) {
  const sx = Math.abs(Math.cos(spin)) * .85 + .15; X.save(); X.translate(x, y); X.scale(sx, 1); const z0 = ZOOM;
  shape(ell(0, 0, r, r), C.gold, C.gold2, -8, -6, LW * .8); if (label && sx > .5) { font(r * 1.1, "'Lilita One'"); X.fillStyle = C.gold2; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, 0, 4); }
  X.restore();
}
function priceTag(x, y, rot, a, label = '79,99 €', strike = 0) {
  if (a <= 0) return; X.save(); X.translate(x, y); X.rotate(rot); X.scale(back(clamp(a)), back(clamp(a)));
  shape([[-150, -50], [130, -50], [175, 0], [130, 50], [-150, 50]], '#fff7e0', null); shape(ell(115, 0, 12, 12), C.wall, null);
  font(70, "'Lilita One'"); X.fillStyle = C.line; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, -15, 5);
  if (strike > 0) { X.strokeStyle = C.red; X.lineWidth = 14; X.lineCap = 'round'; X.beginPath(); X.moveTo(-130, 25); X.lineTo(-130 + 240 * eo(strike), -20); X.stroke(); }
  X.restore();
}
function holo(x, y, w, h, a, fn) {   // a holographic panel projected from the phone
  if (a <= 0) return; const k = eo(clamp(a)); X.save(); X.translate(x, y); X.scale(1, k);
  X.fillStyle = 'rgba(142,240,255,.16)'; X.fillRect(-w / 2, -h / 2, w, h); X.strokeStyle = C.glow; X.lineWidth = 6; X.strokeRect(-w / 2, -h / 2, w, h);
  X.fillStyle = 'rgba(142,240,255,.10)'; for (let yy = -h / 2; yy < h / 2; yy += 12) X.fillRect(-w / 2, yy, w, 4);
  fn && fn(); X.restore();
}
function glowText(txt, x, y, px, fam, col = '#e9fdff') { font(px, fam); X.textAlign = 'center'; X.textBaseline = 'middle'; X.shadowColor = C.glow; X.shadowBlur = 24; X.fillStyle = col; X.fillText(txt, x, y); X.shadowBlur = 0; }

// ———— camera ————
function cam(cx, cy, z, f) { X.save(); X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-cx, -cy); ZOOM = z; f(); X.restore(); ZOOM = 1; }

// ———— scenes ————
function sHook(t) {   // 0 → 4.45: extreme close-up on the TV-lit eyes, pull back to the couch; the price tag snaps off on "gratis"
  const pull = eo(seg(t, .55, 1.1)), z = lerp(3.2, 1, pull);
  cam(540, lerp(700, 960, pull), z, () => {
    room(t); tvSet(540, 470, .85, t, true);
    priceTag(lerp(720, 980, seg(t, T.gratis, T.gratis + .55)), lerp(300, 1500, ei(seg(t, T.gratis, T.gratis + .55))), lerp(-.15, 1.4, seg(t, T.gratis, T.gratis + .55)), A(t, 1.3, .3));
    couch(540, 1420);
    const grab = A(t, T.ioGioco, .25), win = A(t, T.gratis, .25);
    hero({ x: 540, y: 1330, s: .9, t, mouth: mouthAt(t), lid: lerp(.35, .1, win), look: 0, lookY: -1, smile: win, brow: win * .8,
      armL: [lerp(-20, 40, grab), lerp(190, 120, grab)], armR: [lerp(20, -40, grab), lerp(190, 120, grab)], bob: Math.sin(t * 6) * 3 });
    if (grab > 0) shape(rrect(470, 1120, 140, 60, 26), '#2d2a3c', null);   // controller
  });
  if (t < .55) { X.fillStyle = 'rgba(142,240,255,.12)'; X.fillRect(0, 0, W, H); }
}
function sPhone(t) {   // 4.45 → 8.75: account + friend's code, on a big phone in his hand
  cam(540, 900, 1, () => {
    room(t); X.fillStyle = 'rgba(29,16,40,.35)'; X.fillRect(0, 0, W, H);
    hero({ x: 290, y: 1580, s: .9, t, mouth: mouthAt(t), lid: .4, look: 1, armR: [240, -230] });
    phone(650, 860, 1.55, .06, () => {
      const ok1 = t > T.buddy + .1, ok2 = t > T.amico;
      if (t < 7.15) { if (!ok1) { shape(rrect(-55, -60, 110, 110, 26), C.gold, C.gold2); font(80, "'Lilita One'"); X.fillStyle = C.line; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('B', 0, -2); }
        else { X.fillStyle = '#3ad17a'; X.fillRect(-100, -180, 200, 360); checkMark(0, 0, 60); } }
      else { shape(rrect(-80, -40, 160, 50, 14), '#ffffff', null); const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)); X.fillStyle = C.line; for (let i = 0; i < n; i++) { X.beginPath(); X.arc(-60 + i * 24, -15, 8, 0, TAU); X.fill(); }
        if (ok2) { X.fillStyle = '#3ad17a'; X.fillRect(-100, 30, 200, 160); checkMark(0, 100, 46); } }
    });
    const tp = t > 6.2 && t < 6.6 ? seg(t, 6.2, 6.6) : 0; if (tp > 0) { X.strokeStyle = '#ffffff'; X.lineWidth = 8; X.globalAlpha = 1 - tp; X.beginPath(); X.arc(660, 830, 40 + 120 * tp, 0, TAU); X.stroke(); X.globalAlpha = 1; }
  });
}
function checkMark(x, y, s) { X.strokeStyle = '#ffffff'; X.lineWidth = s * .3; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(x - s * .55, y); X.lineTo(x - s * .1, y + s * .45); X.lineTo(x + s * .6, y - s * .45); X.stroke(); }
function sMoney(t) {   // 8.75 → 11.05: the phone opens a portal and 80 € pour out
  cam(540, 960, 1, () => {
    room(t); couch(540, 1500);
    const op = A(t, 8.95, .3), pour = seg(t, T.ottanta - .1, T.ottanta + 1.1);
    portal(540, 520, 230, op, t);
    for (let i = 0; i < 16; i++) { const u = clamp(pour * 1.4 - hash(i) * .5); if (u <= 0) continue; const x = 540 + (hash(i + 3) - .5) * 360 + (hash(i + 7) - .5) * 200 * u; const y = lerp(520, 1180 - hash(i + 2) * 60, Math.min(1, u * u * 1.6)); coin(x, y, 46, t * 9 + i, '€'); }
    hero({ x: 540, y: 1400, s: .8, t, mouth: mouthAt(t), lid: lerp(.4, 0, A(t, T.ottanta, .2)), lookY: -1, brow: A(t, T.ottanta, .2), smile: A(t, T.ottanta, .3) * .6, armL: [-120, -60], armR: [120, -60] });
    if (t > T.ottanta) holo(540, 260, 520, 170, A(t, T.ottanta, .25), () => glowText('+80 €', 0, 6, 140, "'Lilita One'"));
  });
}
function sPay(t) {   // 11.05 → 16.05: 79,99 € — one cent left in his palm
  const close = eo(seg(t, 14.0, 14.5));
  cam(lerp(540, 640, close), lerp(960, 900, close), lerp(1, 1.9, close), () => {
    room(t); couch(540, 1500);
    hero({ x: 420, y: 1400, s: .8, t, mouth: mouthAt(t), lid: t > T.risata ? .1 : .4, smile: t > T.risata ? 1 : 0, look: 1, brow: t > T.risata ? .6 : 0, armR: [200, -40], armL: [-30, 180], bob: t > T.risata && t < T.risata + .6 ? Math.sin(t * 40) * 8 : 0 });
    // the game box in a holo-shop panel
    holo(760, 560, 420, 520, A(t, 11.1, .3), () => { shape(rrect(-120, -170, 240, 300, 18), '#5a1b7a', null); X.fillStyle = '#ffe066'; X.beginPath(); X.arc(0, 20, 60, Math.PI, 0); X.fill(); font(74, "'Lilita One'"); X.fillStyle = '#fff3b0'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('GTA 6', 0, -90); });
    priceTag(760, 900, -.05, A(t, T.prezzo - .05, .25));
    const pay = seg(t, 12.7, 13.6);
    if (pay > 0 && pay < 1) for (let i = 0; i < 8; i++) { const u = clamp(pay * 1.5 - i * .07); coin(lerp(640, 760, u), lerp(1040, 560, u) - Math.sin(u * Math.PI) * 120, 34, t * 9 + i, '€'); }
    if (t > T.avanza - .2) { coin(625, 1040, 26, Math.sin(t * 3) * .6, '1'); }
  });
}
function sTurn(t) {   // 16.05 → 23.4: he turns to you; the code as a hologram; +80 €; GTA practically free
  const lean = eo(seg(t, 16.05, 16.5)) * (1 - eo(seg(t, 17.1, 17.5)));
  cam(540, lerp(960, 820, lean), lerp(1, 1.5, lean), () => {
    room(t);
    hero({ x: 540, y: 1420, s: .95, stand: true, t, mouth: mouthAt(t), lid: .2, smile: .4, brow: .4, armR: t > 16.1 ? [70, -150] : [20, 190], armL: [-20, 190], bob: Math.sin(t * 5) * 3 });
  });
  holo(540, 520, 980, 300, A(t, 17.3, .3) * (1 - seg(t, 19.7, 19.75)), () => {
    font(34, "'Lilita One'"); X.fillStyle = C.glow; X.textAlign = 'center'; X.fillText('CODICE AMICO', 0, -95);
    font(90, "'JB Mono'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.shadowColor = C.glow; X.shadowBlur = 20; X.fillStyle = '#e9fdff';
    const cw = 62, x0 = -(CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) { if (t > 17.5 + i * .1) X.fillText(CODE[i], x0 + i * cw, 20); } X.shadowBlur = 0; });
  if (t > 19.8) { holo(540, 640, 540, 200, A(t, T.ottanta2 - .05, .25), () => glowText('+80 €', 0, 6, 140, "'Lilita One'"));
    if (t > T.eGta) { priceTag(540, 830, -.06, A(t, T.eGta, .25), '79,99 €', A(t, T.praticamente, .3)); if (t > T.gratis2) { X.save(); X.translate(560, 840); X.rotate(-.1); X.scale(back(A(t, T.gratis2, .2)), back(A(t, T.gratis2, .2))); font(120, "'Lilita One'"); X.textAlign = 'center'; X.lineWidth = 16; X.strokeStyle = C.line; X.strokeText('GRATIS', 0, 0); X.fillStyle = '#3ad17a'; X.fillText('GRATIS', 0, 0); X.restore(); } } }
}
function sFriends(t) {   // 23.4 → 34: friends come through the portal, +50 € each; then link in bio
  cam(540, 960, 1, () => {
    room(t); couch(540, 1500);
    const hits = [T.cinquanta0, T.c1, T.c2, T.c3], seats = [[200, 1380], [380, 1370], [720, 1375], [890, 1385]];
    portal(540, 560, 200, A(t, T.ogniAmico - .2, .3) * (1 - A(t, 29.7, .3)), t);
    hero({ x: 540, y: 1400, s: .72, t, mouth: mouthAt(t), lid: .2, smile: .6, brow: t > T.linkBio ? .8 : .3, armR: t > T.linkBio ? [60, -260] : [80, 80], armL: [-20, 180] });
    hits.forEach((h, i) => { const f = seg(t, h - .4, h); if (f <= 0) return; const [sx, sy] = seats[i], x = lerp(540, sx, eo(f)), y = lerp(620, sy, eo(f)) - Math.sin(f * Math.PI) * 160;
      friend(x, y, .7, FRIENDS[i], t, A(t, h - .4, .25));
      const c = A(t, h, .2); if (c > 0 && t < h + 1.4) { const cy = lerp(y - 400, y - 480, eo(c)); coin(x, cy, 52, t * 8, ''); font(64, "'Lilita One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineWidth = 12; X.strokeStyle = C.line; X.strokeText('+50 €', x, cy - 85); X.fillStyle = C.gold; X.fillText('+50 €', x, cy - 85); } });
  });
  if (t > T.linkBio) { const a = A(t, T.linkBio - .05, .3); holo(540, 600, 640, 230, a, () => { glowText('LINK IN BIO', 0, 20, 100, "'Lilita One'"); });
    X.save(); X.translate(540, 400 + Math.sin(t * 8) * 14); X.scale(back(a), back(a)); shape([[0, -90], [80, 0], [30, 0], [30, 80], [-30, 80], [-30, 0], [-80, 0]], C.glow, null); X.restore(); }
}
function codeStrip(t) {   // after the big hologram, the code stays at the top
  if (t < 19.75) return; const a = A(t, 19.75, .3);
  holo(540, 250, 900, 120, a, () => { font(66, "'JB Mono'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.shadowColor = C.glow; X.shadowBlur = 16; X.fillStyle = '#e9fdff'; X.fillText(CODE, 0, 4); X.shadowBlur = 0; });
}

const SCN = [[0, 4.45, sHook], [4.45, 8.75, sPhone], [8.75, 11.05, sMoney], [11.05, 16.05, sPay], [16.05, 23.4, sTurn], [23.4, 99, sFriends]];
function render(t) {
  X.setTransform(SC, 0, 0, SC, 0, 0); BOIL = Math.floor(t * 12) % 3; ZOOM = 1;
  SCN.find(([a, b]) => t >= a && t < b)[2](t);
  codeStrip(t);
  for (const [a] of SCN) { const k = seg(t, a, a + .08); if (a > 0 && k > 0 && k < 1) { X.fillStyle = `rgba(255,255,255,${.4 * (1 - k)})`; X.fillRect(0, 0, W, H); } }
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'zap'); ev(.55, 'whoosh'); ev(1.3, 'pop'); ev(T.ioGioco, 'click'); ev(T.gratis, 'snap'); ev(T.gratis + .5, 'thud');
ev(4.45, 'whoosh'); ev(6.25, 'click'); ev(T.buddy + .1, 'ding'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'click', { v: .6 }); ev(T.amico, 'ding');
ev(8.95, 'portal'); for (let i = 0; i < 10; i++) ev(T.ottanta - .05 + i * .1, 'coin', { v: .5 + hash(i) * .5 }); ev(T.ottanta, 'cash');
ev(11.1, 'whoosh'); ev(T.prezzo, 'pop'); for (let i = 0; i < 6; i++) ev(12.75 + i * .12, 'coin', { v: .6 }); ev(14.0, 'whoosh'); ev(T.avanza, 'ting');
ev(16.05, 'whoosh'); ev(17.3, 'holo'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'click', { v: .5 }); ev(19.75, 'holo'); ev(T.ottanta2, 'cash'); ev(T.praticamente, 'snap'); ev(T.gratis2, 'ding');
ev(T.ogniAmico - .2, 'portal'); for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .4, 'boing'); ev(h, 'coin'); }
ev(T.linkBio, 'holo'); ev(T.linkBio + .05, 'pop');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 19.75 ? [{ id: 'code', text: CODE, x0: 90, y0: 190, x1: 990, y1: 310 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("40px 'Lilita One'"), document.fonts.load("40px 'JB Mono'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
