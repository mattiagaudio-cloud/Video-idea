// Paper stick-figure kit (from the stick-figure explainer): figures, type, boxes, coins, chains of hands.
import { clamp, lerp, seg, eo, ei, back, hash, TAU } from '/core/lib.js';
export { clamp, lerp, seg, eo, ei, back, hash, TAU };
export const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
export const SC = cv.width / W, X = cv.getContext('2d');
export const C = { paper: '#F3F0EA', ink: '#24242C', mute: '#9C978C', tint: '#E2DDD2', acc: '#EB4A2A' };
export const J = "'Jost'", MONO = "'JB Mono'";
export const font = (px, fam, w) => (X.font = `${w} ${px}px ${fam}`);
export const M = 90;                       // left margin
export const GROUND = 1185;                // the system line
export const A = (t, t0, d = .4) => seg(t, t0, t0 + d);
export const spr = (t, t0, d = .4) => { const u = seg(t, t0, t0 + d); return u <= 0 ? 0 : back(u, 2.2); };   // pop out of the ground, ~20 % overshoot

// paper grain, drawn once
export const grain = (() => { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'); const d = g.createImageData(540, 960);
  for (let i = 0; i < d.data.length; i += 4) { const v = hash(i * .37) * 6 - 3; d.data[i] = 128 + v; d.data[i + 1] = 128 + v; d.data[i + 2] = 128 + v; d.data[i + 3] = 16; } g.putImageData(d, 0, 0); return c; })();

// ———— type ————
export function say(txt, x, y, px, col, a, w = 600, align = 'left', e = 0) {   // slides up 18 px while fading in
  if (a <= 0 || e >= 1) return; X.save(); X.globalAlpha = clamp(a) * (1 - e); font(px, J, w); X.fillStyle = col; X.textAlign = align; X.textBaseline = 'alphabetic';
  X.fillText(txt, x, y + (1 - eo(a)) * (px > 120 ? 40 : 18)); X.restore();
}
export function subtitle(t) {
  const s = SUBS.find(([a, b]) => t >= a && t < b); if (!s) return; const a = A(t, s[0], .25);
  X.save(); X.globalAlpha = clamp(a); X.fillStyle = C.acc; X.fillRect(M, 1290, 5, 104);
  font(42, J, 500); X.fillStyle = C.ink; X.textAlign = 'left'; X.textBaseline = 'top';
  const words = s[2].split(' '), lines = []; let cur = ''; for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (X.measureText(tt).width > 840 && cur) { lines.push(cur); cur = w; } else cur = tt; } lines.push(cur);
  lines.slice(0, 2).forEach((l, i) => X.fillText(l, M + 26, 1290 + i * 54)); X.restore();
}

// ———— figures ————
// pose: arms as hand targets relative to the shoulder (in figure heights), or 'clasp' points in world coords
export function figure(x, h, o) {
  const k = o.pop ?? 1; if (k <= 0) return null;
  const hh = h * Math.min(1, k), jump = o.jump || 0, y0 = GROUND - jump * h;
  const lw = 8 * Math.sqrt(h / 380);
  const hip = [x, y0 - hh * .45], sh = [x + (o.lean || 0) * hh * .05, y0 - hh * .74], head = [sh[0], sh[1] - hh * .14], hr = hh * .11;
  X.save(); X.strokeStyle = C.ink; X.lineWidth = lw; X.lineCap = 'round'; X.lineJoin = 'round';
  const q = (a, c, b) => { X.beginPath(); X.moveTo(a[0], a[1]); X.quadraticCurveTo(c[0], c[1], b[0], b[1]); X.stroke(); };
  // legs (feet planted, knees bend slightly outward)
  const step = o.walk ? Math.sin(o.walk * 10) * hh * .06 : 0;
  q(hip, [x - hh * .07, y0 - hh * .2], [x - hh * .1 + step, y0]); q(hip, [x + hh * .07, y0 - hh * .2], [x + hh * .1 - step, y0]);
  q(hip, [x + (o.lean || 0) * hh * .03, (hip[1] + sh[1]) / 2], sh);   // spine
  const hands = [];
  for (const side of [-1, 1]) {
    const arm = side < 0 ? o.armL : o.armR; let hand;
    if (arm && arm.clasp) hand = arm.clasp; else { const ang = arm?.a ?? (side * .25); hand = [sh[0] + Math.sin(ang) * hh * .33, sh[1] + Math.cos(ang) * hh * .33]; }
    const mid = [(sh[0] + hand[0]) / 2 + side * hh * .05, (sh[1] + hand[1]) / 2 + hh * .05];
    q(sh, mid, hand); hands.push({ sh, mid, hand });
  }
  // head: paper disc with an ink ring (accent ring for the viewer)
  X.beginPath(); X.arc(head[0], head[1] - hr * .2, hr, 0, TAU); X.fillStyle = C.paper; X.fill(); X.strokeStyle = o.acc ? C.acc : C.ink; X.lineWidth = o.acc ? lw * 1.4 : lw; X.stroke();
  if (o.label) { font(26, J, 500); X.fillStyle = o.acc ? C.acc : C.mute; X.textAlign = 'center'; X.textBaseline = 'top'; X.fillText(o.label, x, GROUND + 22); }
  X.restore();
  return { hands, sh, head, x };
}
export function box(x, label, price, a, strike = 0, gratis = 0) {   // the game: a plain box on the line
  if (a <= 0) return; const h = 300 * eo(a), w = 230;
  X.save(); X.strokeStyle = C.ink; X.lineWidth = 7; X.fillStyle = C.tint; X.beginPath(); X.rect(x - w / 2, GROUND - h, w, h); X.fill(); X.stroke();
  if (a > .6) { font(64, J, 600); X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, x, GROUND - h + 80);
    if (price) { font(44, J, 500); X.fillStyle = C.ink; X.fillText(price, x, GROUND - 90); if (strike > 0) { X.strokeStyle = C.acc; X.lineWidth = 7; X.beginPath(); X.moveTo(x - 90, GROUND - 90); X.lineTo(x - 90 + 180 * eo(strike), GROUND - 90); X.stroke(); } } }
  if (gratis > 0) { X.globalAlpha = clamp(gratis); font(52, J, 600); X.fillStyle = C.acc; X.textAlign = 'center'; X.fillText('gratis', x, GROUND - 30); }
  X.restore();
}
export function coin(x, y, r, a) { if (a <= 0) return; X.save(); X.translate(x, y); X.scale(eo(a), eo(a)); X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = C.acc; X.fill(); font(r * 1.1, J, 600); X.fillStyle = C.paper; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('1', 0, 3); X.restore(); }
export function arrowUp(x, y, a) { if (a <= 0) return; X.save(); X.translate(x, y + (1 - eo(a)) * 40); X.globalAlpha = clamp(a); X.strokeStyle = C.acc; X.lineWidth = 12; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(0, 80); X.lineTo(0, -80); X.moveTo(-50, -30); X.lineTo(0, -80); X.lineTo(50, -30); X.stroke(); X.restore(); }

// accent run along a chain of joined arms
export function chainRun(links, len) {
  if (len <= 0) return; X.save(); X.strokeStyle = C.acc; X.lineWidth = 12; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath();
  let left = len, first = true;
  const curve = (a, c, b, rev) => { const pts = []; for (let i = 0; i <= 16; i++) { const u = rev ? 1 - i / 16 : i / 16; pts.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); } return pts; };
  const pts = []; for (const [R, L] of links) { pts.push(...curve(R.sh, R.mid, R.hand, false), ...curve(L.sh, L.mid, L.hand, true)); }
  for (let i = 0; i < pts.length; i++) { if (first) { X.moveTo(...pts[i]); first = false; continue; } const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (left < d) { const u = left / d; X.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); break; } left -= d; X.lineTo(...pts[i]); }
  X.stroke(); X.restore();
}

export function ground(t) { X.strokeStyle = C.tint; X.lineWidth = 5; X.beginPath(); X.moveTo(M - 30, GROUND); X.lineTo(W - M + 30, GROUND); X.stroke(); }

