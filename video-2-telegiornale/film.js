// Video 2 — Broadcast News Package, vertical 1080×1920. One fact per screen; the strap holds the headline.
import { clamp, lerp, seg, eo, ei, back, hash, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T } from './beats.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W, X = cv.getContext('2d');
const C = { ink: '#121417', ink2: '#1B1E23', ink3: '#22262C', acc: '#F2CF1D', accL: '#F8DE4A', accD: '#D8B30C', gold: '#D4B064', paper: '#F4F1E8', olive: '#6E5A1E', brk: '#FE6B3D' };
const B8 = "'Barlow Condensed'", MONO = "'Plex Mono'";
const font = (px, fam, w) => (X.font = `${w} ${px}px ${fam}`);
const rr = (x, y, w, h, r) => { X.beginPath(); X.roundRect(x, y, w, h, r); };
const bk = (t, s = 1.4) => back(t, s);
const A = (t, t0, d = .3) => seg(t, t0, t0 + d);

// ———— layout (vertical) ————
const STRAP = { x: 60, y: 1280, w: 840, h: 130 };   // lower third, above TikTok's caption zone
const CONTENT = { y0: 300, y1: 1200 };
const NAME = 'PLAY NEWS';                            // a fictional channel

// ———— programme ————
const PARTS = [
  { a: 0.00, b: 4.45, id: 'breaking' }, { a: 4.45, b: 5.65, id: 'rundown' }, { a: 5.65, b: 8.75, id: 'docs' },
  { a: 8.75, b: 16.05, id: 'board' }, { a: 16.05, b: 23.40, id: 'code' }, { a: 23.40, b: 29.85, id: 'invite' }, { a: 29.85, b: 34.0, id: 'close' },
];
// strap headlines [t, tab, headline]
const STRAPS = [
  [0.45, "ULTIM'ORA", 'GTA 6 È USCITO DA POCHE ORE'], [T.ioGioco, "ULTIM'ORA", 'E LUI CI GIOCA GRATIS'],
  [4.45, 'COME FUNZIONA', 'TRE PASSAGGI, ZERO EURO'], [5.65, 'PASSAGGIO 1', 'CONTO APERTO CON BUDDY'], [7.15, 'PASSAGGIO 2', 'IL CODICE DI UN AMICO'],
  [8.75, 'PASSAGGIO 3', 'ARRIVANO 80 € DI BONUS'], [11.05, 'I CONTI', 'GTA 6 COSTA 79,99 €'], [13.85, 'I CONTI', 'AVANZA PURE UN CENTESIMO'],
  [16.05, 'TOCCA A TE', 'REGISTRATI CON QUESTO CODICE'], [19.8, 'TOCCA A TE', 'RICEVI 80 € DI BONUS'], [21.3, 'TOCCA A TE', 'GTA 6 PRATICAMENTE GRATIS'],
  [23.4, 'NON È FINITA', '+50 € PER OGNI AMICO INVITATO'], [29.85, 'INFO', 'CONDIZIONI E INFO: LINK IN BIO'],
];
const partAt = t => PARTS.find(p => t >= p.a && t < p.b) || PARTS[PARTS.length - 1];

// ———— backgrounds ————
function bg(t) {
  X.fillStyle = C.ink; X.fillRect(0, 0, W, H);
  // light streaks of the package
  X.save(); X.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const x = ((hash(i) * W + t * (40 + i * 12)) % (W + 600)) - 300, g = X.createLinearGradient(x, 0, x + 260, 0);
    g.addColorStop(0, 'rgba(212,176,100,0)'); g.addColorStop(.5, `rgba(212,176,100,${.035 + hash(i + 3) * .03})`); g.addColorStop(1, 'rgba(212,176,100,0)');
    X.fillStyle = g; X.save(); X.translate(x, 0); X.transform(1, 0, -.35, 1, 0, 0); X.fillRect(0, 0, 260, H); X.restore(); }
  X.restore();
  const v = X.createRadialGradient(W / 2, 800, 200, W / 2, 800, 1300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); X.fillStyle = v; X.fillRect(0, 0, W, H);
}

// ———— package parts ————
function plate(x, y, s, sub) {   // brand plate: parallelogram, accent gradient, ink + gold bars at the left
  X.save(); X.translate(x, y); X.scale(s, s);
  const p = () => { X.beginPath(); X.moveTo(-260 + 30, -90); X.lineTo(260 + 30, -90); X.lineTo(260 - 30, 90); X.lineTo(-260 - 30, 90); X.closePath(); };
  const g = X.createLinearGradient(0, -90, 0, 90); g.addColorStop(0, C.accL); g.addColorStop(1, C.accD); p(); X.fillStyle = g; X.fill();
  X.fillStyle = C.ink; X.fillRect(-262, -70, 22, 140); X.fillStyle = C.gold; X.fillRect(-232, -70, 10, 140);
  font(120, B8, 800); X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(NAME, 20, -2);
  if (sub) { font(30, MONO, 500); X.fillStyle = C.ink; X.fillText(sub, 20, 62); }
  X.restore();
}
function sting(t) {      // 0 → 0.9: slashes, plate slam, then it flies to the top-right and becomes the bug
  const fly = eo(seg(t, .55, .9));
  if (t < .2) { X.fillStyle = C.brk; for (const [d, dx] of [[.0, -200], [.06, 120]]) { const k = seg(t, d, d + .12); X.save(); X.translate(W / 2 + dx, 900); X.rotate(-.5); X.fillRect(-30, -900 + 1800 * k - 900, 60, 900); X.restore(); } }
  const slam = t < .16 ? 0 : bk(seg(t, .16, .36), 2);
  const x = lerp(W / 2, 872, fly), y = lerp(900, 150, fly), s = lerp(1.25, .36, fly) * slam;
  if (s > 0) plate(x, y, s, fly < .5 ? "ULTIM'ORA" : null);
  if (t > .16 && t < .5) { const r = seg(t, .16, .5); X.strokeStyle = `rgba(242,207,29,${1 - r})`; X.lineWidth = 10; X.beginPath(); X.ellipse(W / 2, 900, 300 + 500 * r, 120 + 200 * r, 0, 0, TAU); X.stroke(); }
}
function bug(t) { if (t >= .9) { plate(872, 150, .36); const l = Math.floor(t * 2) % 2; if (t < 16) { X.fillStyle = C.brk; rr(40, 125, 150, 50, 6); X.fill(); X.fillStyle = '#fff'; font(34, B8, 800); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('● LIVE', 115, 151); if (l) { X.fillStyle = C.ink; X.beginPath(); X.arc(76, 151, 9, 0, TAU); X.fill(); } } } }
function strap(t) {
  if (t < .45) return;
  let i = -1; for (let k = 0; k < STRAPS.length; k++) if (t >= STRAPS[k][0]) i = k;
  const enter = eo(seg(t, .45, .75)), [t0, tab, txt] = STRAPS[i], prev = STRAPS[i - 1];
  const f = seg(t, t0, t0 + .32), tabFlash = prev && prev[1] !== tab ? Math.max(0, 1 - (t - t0) / .25) : 0;
  X.save(); X.translate(lerp(-1000, 0, enter), 0);
  // tab
  font(36, B8, 800); const tw = X.measureText(tab).width + 44;
  X.fillStyle = tabFlash > 0 ? '#ffffff' : (tab === "ULTIM'ORA" ? C.brk : C.acc); X.fillRect(STRAP.x, STRAP.y - 54, tw, 54);
  X.fillStyle = C.ink; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText(tab, STRAP.x + 22, STRAP.y - 26);
  // paper strap + ink end block
  X.fillStyle = C.paper; X.fillRect(STRAP.x, STRAP.y, STRAP.w, STRAP.h); X.fillStyle = C.ink2; X.fillRect(STRAP.x + STRAP.w, STRAP.y, 120, STRAP.h);
  X.fillStyle = C.acc; X.fillRect(STRAP.x + STRAP.w + 30, STRAP.y + 30, 60, 70);
  font(30, B8, 800); X.fillStyle = C.ink; X.textAlign = 'center'; X.fillText('PN', STRAP.x + STRAP.w + 60, STRAP.y + 66);
  // headline flips: new words up from below, old up and out
  X.save(); X.beginPath(); X.rect(STRAP.x, STRAP.y, STRAP.w, STRAP.h); X.clip(); font(62, B8, 800); X.textAlign = 'left'; X.fillStyle = C.ink;
  const ky = eo(f);
  if (prev && f < 1) X.fillText(prev[2], STRAP.x + 32, STRAP.y + 68 - ky * STRAP.h);
  X.fillText(txt, STRAP.x + 32, STRAP.y + 68 + (1 - ky) * STRAP.h);
  X.restore();
  X.restore();
}
function stamp(x, y, txt, a, col = C.acc, px = 110, rot = -.12) {
  if (a <= 0) return; const k = a < 1 ? lerp(1.9, 1, eo(a)) : 1;
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(k, k); font(px, B8, 800); const w = X.measureText(txt).width + 70, h = px * 1.2;
  X.fillStyle = col; X.fillRect(-w / 2, -h / 2, w, h); X.strokeStyle = C.ink; X.lineWidth = 6; X.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
  X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(txt, 0, 6); X.restore();
  if (a < 1) { X.strokeStyle = `rgba(242,207,29,${1 - a})`; X.lineWidth = 8; X.beginPath(); X.ellipse(x, y, 200 + 300 * a, 80 + 120 * a, 0, 0, TAU); X.stroke(); }
}
function dateline(txt, y, a) { if (a <= 0) return; X.globalAlpha = clamp(a * 2); font(30, MONO, 500); X.fillStyle = C.gold; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText(txt, 60, y); X.globalAlpha = 1; }
function pushText(txt, x, y, px, col, a, align = 'left', w = 800) {   // pushed up from a mask
  if (a <= 0) return; font(px, B8, w); X.save(); X.beginPath(); X.rect(0, y - px * .75, W, px * 1.5); X.clip();
  X.fillStyle = col; X.textAlign = align; X.textBaseline = 'middle'; X.fillText(txt, x, y + (1 - eo(a)) * px * 1.3); X.restore();
}
// split-flap tiles: old and new value on the same board
function flapRow(y, label, from, to, tFlip, a, accent) {
  if (a <= 0) return;
  X.save(); X.globalAlpha = clamp(a * 2); X.translate(0, (1 - bk(a)) * 40);
  font(46, B8, 800); X.fillStyle = C.gold; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText(label, 60, y);
  const n = Math.max(from.length, to.length), tw = 64, gap = 8, x0 = W - 60 - n * (tw + gap);
  for (let i = 0; i < n; i++) {
    const ch0 = from.padStart(n)[i], ch1 = to.padStart(n)[i], ft = tFlip + i * .045, k = clamp((window.__t - ft) / .12);
    const x = x0 + i * (tw + gap), th = 110;
    X.fillStyle = C.ink3; rr(x, y - th / 2, tw, th, 8); X.fill();
    const show = k >= 1 ? ch1 : ch0;
    font(86, B8, 800); X.textAlign = 'center'; X.fillStyle = accent && k >= 1 ? C.acc : C.paper; X.fillText(show, x + tw / 2, y + 4);
    if (k > 0 && k < 1) { X.fillStyle = C.ink2; X.fillRect(x, y - th / 2 + th / 2 * (k < .5 ? 0 : 1) , tw, th / 2 * Math.abs(1 - 2 * k)); }
    X.fillStyle = 'rgba(0,0,0,.55)'; X.fillRect(x, y - 2, tw, 4);
  }
  X.restore();
}
function docCard(x, y, title, rows, a, ticks) {
  if (a <= 0) return; const k = eo(a);
  X.save(); X.translate(lerp(W + 300, x, k), lerp(y + 300, y, k)); X.rotate(lerp(.25, -.03, k));
  X.fillStyle = C.paper; X.fillRect(-300, -220, 600, 440); X.fillStyle = C.ink; X.fillRect(-300, -220, 600, 90);
  font(52, B8, 800); X.fillStyle = C.paper; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText(title, -270, -174);
  rows.forEach((r, i) => { const yy = -60 + i * 110; X.strokeStyle = C.ink; X.lineWidth = 5; X.strokeRect(-260, yy - 30, 60, 60);
    if (window.__t >= ticks[i]) { X.strokeStyle = C.accD; X.lineWidth = 12; X.lineCap = 'round'; X.beginPath(); X.moveTo(-250, yy); X.lineTo(-232, yy + 20); X.lineTo(-205, yy - 26); X.stroke(); }
    font(50, B8, 800); X.fillStyle = C.ink; X.fillText(r, -170, yy + 2); });
  X.restore();
}
function codeSpec(t, x, y, s, a) {
  if (a <= 0) return; X.save(); X.translate(x, y); X.scale(s, s); X.globalAlpha = clamp(a * 2);
  X.fillStyle = C.ink2; X.fillRect(-480, -150, 960, 300); X.fillStyle = C.acc; X.fillRect(-480, -150, 960, 10);
  font(30, MONO, 500); X.fillStyle = C.gold; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO · BUDDY', -440, -95);
  font(92, MONO, 500); X.fillStyle = C.paper; X.textAlign = 'center';
  const cw = 62, x0 = -(CODE.length - 1) * cw / 2;
  for (let i = 0; i < CODE.length; i++) { const lt = t - (17.5 + i * .09); if (lt < 0) continue; X.save(); X.beginPath(); X.rect(x0 + i * cw - 32, -20, 64, 120); X.clip(); X.fillText(CODE[i], x0 + i * cw, 45 + (1 - eo(clamp(lt / .14))) * 90); X.restore(); }
  X.restore();
}
function bandWipe(t, t0) {   // vertical band wipe between programme parts
  const k = seg(t, t0 - .15, t0 + .15); if (k <= 0 || k >= 1) return; const x = lerp(-200, W + 200, k);
  X.fillStyle = C.acc; X.fillRect(x - 42, 0, 84, H); X.fillStyle = C.ink; X.fillRect(x + 42, 0, 5, H); X.fillStyle = C.gold; X.fillRect(x + 47, 0, 14, H);
}

// ———— parts ————
function partBreaking(t) {
  const a = A(t, .5, .35);
  dateline('OGGI · DA POCHE ORE · IN TUTTO IL MONDO', 320, A(t, .7));
  if (a > 0) { X.save(); X.globalAlpha = clamp(a * 2); X.fillStyle = C.ink2; X.fillRect(60, 380, 960, 640); X.fillStyle = C.acc; X.fillRect(60, 380, 960, 10); X.restore();
    pushText('GTA 6', W / 2, 640, 330, C.paper, a, 'center');
    pushText('È USCITO', W / 2, 880, 130, C.acc, A(t, T.uscito, .3), 'center'); }
  stamp(W / 2, 1090, 'GRATIS', A(t, T.gratis, .16), C.brk, 150, -.08);
}
function partRundown(t) {
  font(140, B8, 800); X.fillStyle = C.paper; X.textAlign = 'left'; X.textBaseline = 'middle';
  const da = A(t, 4.45, .25); X.globalAlpha = da; X.fillText('COME', 60, 400); X.fillStyle = C.gold; font(40, MONO, 500); X.fillText('IN 3 PASSAGGI', 64, 490); X.globalAlpha = 1;
  ['APRI IL CONTO', 'METTI IL CODICE', 'INCASSA IL BONUS'].forEach((r, i) => rundownRow(t, i, r, 4.6 + i * .14, false));
}
function rundownRow(t, i, txt, t0, done, y0 = 640) {
  const a = A(t, t0, .25); if (a <= 0) return; const y = y0 + i * 170;
  X.save(); X.translate(0, y); X.scale(1, bk(a)); X.fillStyle = C.ink2; X.fillRect(60, -70, 960, 140); X.fillStyle = C.acc; X.fillRect(60, -70, 140, 140);
  font(96, B8, 800); X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(String(i + 1), 130, 4);
  font(72, B8, 800); X.fillStyle = C.paper; X.textAlign = 'left'; X.fillText(txt, 240, 4);
  if (done) { const k = A(t, done, .15); if (k > 0) { X.strokeStyle = C.acc; X.lineWidth = 16; X.lineCap = 'round'; X.beginPath(); X.moveTo(900, 0); X.lineTo(930, 30 * k); X.lineTo(930 + 50 * k, -40 * k); X.stroke(); } }
  X.restore();
}
function partDocs(t) {
  dateline('PASSAGGIO 1 E 2', 320, A(t, 5.65));
  docCard(W / 2 - 30, 620, 'CONTO BUDDY', ['Dati inseriti', 'Conto aperto'], A(t, 5.7, .45), [6.0, T.buddy]);
  docCard(W / 2 + 30, 980, 'CODICE AMICO', ['Codice inserito', 'Codice valido'], A(t, T.codice, .45), [7.75, T.amico]);
}
function partBoard(t) {
  dateline('PASSAGGIO 3 · I CONTI', 320, A(t, 8.75));
  flapRow(520, 'BONUS', '  0,00', '+80,00', T.ottanta, A(t, 8.8), true);
  flapRow(720, 'GTA 6', '  0,00', '-79,99', T.prezzo, A(t, 11.05), false);
  const s = A(t, 13.85); if (s > 0) { X.fillStyle = C.gold; X.fillRect(60, 830, 960 * eo(s), 4); }
  flapRow(960, 'AVANZO', '  0,00', '  0,01', T.avanza, A(t, 13.9), true);
  stamp(W / 2, 1150, 'UN CENTESIMO', A(t, T.centesimo, .16), C.acc, 90, -.06);
}
function partCode(t) {
  dateline('TOCCA A TE', 320, A(t, 16.1));
  pushText('REGISTRATI CON', 60, 440, 110, C.paper, A(t, T.registrati - .2, .3));
  const dock = eo(seg(t, 19.7, 20.05));
  codeSpec(t, W / 2, lerp(720, 640, dock), lerp(1, .8, dock), A(t, 17.3, .3));
  if (t > 19.8) {
    flapRow(930, 'TU RICEVI', '  0,00', '+80,00', T.ottanta2, A(t, 19.85), true);
    pushText('GTA 6', 60, 1110, 110, C.paper, A(t, T.eGta, .3));
    const sl = A(t, T.praticamente, .2); if (sl > 0) { font(90, B8, 800); X.fillStyle = C.gold; X.textAlign = 'right'; X.fillText('79,99 €', 1020, 1112); X.fillStyle = C.brk; X.fillRect(1020 - 280, 1110, 280 * eo(sl), 10); }
    stamp(520, 1110, 'GRATIS', A(t, T.gratis2, .16), C.acc, 100, -.1);
  }
}
function persistentCode(t) {   // after its card, the code stays above the strap
  if (t < 23.4) return; const a = A(t, 23.4, .3);
  X.save(); X.globalAlpha = clamp(a * 2); X.fillStyle = C.ink2; X.fillRect(60, 1110, 960, 100); X.fillStyle = C.acc; X.fillRect(60, 1110, 12, 100);
  font(28, MONO, 500); X.fillStyle = C.gold; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('CODICE', 100, 1160);
  font(64, MONO, 500); X.fillStyle = C.paper; X.fillText(CODE, 250, 1162); X.restore();
}
function partInvite(t) {
  dateline('NON È FINITA', 320, A(t, 23.45));
  pushText('PER OGNI AMICO', 60, 440, 110, C.paper, A(t, T.ogniAmico - .1, .3));
  pushText('+50 €', 60, 590, 170, C.acc, A(t, T.altri50, .3));
  // bars, one per friend, values rolling, on one scale
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], base = 1030, maxH = 300;
  hits.forEach((h, i) => { const k = A(t, h, .3); if (k <= 0) return; const x = 120 + i * 230, hh = maxH * eo(k) * ((i + 1) / 4);
    X.fillStyle = C.acc; X.fillRect(x, base - hh, 150, hh);
    font(48, B8, 800); X.fillStyle = C.paper; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.fillText(`${(i + 1) * 50} €`, x + 75, base - hh - 16);
    font(26, MONO, 500); X.fillStyle = C.gold; X.fillText(`AMICO ${i + 1}`, x + 75, base + 40); });
  X.fillStyle = C.gold; X.fillRect(80, base, 920, 3);
}
function partClose(t) {
  dateline('IN CHIUSURA', 320, A(t, 29.9));
  ['APRI IL CONTO', 'METTI IL CODICE', 'INCASSA IL BONUS'].forEach((r, i) => rundownRow(t, i, r, 29.95 + i * .1, 30.4 + i * .15, 500));
  const a = A(t, T.linkBio - .05, .3); if (a > 0) {
    X.save(); X.translate(0, (1 - bk(a)) * 60); X.globalAlpha = clamp(a * 2);
    X.restore();
    stamp(W / 2, 980, 'LINK IN BIO ↑', a, C.acc, 110, -.04);
  }
}

function render(t) {
  window.__t = t; X.setTransform(SC, 0, 0, SC, 0, 0); bg(t);
  const p = partAt(t);
  ({ breaking: partBreaking, rundown: partRundown, docs: partDocs, board: partBoard, code: partCode, invite: partInvite, close: partClose })[p.id](t);
  if (p.id === 'invite' || p.id === 'close') persistentCode(t);
  for (const q of PARTS.slice(1)) bandWipe(t, q.a);
  sting(t); bug(t); strap(t);
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'slash'); ev(.16, 'sting'); ev(.55, 'slash');
for (const [k] of STRAPS) if (k > .5) ev(k, 'flip');
for (const q of PARTS.slice(1)) ev(q.a - .1, 'wipe');
ev(T.uscito, 'timp'); ev(T.gratis, 'stamp');
for (let i = 0; i < 3; i++) ev(4.6 + i * .14, 'tick');
ev(6.0, 'tick'); ev(T.buddy, 'tick'); ev(7.75, 'tick'); ev(T.amico, 'tick');
ev(T.ottanta, 'flap'); ev(T.prezzo, 'flap'); ev(T.avanza, 'flap'); ev(T.centesimo, 'stamp');
for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .09, 'key');
ev(T.ottanta2, 'flap'); ev(T.praticamente, 'tick'); ev(T.gratis2, 'stamp');
for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) ev(h, 'coin');
for (let i = 0; i < 3; i++) ev(30.4 + i * .15, 'tick'); ev(T.linkBio, 'stamp');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { let i = -1; for (let k = 0; k < STRAPS.length; k++) if (t >= STRAPS[k][0]) i = k; return i < 0 ? [] : [{ id: 'strap' + i, text: STRAPS[i][2], x0: 60, y0: 1280, x1: 900, y1: 1410 }]; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all(["800 40px 'Barlow Condensed'", "600 40px 'Barlow Condensed'", "500 40px 'Plex Mono'"].map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
