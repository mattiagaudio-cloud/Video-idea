// M1 — "Loro giocano. Tu incassi." Dark mystery-motivational film: black ground, glowing pictograms, word-by-word captions.
import { X, W, GROUND, WHITE, DIM, GREEN, A, person, pill, ground, line2, coin, phone, check, arrowUp, codeCard, glow, run, clamp, lerp, seg, eo, back, hash, TAU } from './stick.js';

const CAPS = [
  'Stanotte, tutti i tuoi *amici* giocheranno a **GTA 6.**',
  '**80 €** *spesi.*',
  'Decine di *ore…* **BRUCIATE.**',
  '**TU NO.**',
  'Tu farai una mossa *diversa.*',
  'Apri un conto **BUDDY** con un *codice amico.*',
  '**+80 €** di *bonus.*',
  'GTA… **PAGATO.**',
  'Ma il *vero gioco* inizia **ADESSO.**',
  'Mandi il tuo *codice* a chi vuole **GTA.**',
  'Ogni amico che si *iscrive:* **+50 €.**',
  '**A TE.**',
  'Loro *giocano.*',
  'Tu **INCASSI.**',
  'Condizioni e info nel **LINK IN BIO.**',
];
const FR = [140, 270, 400, 680, 810, 940];
const crowd = (t, o = {}) => FR.forEach((x, i) => person(x, GROUND, { s: .62, ctrl: o.ctrl ?? true, dim: o.dim, t, alpha: o.alpha ?? A(t, (o.t0 ?? -9) + i * .08, .2) }));
const me = (t, o = {}) => person(o.x ?? 540, GROUND, { s: o.s ?? .9, label: 'TU', t, arms: o.arms, jump: o.jump, alpha: o.alpha ?? 1 });
function spot(x, a) { if (a <= 0) return; X.save(); X.globalAlpha = a * .5; const g = X.createLinearGradient(0, 700, 0, GROUND); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.22)'); X.fillStyle = g; X.beginPath(); X.moveTo(x - 30, 700); X.lineTo(x + 30, 700); X.lineTo(x + 200, GROUND + 10); X.lineTo(x - 200, GROUND + 10); X.fill(); X.restore(); }

const S = [
  (lt, t, l) => { ground(); crowd(t, { t0: l.t0 + .1 }); me(t, { alpha: A(t, l.t0 + .6, .3) }); },                                  // 0 the hook: everyone plays
  (lt, t, l) => { ground(); crowd(t); me(t); FR.forEach((x, i) => pill('-79,99 €', x, i % 2 ? 900 : 960, 26, A(t, l.t0 + .2 + i * .1, .2))); },
  (lt, t, l) => { ground(.4); const cols = 12, rows = 9, sz = 58; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, on = A(t, l.t0 + i * .012, .1), burn = seg(t, l.t0 + .9 + i * .006, l.t0 + 1.3 + i * .006);
      if (on <= 0) continue; X.save(); X.globalAlpha = on * (1 - burn * .8); X.fillStyle = burn > .5 ? DIM : WHITE; X.fillRect(190 + c * 60, 680 + r * 60, sz - 8, sz - 8); X.restore(); } },
  (lt, t, l) => { ground(); FR.forEach(x => person(x, GROUND, { s: .62, dim: true, ctrl: true, t })); spot(540, A(t, l.t0, .25)); me(t, { s: 1 }); },
  (lt, t, l) => { ground(.5); FR.slice(0, 3).forEach(x => person(x, GROUND, { s: .62, dim: true, ctrl: true, t })); const k = eo(A(t, l.t0 + .3, 1.2));
      line2(540, GROUND - 4, 980, 760, A(t, l.t0, .8)); me(t, { x: lerp(540, 760, k), s: .9 }); },
  (lt, t, l) => { ground(); me(t, { x: 300, arms: [.12, -1.2] }); phone(700, 940, 1.2, A(t, l.t0 + .1, .3), () => {
      if (t < l.t1 - .4) { X.font = "900 110px 'Montserrat'"; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = WHITE; glow(() => X.fillText('B', 0, -20), 20); }
      else check(0, -10, 1.2, A(t, l.t1 - .4, .3)); X.font = "900 18px 'Montserrat'"; X.fillStyle = WHITE; X.textAlign = 'center'; X.fillText('CODICE AMICO', 0, 110); }, t); },
  (lt, t, l) => { ground(); const k = eo(A(t, l.t0 + .1, .6)); me(t, { x: 300, arms: k >= 1 ? [2.6, -2.6] : [.12, -1.2], jump: k >= 1 ? 12 * Math.abs(Math.sin(t * 8)) : 0 }); phone(700, 940, 1.2, 1 - k, null, t);
      pill('+80 €', lerp(700, 300, k), lerp(940, 860, k), 46, 1, true, GREEN); },
  (lt, t, l) => { ground(); me(t, { x: 300 }); X.save(); X.translate(700, 950); X.strokeStyle = WHITE; X.lineWidth = 4; glow(() => { X.beginPath(); X.roundRect(-150, -200, 300, 400, 16); X.stroke(); }); X.font = "900 64px 'Montserrat'"; X.fillStyle = WHITE; X.textAlign = 'center'; X.textBaseline = 'middle'; glow(() => X.fillText('GTA 6', 0, -110));
      X.font = "600 44px 'Montserrat'"; X.fillStyle = DIM; X.fillText('79,99 €', 0, -30); X.restore(); check(700, 1020, 1.6, A(t, l.words[l.words.length - 1].t0 - .05, .3)); },
  (lt, t, l) => { const z = lerp(1, .8, eo(A(t, l.t0, 1.2))); X.save(); X.translate(540, GROUND); X.scale(z, z); X.translate(-540, -GROUND); ground(1, -200, 1280);
      FR.forEach((x, i) => person(x < 540 ? x - 120 : x + 120, GROUND, { s: .62, dim: true, ctrl: true, t })); me(t); X.restore(); },
  (lt, t, l) => { const z = .8; X.save(); X.translate(540, GROUND); X.scale(z, z); X.translate(-540, -GROUND); ground(1, -200, 1280);
      FR.forEach((x, i) => { const fx = x < 540 ? x - 120 : x + 120; line2(540, GROUND - 180, fx, GROUND - 160, A(t, l.t0 + .2 + i * .12, .4), WHITE, 2, 10); const u = seg(t, l.t0 + .6 + i * .12, l.t0 + 1.4 + i * .12); if (u > 0 && u < 1) coin(lerp(540, fx, u), lerp(GROUND - 180, GROUND - 160, u), 14, 1, WHITE, ''); person(fx, GROUND, { s: .62, dim: true, ctrl: true, t }); }); me(t); X.restore(); },
  (lt, t, l) => { const z = .8; X.save(); X.translate(540, GROUND); X.scale(z, z); X.translate(-540, -GROUND); ground(1, -200, 1280); const n = FR.length;
      FR.forEach((x, i) => { const fx = x < 540 ? x - 120 : x + 120, tt = l.t0 + .3 + i * (l.t1 - l.t0) / n * .8, on = t > tt; person(fx, GROUND, { s: .62, dim: !on, t });
        const u = seg(t, tt, tt + .6); if (u > 0 && u < 1) coin(lerp(fx, 540, u), GROUND - 260 - Math.sin(u * Math.PI) * 120, 26); if (t > tt && t < tt + .5) pill('+50 €', fx, GROUND - 330, 24, 1, true, GREEN); }); me(t); X.restore(); },
  (lt, t, l) => { ground(); FR.forEach(x => person(x < 540 ? x - 60 : x + 60, GROUND, { s: .62, t })); me(t, { arms: [2.6, -2.6] }); for (let i = 0; i < 6; i++) coin(540, 920 - i * 40, 34, A(t, l.t0 + i * .07, .15)); },
  (lt, t, l) => { ground(1, 60, 500); FR.slice(0, 3).forEach((x, i) => person(x, GROUND, { s: .62, dim: true, ctrl: true, t })); X.save(); X.globalAlpha = .4; X.fillStyle = WHITE; X.fillRect(538, 700, 4, 600); X.restore(); },
  (lt, t, l) => { ground(1, 60, 500); FR.slice(0, 3).forEach((x, i) => person(x, GROUND, { s: .62, dim: true, ctrl: true, t })); X.save(); X.globalAlpha = .4; X.fillStyle = WHITE; X.fillRect(538, 700, 4, 600); X.restore();
      ground(1, 580, 1020); person(800, GROUND, { s: .8, label: 'TU', t }); for (let i = 0; i < 7; i++) coin(940, 1220 - i * 40, 32, A(t, l.t0 + i * .06, .15)); },
  (lt, t, l) => { codeCard(540, 900, .95, t, l.t0 + .1, A(t, l.t0, .3)); arrowUp(540, 1200, 1, A(t, l.words[l.words.length - 3].t0, .3)); },
];

fetch('timeline.json').then(r => r.json()).then(TL => run({ TL, scenes: S, caps: CAPS, ev: [{ t: 0, type: 'heart' }, { t: TL.lines[1].t0, type: 'cash' }, { t: TL.lines[6].t0, type: 'cash' }, { t: TL.lines[10].t0 + .3, type: 'cash' }, { t: TL.lines[11].t0, type: 'cash' }, { t: TL.lines[13].t0, type: 'cash' }] }));
