// Marco vs Luca — dark pictogram version: black ground, glowing pictograms, word-by-word captions.
import { X, W, GROUND, WHITE, DIM, GREEN, A, person, pill, ground, line2, coin, phone, check, arrowUp, codeCard, glow, run, clamp, lerp, seg, eo, back, hash, TAU } from './stick.js';

const CAPS = [
  'Due *amici.* Stesso **GIOCO.**',
  'Uno ha *pagato.* L’altro… ci ha **GUADAGNATO.**',
  'Lui è **MARCO.**',
  'Marco ha speso **80 €** per GTA 6. *Come tutti.*',
  'Lui invece è **LUCA.**',
  'Luca, GTA 6, l’ha preso **GRATIS…**',
  'e ci ha pure guadagnato **150 €.**',
  '**COME?**',
  '**BUDDY** + *codice amico* = **+80 €**',
  'GTA costa *79,99 €.* Gli avanza **1 CENTESIMO.**',
  'Poi invita *3 amici.* **+50 €** ciascuno.',
  '**150 €.** *In tasca.*',
  'Marco ha *pagato.* Luca ha **INCASSATO.**',
  'Tu chi vuoi **ESSERE?**',
  'Condizioni e info nel **LINK IN BIO.**',
];
const MX = 290, LX = 790;
const wt = (l, re) => (l.words.find(w => re.test(w.w)) || l.words[0]).t0;
function box(x, y, s, a) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); X.translate(x, y); X.scale(s, s); X.strokeStyle = WHITE; X.lineWidth = 5; glow(() => { X.beginPath(); X.roundRect(-90, -120, 180, 240, 12); X.stroke(); }, 20);
  X.font = "900 46px 'Montserrat'"; X.fillStyle = WHITE; X.textAlign = 'center'; X.textBaseline = 'middle'; glow(() => X.fillText('GTA 6', 0, -55), 16); X.fillRect(-60, 10, 120, 4); X.restore(); }
function spot(x, a) { if (a <= 0) return; X.save(); X.globalAlpha = a * .5; const g = X.createLinearGradient(0, 700, 0, GROUND); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.22)'); X.fillStyle = g; X.beginPath(); X.moveTo(x - 30, 700); X.lineTo(x + 30, 700); X.lineTo(x + 210, GROUND + 10); X.lineTo(x - 210, GROUND + 10); X.fill(); X.restore(); }
const marco = (t, o = {}) => person(o.x ?? MX, GROUND, { s: o.s ?? .85, label: 'MARCO', dim: o.dim, t, arms: o.arms, alpha: o.alpha ?? 1 });
const luca = (t, o = {}) => person(o.x ?? LX, GROUND, { s: o.s ?? .85, label: 'LUCA', dim: o.dim, t, arms: o.arms, jump: o.jump, alpha: o.alpha ?? 1 });
function stack(x, n, t, t0, col = GREEN) { for (let i = 0; i < n; i++) coin(x, GROUND - 30 - i * 34, 30, A(t, t0 + i * .06, .15), col); }

const S = [
  (lt, t, l) => { ground(); marco(t, { alpha: A(t, l.t0, .3) }); luca(t, { alpha: A(t, l.t0 + .4, .3) }); box(540, 920, 1, A(t, wt(l, /gioco/i) - .1, .3)); },
  (lt, t, l) => { ground(); marco(t); luca(t); box(540, 920, .8, 1); pill('-80 €', MX, 870, 34, A(t, wt(l, /pagato/i), .25)); pill('+150 €', LX, 870, 38, A(t, wt(l, /guadagn/i), .25), true, GREEN); },
  (lt, t, l) => { ground(); spot(MX, A(t, l.t0, .3)); marco(t, { s: lerp(.85, 1, eo(A(t, l.t0, .5))) }); luca(t, { dim: true }); },
  (lt, t, l) => { ground(); spot(MX, 1); marco(t, { s: 1 }); luca(t, { dim: true }); box(540, 900, .7, 1);
      const u = seg(t, wt(l, /ottanta/i), wt(l, /ottanta/i) + .7); if (u > 0 && u < 1) for (let i = 0; i < 4; i++) coin(lerp(MX, 540, clamp(u * 1.3 - i * .1)), 900 - Math.sin(clamp(u * 1.3 - i * .1) * Math.PI) * 120, 18, 1, WHITE, '');
      if (t > wt(l, /ottanta/i) + .3) pill('-80 €', MX, 820, 36, 1);
      if (t > wt(l, /tutti/i) - .1) for (let i = 0; i < 6; i++) { const x = 80 + i * 190; if (Math.abs(x - MX) < 120 || Math.abs(x - LX) < 120) continue; person(x, GROUND, { s: .5, dim: true, t, alpha: A(t, wt(l, /tutti/i) - .1 + i * .05, .2) }); pill('-80 €', x, 1050, 20, A(t, wt(l, /tutti/i) + i * .05, .2), false, DIM); } },
  (lt, t, l) => { ground(); spot(LX, A(t, l.t0, .3)); marco(t, { dim: true }); luca(t, { s: lerp(.85, 1, eo(A(t, l.t0, .5))) }); },
  (lt, t, l) => { ground(); spot(LX, 1); marco(t, { dim: true }); const k = eo(A(t, wt(l, /gratis/i) - .3, .6)); box(lerp(540, LX - 170, k), lerp(900, 1000, k), .7, 1); luca(t, { s: 1, arms: k >= 1 ? [.12, -1.3] : undefined }); pill('GRATIS', LX, 760, 40, A(t, wt(l, /gratis/i), .25), true, GREEN); },
  (lt, t, l) => { ground(); spot(LX, 1); marco(t, { dim: true }); luca(t, { s: 1, arms: [2.6, -2.6], jump: 14 * Math.abs(Math.sin(t * 7)) * A(t, wt(l, /centocinq/i), .2) }); stack(LX + 170, 8, t, wt(l, /guadagn/i)); pill('+150 €', LX, 760, 46, A(t, wt(l, /centocinq/i), .25), true, GREEN); },
  (lt, t, l) => { ground(.5); luca(t, { x: 540, s: 1.1 }); X.save(); X.font = "900 300px 'Montserrat'"; X.textAlign = 'center'; X.textBaseline = 'middle'; X.globalAlpha = .15 * A(t, l.t0, .2); X.fillStyle = WHITE; X.fillText('?', 540, 900); X.restore(); },
  (lt, t, l) => { ground(); luca(t, { x: 300, arms: [.12, -1.2] }); const tb = wt(l, /benvenuto/i), to = wt(l, /ottanta/i); phone(740, 990, 1.1, 1, () => {
      X.font = "900 110px 'Montserrat'"; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = WHITE; glow(() => X.fillText('B', 0, -20), 20); X.font = "900 18px 'Montserrat'"; X.fillText('CODICE AMICO', 0, 110); }, t);
      const k = eo(A(t, to - .1, .5)); if (k > 0) pill('+80 €', lerp(740, 300, k), lerp(990, 850, k), 46, 1, true, GREEN); },
  (lt, t, l) => { ground(); luca(t, { x: 300 }); X.save(); X.translate(720, 0); const r = (txt, y, a, col = WHITE, px = 64) => { if (a <= 0) return; X.save(); X.globalAlpha = a; X.font = `900 ${px}px 'Montserrat'`; X.textAlign = 'right'; X.textBaseline = 'middle'; X.fillStyle = col; glow(() => X.fillText(txt, 260, y), 16, col); X.restore(); };
      r('+80,00 €', 760, A(t, l.t0, .25), GREEN); r('−79,99 €', 860, A(t, wt(l, /settanta/i), .25)); if (t > wt(l, /avanzato/i) - .2) { X.fillStyle = WHITE; X.fillRect(-120, 920, 380 * eo(A(t, wt(l, /avanzato/i) - .2, .3)), 4); } r('0,01 €', 1000, A(t, wt(l, /centesimo/i) - .1, .25), GREEN, 84); X.restore();
      coin(420, GROUND - 22, 18, A(t, wt(l, /centesimo/i), .25)); },
  (lt, t, l) => { ground(); luca(t, { x: 540 }); const xs = [200, 360, 880]; const tt = [wt(l, /invitato/i), wt(l, /tre/i) + .1, wt(l, /amici/i)];
      xs.forEach((x, i) => { line2(540, GROUND - 200, x, GROUND - 170, A(t, tt[i] - .2, .3), WHITE, 2, 10); person(x, GROUND, { s: .62, t, alpha: A(t, tt[i], .2) }); const c = wt(l, /cinquanta/i) + i * .25; const u = seg(t, c, c + .5); if (u > 0 && u < 1) coin(lerp(x, 540, u), GROUND - 260 - Math.sin(u * Math.PI) * 110, 24); pill('+50 €', x, GROUND - 330, 26, A(t, c, .2), true, GREEN); }); },
  (lt, t, l) => { ground(); luca(t, { x: 440, s: 1, arms: [2.6, -2.6] }); stack(700, 10, t, l.t0); pill('+150 €', 560, 760, 60, A(t, l.t0, .25), true, GREEN); },
  (lt, t, l) => { ground(); const ip = wt(l, /incassato/i) - .1; marco(t, { dim: true }); luca(t, { s: lerp(.85, 1, A(t, ip, .3)), arms: t > ip ? [2.6, -2.6] : undefined }); X.save(); X.globalAlpha = .4; X.fillStyle = WHITE; X.fillRect(538, 720, 4, 560); X.restore();
      pill('-80 €', MX, 860, 38, A(t, l.t0, .25), false, DIM); pill('+150 €', LX, 860, 44, A(t, ip, .25), true, GREEN); },
  (lt, t, l) => { ground(); marco(t, { dim: true, s: .7, x: 200 }); luca(t, { s: .7, x: 880 }); spot(540, A(t, l.t0, .3)); person(540, GROUND, { s: 1, label: 'TU', t, alpha: A(t, l.t0 + .1, .3) }); },
  (lt, t, l) => { codeCard(540, 900, .95, t, l.t0 + .1, A(t, l.t0, .3)); arrowUp(540, 1200, 1, A(t, l.words[l.words.length - 3].t0, .3)); },
];

fetch('timeline.json').then(r => r.json()).then(TL => run({ TL, scenes: S, caps: CAPS, ev: [{ t: 0, type: 'heart' }, { t: TL.lines[6].t0 + .5, type: 'cash' }, { t: TL.lines[8].t0 + 2, type: 'cash' }, { t: TL.lines[10].t0 + 2, type: 'cash' }, { t: TL.lines[11].t0, type: 'cash' }] }));
