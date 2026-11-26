// Marco vs Luca — cartoon: boiling outlines, flat colour, big-eyed characters who react to the narration. Text only for names and numbers.
import { X, W, H, C, ST, ell, rrect, path, shape, tube, hero, friend, FRIENDS, room, tvSet, couch, phone, coin, priceTag, checkMark, font, A, clamp, lerp, seg, eo, ei, back, hash, TAU } from './toon.js';
const CODE = 'B2601M2FCQ7OBC';
const SC = (innerWidth || 1080) / W;
Object.assign(C, { wall: '#e9b872', wall2: '#dfa95e', floor: '#7a4e36' });       // a warm living room at night, lamp light
const MAR = { hood: '#2bb5a8', hood2: '#1d8a80' }, LUC = { hood: '#ffcf3a', hood2: '#d9a514', hair: '#6a3c1e', hair2: '#4a2810' };
const MX = 280, LX = 800, FY = 1530;
const wt = (l, re) => (l.words.find(w => re.test(w.w)) || l.words[0]).t0;

function bubble(txt, x, y, a, fill = '#ffffff', col = C.line, px = 84) { if (a <= 0) return; const k = back(clamp(a), 2.4); X.save(); X.translate(x, y); X.scale(k, k); font(px, "'Lilita One'"); const w = X.measureText(txt).width + px * .9;
  shape(rrect(-w / 2, -px * .75, w, px * 1.5, px * .5), fill, null); X.fillStyle = col; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(txt, 0, 4); X.restore(); }
function name(txt, x, y, a) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); font(56, "'Lilita One'"); X.textAlign = 'center'; X.lineWidth = 12; X.strokeStyle = C.line; X.lineJoin = 'round'; X.strokeText(txt, x, y); X.fillStyle = '#fff'; X.fillText(txt, x, y); X.restore(); }
const marco = (t, o = {}) => hero({ x: o.x ?? MX, y: FY, s: o.s ?? .74, stand: true, t, pal: MAR, lid: o.lid ?? .35, smile: o.smile ?? 0, brow: o.brow ?? 0, look: o.look ?? 0, armL: o.armL, armR: o.armR, mouth: o.mouth ?? 0, bob: o.bob });
const luca = (t, o = {}) => hero({ x: o.x ?? LX, y: FY - (o.jump || 0), s: o.s ?? .74, stand: true, t, pal: LUC, lid: o.lid ?? .1, smile: o.smile ?? .7, brow: o.brow ?? .3, look: o.look ?? 0, armL: o.armL, armR: o.armR, mouth: o.mouth ?? 0, bob: o.bob });
function cam(cx, cy, z, f) { X.save(); X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-cx, -cy); ST.ZOOM = z; f(); X.restore(); ST.ZOOM = 1; }
function set(t) { X.fillStyle = C.wall; X.fillRect(-1500, -1500, 4100, 2830); X.fillStyle = C.floor; X.fillRect(-1500, 1330, 4100, 3000); room(t); tvSet(540, 560, .7, t, true); }
const UP = [[-90, -210], [90, -210]], WAVE = t => [60 + Math.sin(t * 12) * 30, -230];

const S = [
  (t, l) => { const z = lerp(1.35, 1, eo(A(t, l.t0, 1.2))); cam(540, lerp(700, 1000, eo(A(t, l.t0, 1.2))), z, () => { set(t); marco(t); luca(t); }); name('MARCO', MX, 1650, A(t, l.t0 + .6, .3)); name('LUCA', LX, 1650, A(t, l.t0 + .8, .3)); },
  (t, l) => { cam(540, 1000, 1, () => { set(t); marco(t, { lid: .5 }); luca(t, { smile: 1 }); }); bubble('−80 €', MX, 780, A(t, wt(l, /pagato/i), .25), '#ff6a6a', '#fff'); bubble('+150 €', LX, 780, A(t, wt(l, /guadagn/i), .25), '#3ad17a', '#fff'); },
  (t, l) => { const k = eo(A(t, l.t0, .5)); cam(lerp(540, MX, k), lerp(1000, 1060, k), lerp(1, 1.5, k), () => { set(t); luca(t); marco(t, { armR: WAVE(t), smile: .5, lid: .2 }); }); name('MARCO', 540, 1640, A(t, l.t0 + .2, .3)); },
  (t, l) => { const to = wt(l, /ottanta/i); cam(540, 1000, 1, () => { set(t); luca(t); marco(t, { lid: lerp(.2, .6, A(t, to + .5, .3)), brow: -.2, armR: [80, -60] });
      const u = seg(t, to, to + .9); if (u > 0 && u < 1) for (let i = 0; i < 5; i++) { const v = clamp(u * 1.4 - i * .1); coin(lerp(MX + 60, 540, v), lerp(1150, 620, v) - Math.sin(v * Math.PI) * 150, 30, t * 8 + i, '€'); } });
      bubble('−80 €', MX, 760, A(t, to + .3, .25), '#ff6a6a', '#fff'); if (t > wt(l, /tutti/i) - .1) for (let i = 0; i < 3; i++) bubble('−80 €', [180, 540, 900][i], [1700, 1760, 1700][i], A(t, wt(l, /tutti/i) - .1 + i * .12, .25), '#ff6a6a', '#fff', 54); },
  (t, l) => { const k = eo(A(t, l.t0, .5)); cam(lerp(540, LX, k), lerp(1000, 1060, k), lerp(1, 1.5, k), () => { set(t); marco(t); luca(t, { armL: [-60 - Math.sin(t * 12) * 30, -230], smile: 1 }); }); name('LUCA', 540, 1640, A(t, l.t0 + .2, .3)); },
  (t, l) => { const tg = wt(l, /gratis/i); cam(540, 1000, 1, () => { set(t); marco(t, { look: 1 }); luca(t, { armL: [-120, -40] }); });
      priceTag(lerp(540, LX - 40, eo(A(t, l.t0, .5))), 900, -.06, 1, '79,99 €', A(t, tg - .1, .3)); if (t > tg) bubble('GRATIS', LX - 20, 780, A(t, tg, .25), '#3ad17a', '#fff', 90); },
  (t, l) => { const tc = wt(l, /centocinq/i); cam(540, 1000, 1, () => { set(t); marco(t, { look: 1, brow: .8, lid: 0, mouth: .5 }); luca(t, { armL: UP[0], armR: UP[1], smile: 1, jump: Math.abs(Math.sin(seg(t, tc, tc + .9) * Math.PI * 2)) * 40 });
      for (let i = 0; i < 8; i++) if (t > tc + i * .05) coin(LX + 190, 1500 - i * 30, 40, 0, ''); }); bubble('+150 €', LX, 760, A(t, tc, .25), '#3ad17a', '#fff', 96); },
  (t, l) => { cam(MX + 60, 980, 1.45, () => { set(t); luca(t, { smile: 1 }); marco(t, { look: 1, brow: 1, lid: 0, mouth: .6 }); }); bubble('?', MX + 180, 620, A(t, l.t0, .2), '#ffffff', C.line, 140); },
  (t, l) => { const to = wt(l, /ottanta/i); cam(LX - 60, 1000, 1.3, () => { set(t); marco(t, { look: 1 }); luca(t, { armR: [10, -200] });
      phone(LX + 70, 1030, .7, .1, () => { if (t < to) { shape(rrect(-55, -60, 110, 110, 26), C.gold, C.gold2); font(80, "'Lilita One'"); X.fillStyle = C.line; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('B', 0, -2); } else { X.fillStyle = '#3ad17a'; X.fillRect(-100, -180, 200, 360); checkMark(0, 0, 60); } }); });
      bubble('+80 €', 560, 760, A(t, to, .25), '#3ad17a', '#fff', 100); },
  (t, l) => { const tc = wt(l, /centesimo/i), ts = wt(l, /settanta/i); cam(540, 1000, 1, () => { set(t); marco(t, { look: 1 }); luca(t, { armL: [-90, -90], smile: t > tc ? 1 : .6 });
      if (t > ts + .6) for (let i = 0; i < 6; i++) { const v = clamp((t - ts - .6) * 1.4 - i * .1); if (v > 0 && v < 1) coin(lerp(LX - 80, 540, v), lerp(1150, 640, v) - Math.sin(v * Math.PI) * 140, 28, t * 8 + i, '€'); }
      if (t > tc - .2) coin(LX - 140, 1130 - 20 * Math.abs(Math.sin(t * 5)), 26, Math.sin(t * 3) * .5, '1'); });
      priceTag(540, 900, -.06, A(t, ts - .1, .25)); bubble('0,01 €', LX, 760, A(t, tc, .25), '#ffffff', C.line, 84); },
  (t, l) => { const tt = [wt(l, /invitato/i), wt(l, /tre/i), wt(l, /amici/i)], tc = wt(l, /cinquanta/i), xs = [140, 940, 540];
      cam(540, 1060, .95, () => { set(t); luca(t, { x: 380, armL: UP[0], armR: UP[1], smile: 1 }); [0, 2, 3].forEach((k, i) => friend(xs[i] === 540 ? 700 : xs[i], 1480, .55, FRIENDS[k], t, A(t, tt[i] - .2, .3))); });
      [0, 1, 2].forEach(i => bubble('+50 €', [150, 930, 690][i], 880, A(t, tc + i * .22, .25), '#3ad17a', '#fff', 64)); },
  (t, l) => { cam(540, 1000, 1, () => { set(t); luca(t, { x: 480, armL: UP[0], armR: UP[1], smile: 1, jump: Math.abs(Math.sin(t * 8)) * 20 }); for (let i = 0; i < 12; i++) if (t > l.t0 + i * .05) coin(720, 1500 - i * 30, 44, 0, ''); }); bubble('+150 €', 540, 760, A(t, l.t0, .25), '#3ad17a', '#fff', 110); },
  (t, l) => { const ti = wt(l, /incassato/i); cam(540, 1000, 1, () => { set(t); marco(t, { lid: .7, brow: -.4, mouth: 0 }); luca(t, { armL: t > ti ? UP[0] : undefined, armR: t > ti ? UP[1] : undefined, smile: 1 }); });
      bubble('−80 €', MX, 780, A(t, l.t0, .25), '#ff6a6a', '#fff'); bubble('+150 €', LX, 780, A(t, ti, .25), '#3ad17a', '#fff'); name('MARCO', MX, 1650, 1); name('LUCA', LX, 1650, 1); },
  (t, l) => { cam(540, 1000, 1, () => { set(t); marco(t, { lookY: 0, armR: [40, -170] }); luca(t, { armL: [-40, -170], smile: 1 }); }); bubble('E tu?', 540, 820, A(t, l.t0 + .1, .25), '#ffffff', C.line, 110); },
  (t, l) => { cam(540, 1000, 1, () => { set(t); marco(t, { armR: WAVE(t), smile: .6, lid: .2 }); luca(t, { armL: [-60 - Math.sin(t * 12) * 30, -230], smile: 1 }); });
      const a = A(t, l.t0, .3); X.save(); X.globalAlpha = a; X.translate(540, 760); shape(rrect(-480, -110, 960, 220, 30), '#ffffff', null); font(32, "'Lilita One'"); X.fillStyle = '#9a8fb0'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', 0, -66);
      font(86, "'JB Mono'"); X.fillStyle = C.line; const cw = 60, x0 = -(CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) { const k = A(t, l.t0 + .1 + i * .07, .12); if (k <= 0) continue; X.globalAlpha = a * k; X.fillText(CODE[i], x0 + i * cw, 26); } X.restore();
      bubble('LINK IN BIO ↑', 540, 1020, A(t, wt(l, /link/i) - .1, .25), '#3ad17a', '#fff', 80); },
];

fetch('timeline.json').then(r => r.json()).then(TL => {
  const L = TL.lines;
  function render(t) {
    X.setTransform(SC, 0, 0, SC, 0, 0); ST.BOIL = Math.floor(t * 12) % 3; ST.ZOOM = 1; X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
    let i = 0; for (let k = 0; k < L.length; k++) if (t >= L[k].t0 - .2) i = k;
    S[i](t, L[i]);
    const k = seg(t, L[i].t0 - .2, L[i].t0 - .12); if (i && k > 0 && k < 1) { X.fillStyle = `rgba(255,255,255,${.35 * (1 - k)})`; X.fillRect(0, 0, W, H); }
  }
  const EV = [{ t: 0, type: 'zap' }]; L.forEach((l, k) => { if (k) EV.push({ t: l.t0 - .2, type: 'whoosh' }); });
  const at = (k, re, type, d = 0) => EV.push({ t: wt(L[k], re) + d, type });
  at(1, /pagato/i, 'pop'); at(1, /guadagn/i, 'cash'); at(2, /marco/i, 'boing'); for (let i = 0; i < 5; i++) at(3, /ottanta/i, 'coin', i * .12); at(4, /luca/i, 'boing'); at(5, /gratis/i, 'snap'); at(6, /centocinq/i, 'cash');
  at(7, /come/i, 'boing'); at(8, /ottanta/i, 'cash'); at(9, /centesimo/i, 'ting'); at(10, /invitato/i, 'pop'); at(10, /tre/i, 'pop'); at(10, /amici/i, 'pop'); for (let i = 0; i < 3; i++) at(10, /cinquanta/i, 'coin', i * .22);
  at(11, /centocinq/i, 'cash'); at(12, /incassato/i, 'cash'); at(13, /tu/i, 'pop'); at(14, /link/i, 'ding');
  EV.sort((a, b) => a.t - b.t);
  Object.assign(window, { DUR: TL.dur, render, EV, TEXTS: () => [] });
  Promise.all(["40px 'Lilita One'", "40px 'JB Mono'"].map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
});
