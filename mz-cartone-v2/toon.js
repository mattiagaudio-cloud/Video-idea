// Cartoon kit (from the sitcom-toon film): boiling outlines, flat fills, big-eyed characters with palettes.
import { clamp, lerp, seg, eo, ei, back, hash, vnoise, TAU } from '/core/lib.js';
export { clamp, lerp, seg, eo, ei, back, hash, vnoise, TAU };
export const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
export const SC = cv.width / W, X = cv.getContext('2d');
export const C = { line: '#1d1028', wall: '#3b2b63', wall2: '#2f2250', floor: '#2a1d3f', couch: '#d0533f', couch2: '#9e3a2d', skin: '#f2c49b', skin2: '#d39a72',
  beanie: '#ff8a1e', beanie2: '#d46a08', hood: '#2bb5a8', hood2: '#1d8a80', white: '#ffffff', tv: '#5d5a6e', tv2: '#45425a', glow: '#8ef0ff',
  portal: '#ff3fb4', portal2: '#ffd1ef', gold: '#ffcf3a', gold2: '#e0a200', alien: '#9be35a', alien2: '#6db53a', mouth: '#5a1630', red: '#ff4a4a' };
export const LW = 7;
export const ST = { ZOOM: 1, BOIL: 0 };

// ———— boil: every outline is resampled and nudged along its normal, 3 drawings cycled at 12 fps ————
export function boil(pts, amp = 1.7) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) { const [x, y] = pts[i], [x0, y0] = pts[(i - 1 + n) % n], [x1, y1] = pts[(i + 1) % n];
    let nx = -(y1 - y0), ny = x1 - x0; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const d = (vnoise(x * .05 + ST.BOIL * 17.3 + y * .031) - .5) * 2 * amp / ST.ZOOM; out.push([x + nx * d, y + ny * d]); }
  return out;
}
export const ell = (cx, cy, rx, ry, rot = 0, n = 0) => { n = n || Math.max(24, Math.round((rx + ry) * ST.ZOOM / 5)); const c = Math.cos(rot), s = Math.sin(rot);
  return Array.from({ length: n }, (_, i) => { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; }); };
export function rrect(x, y, w, h, r) { const p = [], seg2 = (ax, ay, bx, by) => { const n = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) * ST.ZOOM / 8)); for (let i = 0; i < n; i++) p.push([lerp(ax, bx, i / n), lerp(ay, by, i / n)]); };
  const arc = (cx, cy, a0) => { for (let i = 0; i < 6; i++) { const a = a0 + i / 6 * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  seg2(x + r, y, x + w - r, y); arc(x + w - r, y + r, -Math.PI / 2); seg2(x + w, y + r, x + w, y + h - r); arc(x + w - r, y + h - r, 0); seg2(x + w - r, y + h, x + r, y + h); arc(x + r, y + h - r, Math.PI / 2); seg2(x, y + h - r, x, y + r); arc(x + r, y + r, Math.PI); return p; }
export function path(pts) { X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); }
// flat fill + one hard shadow shape clipped inside + boiling outline
export function shape(pts, fill, shade, sdx = -14, sdy = -10, lw = LW) {
  const b = boil(pts); path(b); X.fillStyle = fill; X.fill();
  if (shade) { X.save(); path(b); X.clip(); X.translate(-sdx, -sdy); path(b); X.restore(); X.save(); path(b); X.clip(); X.beginPath(); X.rect(-9999, -9999, 1e5, 1e5); X.translate(sdx, sdy); path(b); X.fillStyle = shade; X.fill('evenodd'); X.restore(); }
  path(b); X.lineWidth = lw / ST.ZOOM; X.strokeStyle = C.line; X.lineJoin = 'round'; X.stroke();
}
export function tube(pts, w, fill) {   // a limb: thick stroke with an outline
  const b = pts; X.lineCap = 'round'; X.lineJoin = 'round';
  X.beginPath(); b.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.lineWidth = w + 2 * LW / ST.ZOOM; X.strokeStyle = C.line; X.stroke(); X.lineWidth = w; X.strokeStyle = fill; X.stroke();
}
export const font = (px, fam) => (X.font = `${px}px ${fam}`);
export const A = (t, t0, d = .3) => seg(t, t0, t0 + d);

// ———— the hero ————
// o: x, y (hip), s (scale), look (-1..1), mouth (0..1), lid (0..1 deadpan), armL/armR: [ex, ey] hand positions relative to the shoulder, smile
export function hero(o) {
  const { x, y, s = 1 } = o; X.save(); X.translate(x, y); X.scale(s, s);
  const z0 = ST.ZOOM; ST.ZOOM = z0 * s;
  // legs (sitting or standing)
  if (o.stand) { tube([[-40, 0], [-50, 170]], 44, '#3b3f6b'); tube([[40, 0], [50, 170]], 44, '#3b3f6b'); shape(ell(-56, 180, 46, 22), C.line, null); shape(ell(56, 180, 46, 22), C.line, null); }
  else { tube([[-40, 0], [-60, 60], [-70, 150]], 44, '#3b3f6b'); tube([[40, 0], [60, 60], [70, 150]], 44, '#3b3f6b'); shape(ell(-80, 160, 42, 20), C.line, null); shape(ell(80, 160, 42, 20), C.line, null); }
  // body: hoodie
  const PH = o.pal || {}; shape(rrect(-110, -250, 220, 270, 70), PH.hood || C.hood, PH.hood2 || C.hood2);
  shape(rrect(-40, -230, 80, 40, 18), PH.hood2 || C.hood2, null);
  // arms
  const arm = (side, hand) => { const sx = side * 92, sy = -200, hx = sx + hand[0], hy = sy + hand[1]; tube([[sx, sy], [lerp(sx, hx, .5) + side * 30, lerp(sy, hy, .5) + 20], [hx, hy]], 46, PH.hood || C.hood); shape(ell(hx, hy, 30, 28), C.skin, C.skin2); return [hx, hy]; };
  const hL = arm(-1, o.armL || [-20, 190]), hR = arm(1, o.armR || [20, 190]);
  // head: egg + beanie
  const hy = -400 + (o.bob || 0);
  shape(ell(0, hy, 150, 165), C.skin, C.skin2, -20, -14);
  if (PH.hair) { shape([[-150, hy - 40], [-165, hy - 120], [-120, hy - 175], [-60, hy - 215], [-20, hy - 185], [30, hy - 230], [70, hy - 190], [130, hy - 200], [150, hy - 140], [160, hy - 50], [120, hy - 105], [40, hy - 120], [-40, hy - 110], [-110, hy - 95]], PH.hair, PH.hair2 || C.line); }
  else {
  shape([...ell(0, hy - 60, 156, 125)].filter(([px, py]) => py < hy - 70).concat([[150, hy - 70], [-150, hy - 70]]), C.beanie, C.beanie2);
  shape(rrect(-162, hy - 95, 324, 50, 25), C.beanie2, null);
  shape(ell(0, hy - 205, 30, 26), C.beanie, null);
  }
  // eyes: big, touching, tiny pupils, heavy lids for deadpan
  const lk = (o.look || 0) * 14, lid = o.lid ?? .35, blink = (Math.floor(o.t * 12) % 47) < 2 ? 1 : 0;
  for (const sd of [-1, 1]) { const ex = sd * 54, ey = hy - 10; shape(ell(ex, ey, 58, 64), C.white, null);
    X.fillStyle = C.line; X.beginPath(); X.arc(ex + lk, ey + 8 + (o.lookY || 0) * 10, 6, 0, TAU); X.fill();
    const L = Math.max(lid, blink); if (L > 0) { X.save(); path(ell(ex, ey, 58, 64)); X.clip(); X.fillStyle = C.skin; X.fillRect(ex - 70, ey - 70, 140, 128 * L); X.lineWidth = LW / ST.ZOOM; X.strokeStyle = C.line; X.beginPath(); X.moveTo(ex - 62, ey - 64 + 128 * L); X.lineTo(ex + 62, ey - 64 + 128 * L); X.stroke(); X.restore(); } }
  // brows
  X.lineWidth = 9 / ST.ZOOM; X.lineCap = 'round'; X.strokeStyle = C.line; const br = o.brow || 0;
  for (const sd of [-1, 1]) { X.beginPath(); X.moveTo(sd * 20, hy - 88 - br * 20 * (sd > 0 ? 1 : .6)); X.lineTo(sd * 95, hy - 82 + br * 6); X.stroke(); }
  // mouth: parametric (open, width, curl)
  const m = clamp(o.mouth || 0), mw = 46 + (o.smile || 0) * 20, my = hy + 92, curl = (o.smile || 0) * 16;
  if (m > .08) { const mp = ell(0, my + m * 12, mw, 8 + m * 34); shape(mp, C.mouth, null); X.save(); path(mp); X.clip(); X.fillStyle = '#ff8aa0'; X.beginPath(); X.ellipse(0, my + 12 + m * 40, mw * .6, 18, 0, 0, TAU); X.fill(); X.fillStyle = C.white; X.fillRect(-mw, my - 10, mw * 2, 12 + m * 4); X.restore(); }
  else { X.lineWidth = 7 / ST.ZOOM; X.beginPath(); X.moveTo(-mw, my - curl); X.quadraticCurveTo(0, my + curl * 1.4, mw, my - curl); X.stroke(); }
  ST.ZOOM = z0; X.restore();
  return { hL: [x + hL[0] * s, y + hL[1] * s], hR: [x + hR[0] * s, y + hR[1] * s] };
}
// friends: simple variants (hair colour) and one three-eyed alien
export function friend(x, y, s, kind, t, pop) {
  if (pop <= 0) return; const k = back(clamp(pop), 2.4); X.save(); X.translate(x, y); X.scale(s * k, s * k); const z0 = ST.ZOOM; ST.ZOOM = z0 * s;
  if (kind === 'alien') { shape(rrect(-80, -170, 160, 190, 60), C.alien, C.alien2); shape(ell(0, -260, 110, 100), C.alien, C.alien2);
    for (const [ex, er] of [[-50, 30], [0, 38], [50, 30]]) { shape(ell(ex, -275, er, er + 6), C.white, null); X.fillStyle = C.line; X.beginPath(); X.arc(ex, -270, 5, 0, TAU); X.fill(); }
    shape(ell(0, -200, 30, 10), C.mouth, null); tube([[-30, -350], [-50, -400]], 12, C.alien2); tube([[30, -350], [50, -400]], 12, C.alien2); }
  else { const [hc, hc2, top] = kind;
    shape(rrect(-90, -180, 180, 200, 60), top, null); shape(ell(0, -290, 110, 120), C.skin, C.skin2);
    shape([...ell(0, -330, 118, 95)].filter(([px, py]) => py < -330), hc, hc2);
    for (const sd of [-1, 1]) { shape(ell(sd * 40, -290, 42, 46), C.white, null); X.fillStyle = C.line; X.beginPath(); X.arc(sd * 40, -282, 5, 0, TAU); X.fill(); }
    X.lineWidth = 7 / ST.ZOOM; X.strokeStyle = C.line; X.beginPath(); X.moveTo(-30, -215); X.quadraticCurveTo(0, -195, 30, -215); X.stroke(); }
  ST.ZOOM = z0; X.restore();
}
export const FRIENDS = [['#6a3c1e', '#4a2810', '#ffcf3a'], 'alien', ['#ffe066', '#d4b23a', '#ff6fa8'], ['#1d1028', '#000000', '#7b6cff']];

// ———— set ————
export function room(t) {
  X.fillStyle = C.wall; X.fillRect(0, 0, W, H);
  X.fillStyle = C.wall2; for (let i = 0; i < 6; i++) X.fillRect(0, 300 + i * 160, W, 70);      // flat colour bands
  X.fillStyle = C.floor; X.fillRect(0, 1330, W, H - 1330);
  shape(rrect(760, 260, 220, 300, 30), '#24183d', null); shape(ell(870, 360, 50, 50), '#ffe9a8', null);   // window + a moon
}
export function tvSet(x, y, s, t, on) {
  const z0 = ST.ZOOM; X.save(); X.translate(x, y); X.scale(s, s); ST.ZOOM = z0 * s;
  if (on) { X.fillStyle = 'rgba(142,240,255,.10)'; X.beginPath(); X.ellipse(0, 0, 520, 420, 0, 0, TAU); X.fill(); X.fillStyle = 'rgba(142,240,255,.08)'; X.beginPath(); X.ellipse(0, 0, 720, 560, 0, 0, TAU); X.fill(); }
  shape(rrect(-260, -170, 520, 340, 40), C.tv, C.tv2);
  const scr = rrect(-225, -135, 450, 270, 22);
  if (on) { const b = boil(scr); path(b); const g = X.createLinearGradient(0, -135, 0, 135); g.addColorStop(0, '#2a0a4a'); g.addColorStop(.55, '#ff4f8b'); g.addColorStop(.56, '#ff9a3a'); g.addColorStop(1, '#2a0a4a'); X.fillStyle = '#ff6a6a'; X.fill();
    X.save(); path(b); X.clip(); X.fillStyle = '#5a1b7a'; X.fillRect(-240, -140, 480, 140); X.fillStyle = '#ff9a3a'; X.fillRect(-240, 0, 480, 40); X.fillStyle = '#ffe066'; X.beginPath(); X.arc(0, 10, 70, Math.PI, 0); X.fill();
    X.fillStyle = '#241044'; for (let i = 0; i < 7; i++) X.fillRect(-230 + i * 68, -10 - (i % 3) * 30, 44, 160); X.restore();
    font(130, "'Lilita One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineWidth = 14 / ST.ZOOM; X.strokeStyle = C.line; X.strokeText('GTA 6', 0, -40); X.fillStyle = '#fff3b0'; X.fillText('GTA 6', 0, -40);
    path(b); X.lineWidth = LW / ST.ZOOM; X.strokeStyle = C.line; X.stroke(); }
  else shape(scr, '#111', null);
  shape(rrect(-40, 170, 80, 60, 10), C.tv2, null); shape(rrect(-160, 225, 320, 30, 12), C.tv2, null);
  ST.ZOOM = z0; X.restore();
}
export function couch(x, y) { shape(rrect(x - 420, y - 260, 840, 220, 80), C.couch, C.couch2); shape(rrect(x - 470, y - 120, 940, 200, 60), C.couch, C.couch2); shape(rrect(x - 500, y - 200, 110, 260, 50), C.couch2, null); shape(rrect(x + 390, y - 200, 110, 260, 50), C.couch2, null); }
export function phone(x, y, s, rot, screenFn) {
  const z0 = ST.ZOOM; X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); ST.ZOOM = z0 * s;
  shape(rrect(-110, -200, 220, 400, 34), '#2d2a3c', null); const scr = rrect(-92, -170, 184, 340, 18); shape(scr, '#151022', null);
  X.save(); path(scr); X.clip(); screenFn && screenFn(); X.restore(); ST.ZOOM = z0; X.restore();
}
export function portal(x, y, r, a, t) {   // a magenta hexagonal portal (our own device)
  if (a <= 0) return; const k = back(clamp(a), 1.8), rr2 = r * k;
  const hex = rot => Array.from({ length: 6 }, (_, i) => { const an = i / 6 * TAU + rot; return [x + Math.cos(an) * rr2, y + Math.sin(an) * rr2 * .55]; });
  X.fillStyle = 'rgba(255,63,180,.18)'; X.beginPath(); X.ellipse(x, y, rr2 * 1.5, rr2 * .85, 0, 0, TAU); X.fill();
  shape(hex(t * 2), C.portal, null); shape(hex(-t * 3).map(([px, py]) => [lerp(x, px, .62), lerp(y, py, .62)]), C.portal2, null); shape(hex(t * 4).map(([px, py]) => [lerp(x, px, .3), lerp(y, py, .3)]), C.white, null);
}
export function coin(x, y, r, spin, label) {
  const sx = Math.abs(Math.cos(spin)) * .85 + .15; X.save(); X.translate(x, y); X.scale(sx, 1); const z0 = ST.ZOOM;
  shape(ell(0, 0, r, r), C.gold, C.gold2, -8, -6, LW * .8); if (label && sx > .5) { font(r * 1.1, "'Lilita One'"); X.fillStyle = C.gold2; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, 0, 4); }
  X.restore();
}
export function priceTag(x, y, rot, a, label = '79,99 €', strike = 0) {
  if (a <= 0) return; X.save(); X.translate(x, y); X.rotate(rot); X.scale(back(clamp(a)), back(clamp(a)));
  shape([[-150, -50], [130, -50], [175, 0], [130, 50], [-150, 50]], '#fff7e0', null); shape(ell(115, 0, 12, 12), C.wall, null);
  font(70, "'Lilita One'"); X.fillStyle = C.line; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, -15, 5);
  if (strike > 0) { X.strokeStyle = C.red; X.lineWidth = 14; X.lineCap = 'round'; X.beginPath(); X.moveTo(-130, 25); X.lineTo(-130 + 240 * eo(strike), -20); X.stroke(); }
  X.restore();
}
export function holo(x, y, w, h, a, fn) {   // a holographic panel projected from the phone
  if (a <= 0) return; const k = eo(clamp(a)); X.save(); X.translate(x, y); X.scale(1, k);
  X.fillStyle = 'rgba(142,240,255,.16)'; X.fillRect(-w / 2, -h / 2, w, h); X.strokeStyle = C.glow; X.lineWidth = 6; X.strokeRect(-w / 2, -h / 2, w, h);
  X.fillStyle = 'rgba(142,240,255,.10)'; for (let yy = -h / 2; yy < h / 2; yy += 12) X.fillRect(-w / 2, yy, w, 4);
  fn && fn(); X.restore();
}
export function glowText(txt, x, y, px, fam, col = '#e9fdff') { font(px, fam); X.textAlign = 'center'; X.textBaseline = 'middle'; X.shadowColor = C.glow; X.shadowBlur = 24; X.fillStyle = col; X.fillText(txt, x, y); X.shadowBlur = 0; }

export function checkMark(x, y, s) { X.strokeStyle = '#ffffff'; X.lineWidth = s * .3; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(x - s * .55, y); X.lineTo(x - s * .1, y + s * .45); X.lineTo(x + s * .6, y - s * .45); X.stroke(); }
