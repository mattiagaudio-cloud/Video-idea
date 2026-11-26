// Shared engine for the dark "mystery-motivational" films: black ground, glowing white pictograms, word-by-word captions.
// Caption markup: **WORD** = huge heavy caps, *word* = italic serif, plain = semibold sans. One caption per voice line.
import { clamp, lerp, seg, eo, ei, back, hash, TAU } from '/core/lib.js';
export { clamp, lerp, seg, eo, ei, back, hash, TAU };

export const W = 1080, H = 1920, GROUND = 1260;
export const CODE = 'B2601M2FCQ7OBC';
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W;
export const X = cv.getContext('2d');
export const WHITE = '#f4f4f6', DIM = '#5a5a62', GREEN = '#7dffa6';
export const A = (t, t0, d = .3) => seg(t, t0, t0 + d);

// ———— glow helpers ————
export function glow(fn, blur = 22, col = 'rgba(255,255,255,.75)') { X.save(); X.shadowColor = col; X.shadowBlur = blur; fn(); X.restore(); }

// ———— pictograms ————
// a person: filled white (or dim), feet at (x, y); o: s, dim, label, ctrl (holds a controller with a glowing screen), arms, jump, lit (0..1)
export function person(x, y, o = {}) {
  const s = o.s || 1, a = o.alpha ?? 1; if (a <= 0) return;
  X.save(); X.globalAlpha = a; X.translate(x, y - (o.jump || 0)); X.scale(s, s);
  const col = o.dim ? DIM : WHITE;
  const draw = () => {
    X.fillStyle = col;
    X.beginPath(); X.arc(0, -232, 30, 0, TAU); X.fill();                                         // head
    X.beginPath(); X.moveTo(-42, -192); X.lineTo(42, -192); X.quadraticCurveTo(52, -192, 52, -180); X.lineTo(46, -96); X.lineTo(-46, -96); X.lineTo(-52, -180); X.quadraticCurveTo(-52, -192, -42, -192); X.fill();   // torso
    X.fillRect(-36, -100, 30, 100); X.fillRect(6, -100, 30, 100);                                  // legs
    const arm = (side, ang) => { X.save(); X.translate(side * 50, -184); X.rotate(ang); X.beginPath(); X.roundRect(-12, 0, 24, 92, 12); X.fill(); X.restore(); };
    const [al, ar] = o.arms || [.12, -.12]; arm(-1, al); arm(1, ar);
  };
  if (o.dim) draw(); else glow(draw, 26 * (o.lit ?? 1));
  if (o.ctrl) { X.fillStyle = col; X.beginPath(); X.roundRect(-34, -150, 68, 26, 12); X.fill();
    const f = .6 + .4 * Math.sin((o.t || 0) * 9 + x); X.save(); X.globalCompositeOperation = 'lighter'; X.fillStyle = `rgba(120,170,255,${.22 * f})`; X.beginPath(); X.arc(0, -200, 120, 0, TAU); X.fill(); X.restore(); }
  X.restore();
  if (o.label) pill(o.label, x, y + 40 * s + 10, 26 * Math.max(.8, s), a);
}
// a rounded label, white outline + text
export function pill(txt, x, y, px = 28, a = 1, fill = false, col = WHITE) {
  if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); X.font = `900 ${px}px 'Montserrat'`; X.textAlign = 'center'; X.textBaseline = 'middle';
  const w = X.measureText(txt).width + px * 1.4, h = px * 1.6; X.beginPath(); X.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
  if (fill) { glow(() => { X.fillStyle = col; X.fill(); }, 20, col); X.fillStyle = '#000'; } else { X.lineWidth = 3; X.strokeStyle = col; glow(() => X.stroke(), 12, col); X.fillStyle = col; }
  X.fillText(txt, x, y + 1); X.restore();
}
export function ground(a = 1, x0 = 60, x1 = 1020) { X.save(); X.globalAlpha = a; glow(() => { X.fillStyle = WHITE; X.fillRect(x0, GROUND, x1 - x0, 3); }, 12); X.restore(); }
export function line2(x0, y0, x1, y1, k, col = WHITE, w = 3, dash = 0) { if (k <= 0) return; X.save(); if (dash) X.setLineDash([dash, dash]); X.strokeStyle = col; X.lineWidth = w; glow(() => { X.beginPath(); X.moveTo(x0, y0); X.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); X.stroke(); }, 10, col); X.restore(); }
export function coin(x, y, r, a = 1, col = GREEN, label = '€') { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); glow(() => { X.fillStyle = col; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); }, 18, col); X.fillStyle = '#000'; X.font = `900 ${r}px 'Montserrat'`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, x, y + 2); X.restore(); }
export function phone(x, y, s, a, screen, t) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); X.translate(x, y); X.scale(s, s);
  X.lineWidth = 5; X.strokeStyle = WHITE; glow(() => { X.beginPath(); X.roundRect(-90, -170, 180, 340, 28); X.stroke(); }, 16); X.fillStyle = WHITE; X.fillRect(-24, -156, 48, 6);
  screen && screen(); X.restore(); }
export function check(x, y, s, a, col = GREEN) { if (a <= 0) return; X.save(); X.strokeStyle = col; X.lineWidth = 12 * s; X.lineCap = 'round'; X.lineJoin = 'round'; glow(() => { X.beginPath(); X.moveTo(x - 40 * s, y); X.lineTo(lerp(x - 40 * s, x - 10 * s, clamp(a * 2)), lerp(y, y + 30 * s, clamp(a * 2))); if (a > .5) X.lineTo(lerp(x - 10 * s, x + 46 * s, clamp(a * 2 - 1)), lerp(y + 30 * s, y - 40 * s, clamp(a * 2 - 1))); X.stroke(); }, 16, col); X.restore(); }
export function arrowUp(x, y, s, a) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); X.strokeStyle = WHITE; X.lineWidth = 10 * s; X.lineCap = 'round'; X.lineJoin = 'round'; glow(() => { X.beginPath(); X.moveTo(x, y + 80 * s); X.lineTo(x, y - 80 * s); X.moveTo(x - 50 * s, y - 30 * s); X.lineTo(x, y - 80 * s); X.lineTo(x + 50 * s, y - 30 * s); X.stroke(); }); X.restore(); }
export function codeCard(x, y, s, t, t0, a = 1) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); X.translate(x, y); X.scale(s, s);
  X.lineWidth = 4; X.strokeStyle = WHITE; glow(() => { X.beginPath(); X.roundRect(-480, -110, 960, 220, 30); X.stroke(); }, 18);
  X.font = "900 30px 'Montserrat'"; X.fillStyle = DIM; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', 0, -62);
  X.font = "700 84px 'JB Mono'"; X.fillStyle = WHITE; const cw = 61, x0 = -(CODE.length - 1) * cw / 2;
  for (let i = 0; i < CODE.length; i++) { const k = A(t, t0 + i * .07, .12); if (k <= 0) continue; X.globalAlpha = clamp(a) * k; glow(() => X.fillText(CODE[i], x0 + i * cw, 30), 14); }
  X.restore(); }

// ———— captions: word by word, three voices of type ————
function parse(markup) { const out = []; for (const m of markup.matchAll(/\*\*(.+?)\*\*|\*(.+?)\*|(\S+)/g)) { if (m[1]) m[1].split(' ').forEach(w => out.push({ w, k: 'big' })); else if (m[2]) m[2].split(' ').forEach(w => out.push({ w, k: 'it' })); else out.push({ w: m[3], k: 'n' }); } return out; }
const FONT = { big: "900 128px 'Montserrat'", it: "italic 500 76px 'Playfair Display'", n: "600 64px 'Montserrat'" };
const LH = { big: 140, it: 92, n: 82 };
export function caption(t, line, markup, y0 = 330, until = 1e9) {
  if (!markup || t < line.t0 - .1 || t > until) return;
  const toks = parse(markup), words = line.words, n = toks.length;
  // layout: greedy rows, centred; a big word sits on its own row unless short
  const rows = []; let row = [], rw = 0;
  for (const tk of toks) { tk.f = FONT[tk.k]; X.font = tk.f; let w = X.measureText(tk.w + ' ').width; if (tk.k === 'big' && w > 940) { tk.f = `900 ${Math.floor(128 * 940 / w)}px 'Montserrat'`; X.font = tk.f; w = X.measureText(tk.w + ' ').width; } if ((rw + w > 900 && row.length) || (tk.k === 'big' && row.length && rw + w > 700)) { rows.push(row); row = []; rw = 0; } tk.wd = w; row.push(tk); rw += w; }
  rows.push(row);
  let y = y0, idx = 0;
  for (const r of rows) {
    const h = Math.max(...r.map(tk => LH[tk.k])); const tot = r.reduce((s, tk) => s + tk.wd, 0); let x = W / 2 - tot / 2;
    for (const tk of r) { const wi = Math.min(words.length - 1, Math.floor(idx / n * words.length)), ts = words[wi].t0 - .04, a = A(t, ts, .18);
      if (a > 0) { X.save(); X.font = tk.f; X.textAlign = 'left'; X.textBaseline = 'middle'; X.globalAlpha = a; X.fillStyle = WHITE;
        const yy = y + h / 2 + (1 - eo(a)) * 18; glow(() => X.fillText(tk.w, x, yy), tk.k === 'big' ? 34 : 18); X.restore(); }
      x += tk.wd; idx++; }
    y += h;
  }
}

// ———— runner ————
export function run({ TL, scenes, caps, ev = [], extra }) {
  const L = TL.lines, DUR = TL.dur;
  const grain = (() => { const c = document.createElement('canvas'); c.width = 360; c.height = 640; const g = c.getContext('2d'); for (let i = 0; i < 7000; i++) { g.fillStyle = `rgba(255,255,255,${hash(i) * .05})`; g.fillRect(hash(i + 1) * 360, hash(i + 2) * 640, 1, 1); } return c; })();
  function render(t) {
    X.setTransform(SC, 0, 0, SC, 0, 0); X.globalAlpha = 1; X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
    let i = 0; for (let k = 0; k < L.length; k++) if (t >= L[k].t0 - .15) i = k;
    const next = L[i + 1] ? L[i + 1].t0 - .15 : DUR;
    const camZ = 1 + .03 * seg(t, L[i].t0 - .15, next);                                       // a slow push on every line
    X.save(); X.translate(W / 2, 1000); X.scale(camZ, camZ); X.translate(-W / 2, -1000);
    const fadeOut = 1 - seg(t, next - .12, next);
    X.globalAlpha = 1; (scenes[i] || (() => {}))(t - L[i].t0, t, L[i], fadeOut);
    X.restore(); X.globalAlpha = 1;
    caption(t, L[i], caps[i], 300, next);
    extra && extra(t, i);
    X.globalAlpha = 1; X.drawImage(grain, (hash(Math.floor(t * 30)) * 30) | 0, 0, W, H);
    const v = X.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); X.fillStyle = v; X.fillRect(0, 0, W, H);
  }
  // events: a whoosh on every line, a hit on every big word
  const EV = [...ev]; L.forEach((l, k) => { if (k) EV.push({ t: l.t0 - .15, type: 'whoosh' }); const toks = parse(caps[k] || ''); toks.forEach((tk, j) => { if (tk.k === 'big') { const wi = Math.min(l.words.length - 1, Math.floor(j / toks.length * l.words.length)); EV.push({ t: l.words[wi].t0 - .04, type: 'hit' }); } }); });
  EV.push({ t: 0, type: 'drone' }); EV.sort((a, b) => a.t - b.t);
  const TEXTS = t => { let i = 0; for (let k = 0; k < L.length; k++) if (t >= L[k].t0) i = k; return [{ id: 'cap' + i, text: L[i].text, x0: 90, y0: 300, x1: 990, y1: 700, pass: true }]; };
  Object.assign(window, { DUR, render, EV, TEXTS });
  Promise.all(["900 40px 'Montserrat'", "600 40px 'Montserrat'", "italic 500 40px 'Playfair Display'", "700 40px 'JB Mono'"].map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
}
