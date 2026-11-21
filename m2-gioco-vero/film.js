// M2 — "Il gioco vero." Dark mystery-motivational film: black ground, glowing pictograms, word-by-word captions.
import { X, W, GROUND, WHITE, DIM, GREEN, A, person, pill, ground, line2, coin, phone, check, arrowUp, codeCard, glow, run, clamp, lerp, seg, eo, back, hash, TAU } from './stick.js';

const CAPS = [
  '**GTA 6** è appena *uscito.*',
  'E qualcuno ci sta già **GUADAGNANDO.**',
  'Senza toccare un *joystick.*',
  'Tutti vogliono **GTA.**',
  'Nessuno vuole *pagarlo.*',
  'È qui che entri **TU.**',
  'Ti iscrivi a **BUDDY** con un *codice amico:* **+80 €.**',
  'GTA costa *79,99 €.*',
  'Fai i **CONTI.**',
  'Poi inviti chi vuole GTA *gratis.*',
  '**+50 €.** Per *ogni* amico.',
  'Mentre loro inseguono *missioni…*',
  'tu **COSTRUISCI** *qualcosa.*',
  'Condizioni e info nel **LINK IN BIO.**',
];
const CR = [120, 230, 340, 740, 850, 960];
function gameBox(x, y, s, a) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); X.translate(x, y); X.scale(s, s); X.strokeStyle = WHITE; X.lineWidth = 5; glow(() => { X.beginPath(); X.roundRect(-110, -150, 220, 300, 14); X.stroke(); }, 22);
  X.font = "900 58px 'Montserrat'"; X.fillStyle = WHITE; X.textAlign = 'center'; X.textBaseline = 'middle'; glow(() => X.fillText('GTA 6', 0, -70), 20); X.fillRect(-80, 10, 160, 4); X.restore(); }
function rays(x, y, a, t) { if (a <= 0) return; X.save(); X.globalAlpha = a * .25; X.translate(x, y); X.rotate(t * .2); X.fillStyle = WHITE; for (let i = 0; i < 18; i++) { X.beginPath(); X.moveTo(0, 0); X.arc(0, 0, 700, i / 18 * TAU, (i + .25) / 18 * TAU); X.closePath(); X.fill(); } X.restore(); }
function spot(x, a) { if (a <= 0) return; X.save(); X.globalAlpha = a * .5; const g = X.createLinearGradient(0, 700, 0, GROUND); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.22)'); X.fillStyle = g; X.beginPath(); X.moveTo(x - 30, 700); X.lineTo(x + 30, 700); X.lineTo(x + 200, GROUND + 10); X.lineTo(x - 200, GROUND + 10); X.fill(); X.restore(); }
function scale(t, tilt, aL, aR, a = 1) {   // a balance: left pan +80 €, right pan 79,99 €
  X.save(); X.globalAlpha = a; X.strokeStyle = WHITE; X.fillStyle = WHITE; X.lineWidth = 6;
  glow(() => { X.beginPath(); X.moveTo(540, GROUND); X.lineTo(540, 860); X.stroke(); X.fillRect(460, GROUND - 6, 160, 8); });
  X.translate(540, 860); X.rotate(tilt); glow(() => { X.beginPath(); X.moveTo(-320, 0); X.lineTo(320, 0); X.stroke(); X.beginPath(); X.arc(0, 0, 10, 0, TAU); X.fill(); });
  for (const sd of [-1, 1]) { X.save(); X.translate(sd * 320, 0); X.rotate(-tilt); glow(() => { X.beginPath(); X.moveTo(-80, 120); X.lineTo(0, 0); X.lineTo(80, 120); X.stroke(); X.beginPath(); X.moveTo(-110, 120); X.quadraticCurveTo(0, 190, 110, 120); X.closePath(); X.fill(); }); X.restore(); }
  X.restore();
  const L = [540 - 320 * Math.cos(tilt), 860 - 320 * Math.sin(tilt)], R = [540 + 320 * Math.cos(tilt), 860 + 320 * Math.sin(tilt)];
  pill('+80 €', L[0], L[1] + 90, 34, aL, true, GREEN); pill('79,99 €', R[0], R[1] + 90, 34, aR);
}
const crowd = (t, o = {}) => CR.forEach((x, i) => person(o.xs ? o.xs[i] : x, GROUND, { s: .62, dim: o.dim, ctrl: o.ctrl, t, alpha: o.alpha ?? 1 }));

const S = [
  (lt, t, l) => { ground(); rays(540, 900, A(t, l.t0, .3), t); gameBox(540, 930, 1.1, A(t, l.t0, .2)); const k = eo(A(t, l.t0 + .4, 1.4)); crowd(t, { xs: CR.map((x, i) => lerp(i < 3 ? -100 - i * 60 : 1180 + (i - 3) * 60, x < 540 ? x + 100 : x - 100, k)) }); },   // the hook: the launch, everyone runs to it
  (lt, t, l) => { ground(); gameBox(400, 930, .8, 1); CR.slice(0, 4).forEach((x, i) => person([220, 330, 470, 580][i], GROUND, { s: .62, dim: true, ctrl: true, t })); spot(880, A(t, l.t0 + .2, .3));
      person(880, GROUND, { s: .85, label: '?', t }); for (let i = 0; i < 5; i++) { const u = (t * .4 + i / 5) % 1; coin(840 + hash(i) * 80, GROUND - 260 - u * 300, 16, (1 - u) * A(t, l.t0 + .3, .3)); } },
  (lt, t, l) => { ground(); spot(540, 1); person(540, GROUND, { s: .9, label: '?', t }); X.save(); X.translate(800, 900); X.globalAlpha = A(t, l.t0, .3); X.strokeStyle = WHITE; X.lineWidth = 6; glow(() => { X.beginPath(); X.roundRect(-110, -50, 220, 100, 50); X.stroke(); X.beginPath(); X.arc(-55, 0, 14, 0, TAU); X.moveTo(70, 0); X.arc(55, 0, 14, 0, TAU); X.stroke(); });
      const c = A(t, l.t0 + .7, .25); X.strokeStyle = '#ff5a5f'; X.lineWidth = 12; X.lineCap = 'round'; glow(() => { X.beginPath(); X.moveTo(-140, -90); X.lineTo(-140 + 280 * c, -90 + 180 * c); X.stroke(); }, 14, '#ff5a5f'); X.restore(); },
  (lt, t, l) => { ground(); crowd(t, { ctrl: true }); CR.forEach((x, i) => pill('GTA 6', x, 930 - (i % 2) * 50, 24, A(t, l.t0 + i * .08, .2))); },
  (lt, t, l) => { ground(); CR.forEach((x, i) => { const off = A(t, l.t0 + .6 + i * .05, .2); person(x, GROUND, { s: .62, dim: off >= 1, ctrl: true, t }); pill('79,99 €', x, 930 - (i % 2) * 50, 24, (1 - off) * A(t, l.t0 + i * .06, .2)); }); },
  (lt, t, l) => { ground(); crowd(t, { dim: true, ctrl: true }); spot(540, A(t, l.t0, .3)); person(540, GROUND, { s: lerp(.6, 1, eo(A(t, l.t0, .6))), label: 'TU', t }); },
  (lt, t, l) => { ground(); person(300, GROUND, { s: .9, label: 'TU', t, arms: [.12, -1.2] }); const k = eo(A(t, l.words[l.words.length - 2].t0, .5));
      phone(720, 1010, 1.1, 1, () => { X.font = "900 110px 'Montserrat'"; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = WHITE; glow(() => X.fillText('B', 0, -20), 20); X.font = "900 18px 'Montserrat'"; X.fillText('CODICE AMICO', 0, 110); }, t);
      if (k > 0) pill('+80 €', lerp(720, 300, k), lerp(1010, 860, k), 46, 1, true, GREEN); },
  (lt, t, l) => { ground(); scale(t, 0, A(t, l.t0, .3), A(t, l.t0 + .6, .3)); },
  (lt, t, l) => { ground(); const k = eo(A(t, l.t0 + .3, .6)); scale(t, -.12 * k, 1, 1); pill('GTA 6 = GRATIS', 540, 760, 40, A(t, l.t0 + .7, .3), true, WHITE); },
  (lt, t, l) => { ground(); person(540, GROUND, { s: .9, label: 'TU', t }); CR.forEach((x, i) => { line2(540, GROUND - 200, x, GROUND - 170, A(t, l.t0 + .2 + i * .1, .4), WHITE, 2, 10); person(x, GROUND, { s: .62, dim: true, t }); }); },
  (lt, t, l) => { ground(); person(540, GROUND, { s: .9, label: 'TU', t, arms: t > l.t0 + 1.2 ? [2.6, -2.6] : undefined }); CR.forEach((x, i) => { const tt = l.t0 + .1 + i * .22, on = t > tt; person(x, GROUND, { s: .62, dim: !on, t });
      const u = seg(t, tt, tt + .5); if (u > 0 && u < 1) coin(lerp(x, 540, u), GROUND - 240 - Math.sin(u * Math.PI) * 120, 24); if (t > tt && t < tt + .7) pill('+50 €', x, GROUND - 320, 22, 1, true, GREEN); }); },
  (lt, t, l) => { ground(); CR.slice(0, 3).forEach(x => person(x + 80, GROUND, { s: .62, dim: true, ctrl: true, t })); X.save(); X.translate(780, 930); X.strokeStyle = WHITE; X.lineWidth = 4; glow(() => { X.beginPath(); X.roundRect(-180, -170, 360, 340, 18); X.stroke(); });
      X.font = "900 28px 'Montserrat'"; X.fillStyle = WHITE; X.textAlign = 'center'; X.fillText('MISSIONI', 0, -120); for (let i = 0; i < 4; i++) { X.strokeRect(-130, -80 + i * 60, 34, 34); if (t > l.t0 + .3 + i * .35) { X.fillStyle = DIM; X.fillRect(-124, -74 + i * 60, 22, 22); } X.fillStyle = DIM; X.fillRect(-70, -70 + i * 60, 180, 14); } X.restore(); },
  (lt, t, l) => { ground(); const n = 6; for (let i = 0; i < n; i++) { const a = A(t, l.t0 + i * .18, .2), h = 50 + i * 50, x = 300 + i * 90; if (a <= 0) continue; X.save(); X.globalAlpha = a; glow(() => { X.fillStyle = GREEN; X.fillRect(x, GROUND - h * eo(a), 74, h * eo(a)); }, 20, GREEN); X.restore(); }
      const step = Math.min(n - 1, Math.floor((t - l.t0) / .18)), sx = 300 + Math.max(0, step) * 90 + 37, sy = GROUND - (50 + Math.max(0, step) * 50); person(t > l.t0 ? sx : 220, t > l.t0 ? sy : GROUND, { s: .62, label: 'TU', t }); },
  (lt, t, l) => { codeCard(540, 900, .95, t, l.t0 + .1, A(t, l.t0, .3)); arrowUp(540, 1200, 1, A(t, l.words[l.words.length - 3].t0, .3)); },
];

fetch('timeline.json').then(r => r.json()).then(TL => run({ TL, scenes: S, caps: CAPS, ev: [{ t: 0, type: 'heart' }, { t: TL.lines[6].words[TL.lines[6].words.length - 2].t0, type: 'cash' }, { t: TL.lines[10].t0, type: 'cash' }, { t: TL.lines[12].t0, type: 'cash' }] }));
