// Marco vs Luca — stick figures on warm paper, one accent. The people are the diagram; only names and numbers are written.
import { X, W, H, C, J, MONO, M, GROUND, A, spr, font, grain, say, figure, box, coin, arrowUp, chainRun, ground, clamp, lerp, seg, eo, back, hash, TAU } from './paper.js';
const CODE = 'B2601M2FCQ7OBC';
const MX = 270, LX = 810;
const wt = (l, re) => (l.words.find(w => re.test(w.w)) || l.words[0]).t0;
const SC = (innerWidth || 1080) / W;

function tag(txt, x, y, px, col, a) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); font(px, J, 600); X.fillStyle = col; X.textAlign = 'center'; X.textBaseline = 'alphabetic'; X.fillText(txt, x, y + (1 - eo(clamp(a))) * 16); X.restore(); }
function phone(x, y, a, ok) { if (a <= 0) return; X.save(); X.globalAlpha = clamp(a); X.translate(x, y); X.strokeStyle = C.ink; X.lineWidth = 7; X.fillStyle = C.paper; X.beginPath(); X.roundRect(-80, -150, 160, 300, 24); X.fill(); X.stroke();
  if (!ok) { font(110, J, 600); X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('B', 0, -10); } else { X.strokeStyle = C.acc; X.lineWidth = 14; X.lineCap = 'round'; X.beginPath(); X.moveTo(-40, 0); X.lineTo(-10, 34); X.lineTo(46, -36); X.stroke(); }
  X.restore(); }
function stack(x, n, t, t0) { for (let i = 0; i < n; i++) { const a = A(t, t0 + i * .06, .15); if (a <= 0) continue; X.save(); X.globalAlpha = a; X.fillStyle = C.acc; X.strokeStyle = C.ink; X.lineWidth = 4; X.beginPath(); X.ellipse(x, GROUND - 14 - i * 24, 44, 14, 0, 0, TAU); X.fill(); X.stroke(); X.restore(); } }
const marco = (t, o = {}) => figure(o.x ?? MX, o.h ?? 300, { label: 'MARCO', pop: o.pop ?? 1, armL: o.armL ?? { a: -.25 }, armR: o.armR ?? { a: .25 }, jump: o.jump, lean: o.lean });
const luca = (t, o = {}) => figure(o.x ?? LX, o.h ?? 300, { label: 'LUCA', acc: o.acc, pop: o.pop ?? 1, armL: o.armL ?? { a: -.25 }, armR: o.armR ?? { a: .25 }, jump: o.jump });
function fade(a, f) { X.save(); X.globalAlpha = a; f(); X.restore(); }

const S = [
  (t, l) => { say('Due amici.', M, 430, 104, C.ink, A(t, l.t0, .3)); say('Stesso gioco.', M, 540, 104, C.ink, A(t, wt(l, /stesso/i) - .05, .3)); marco(t, { pop: spr(t, l.t0) }); luca(t, { pop: spr(t, l.t0 + .4) }); box(540, 'GTA 6', null, A(t, wt(l, /gioco/i) - .1, .35)); },
  (t, l) => { marco(t); luca(t); box(540, 'GTA 6', null, 1); tag('−80 €', MX, 760, 90, C.ink, A(t, wt(l, /pagato/i), .3)); tag('+150 €', LX, 760, 100, C.acc, A(t, wt(l, /guadagn/i), .3)); },
  (t, l) => { say('Lui è Marco.', M, 420, 104, C.ink, A(t, l.t0, .35)); marco(t, { armR: { a: lerp(.25, 2.6, eo(A(t, l.t0 + .3, .3))) } }); fade(.35, () => luca(t)); },
  (t, l) => { const to = wt(l, /ottanta/i); say('−80 €', M, 470, 170, C.ink, A(t, to - .05, .3)); say('per GTA 6. Come tutti.', M, 550, 50, C.mute, A(t, wt(l, /tutti/i) - .3, .3));
      marco(t, { lean: -.4 }); box(540, 'GTA 6', '79,99 €', 1); const u = seg(t, to, to + .8); if (u > 0 && u < 1) coin(lerp(MX + 60, 500, u), GROUND - 160 - Math.sin(u * Math.PI) * 140, 26, 1);
      if (t > wt(l, /tutti/i) - .1) for (let i = 0; i < 3; i++) fade(.35 * A(t, wt(l, /tutti/i) - .1 + i * .08, .3), () => figure(700 + i * 120, 220, { armL: { a: -.25 }, armR: { a: .25 } })); },
  (t, l) => { say('Lui invece è Luca.', M, 420, 96, C.ink, A(t, l.t0, .35)); fade(.35, () => marco(t)); luca(t, { acc: true, armL: { a: lerp(-.25, -2.6, eo(A(t, l.t0 + .3, .3))) } }); },
  (t, l) => { const tg = wt(l, /gratis/i); say('GTA 6', M, 470, 130, C.ink, A(t, l.t0, .3)); say('gratis', M, 610, 150, C.acc, A(t, tg - .05, .3)); fade(.35, () => marco(t));
      const k = eo(A(t, tg - .3, .6)); box(lerp(540, 640, k), 'GTA 6', '79,99 €', 1, A(t, tg, .3)); luca(t, { acc: true, armL: { a: k >= 1 ? -1.4 : -.25 } }); },
  (t, l) => { const tc = wt(l, /centocinq/i); say('+150 €', M, 520, 190, C.acc, A(t, tc - .05, .3)); fade(.35, () => marco(t)); luca(t, { acc: true, armL: { a: -2.6 }, armR: { a: 2.6 }, jump: Math.max(0, Math.sin(seg(t, tc, tc + .5) * Math.PI)) * .12 }); stack(LX - 170, 7, t, tc); },
  (t, l) => { say('Come?', M, 520, 190, C.ink, A(t, l.t0 - .05, .3)); luca(t, { x: 540, acc: true }); },
  (t, l) => { const to = wt(l, /ottanta/i), tb = wt(l, /buddy/i); say('Conto Buddy', M, 400, 96, C.ink, A(t, tb - .1, .3)); say('+ codice amico', M, 490, 60, C.mute, A(t, wt(l, /codice/i), .3)); say('+80 €', M, 650, 170, C.acc, A(t, to - .05, .3));
      phone(760, 980, A(t, l.t0, .3), t > to); const lu = luca(t, { x: 330, acc: true, armR: { a: 1.4 } }); if (t > to) { X.save(); X.strokeStyle = C.acc; X.lineWidth = 10; X.lineCap = 'round'; X.beginPath(); X.moveTo(680, 1000); X.lineTo(lerp(680, 430, eo(A(t, to, .4))), lerp(1000, 960, eo(A(t, to, .4)))); X.stroke(); X.restore(); } },
  (t, l) => { say('+80,00 €', M, 430, 110, C.acc, 1); say('− 79,99 €', M, 560, 110, C.ink, A(t, wt(l, /settanta/i) - .05, .3)); const r = A(t, wt(l, /avanzato/i) - .2, .3); if (r > 0) { X.fillStyle = C.ink; X.fillRect(M, 610, 560 * eo(r), 6); }
      say('= 0,01 €', M, 740, 120, C.acc, A(t, wt(l, /centesimo/i) - .1, .3)); luca(t, { x: 300, acc: true, armR: { a: lerp(.25, .9, A(t, wt(l, /centesimo/i), .3)) }, }); coin(420, GROUND - 28, 26, A(t, wt(l, /centesimo/i), .35)); box(820, 'GTA 6', null, 1); },
  (t, l) => { const xs = [180, 400, 620, 840], tt = [l.t0, wt(l, /invitato/i), wt(l, /tre/i), wt(l, /amici/i)], tc = wt(l, /cinquanta/i), hgt = 260;
      const clasps = [], joined = []; for (let i = 0; i < 3; i++) { const c = eo(seg(t, tt[i + 1] - .1, tt[i + 1] + .25)); joined.push(c); clasps.push([(xs[i] + xs[i + 1]) / 2, GROUND - hgt * .57 - hgt * .06]); }
      const figs = []; for (let i = 0; i < 4; i++) { const L = i > 0 && joined[i - 1] > 0 ? { clasp: [lerp(xs[i] - 70, clasps[i - 1][0], joined[i - 1]), lerp(GROUND - 150, clasps[i - 1][1], joined[i - 1])] } : { a: -.25 };
        const R = i < 3 && joined[i] > 0 ? { clasp: [lerp(xs[i] + 70, clasps[i][0], joined[i]), lerp(GROUND - 150, clasps[i][1], joined[i])] } : { a: .25 };
        figs.push(figure(xs[i], hgt, { pop: i === 0 ? 1 : spr(t, tt[i] - .3), label: i === 0 ? 'LUCA' : '', acc: i === 0, armL: L, armR: R })); }
      const links = []; for (let i = 0; i < 3; i++) if (figs[i] && figs[i + 1] && joined[i] >= 1) links.push([figs[i].hands[1], figs[i + 1].hands[0]]);
      if (links.length) chainRun(links, 400 * links.length * clamp(seg(t, tc - .2, tc + .9)));
      say('3 amici', M, 430, 110, C.ink, A(t, wt(l, /tre/i), .3)); say('+50 € ciascuno', M, 560, 90, C.acc, A(t, tc - .05, .3));
      for (let i = 1; i < 4; i++) tag('+50 €', xs[i], GROUND - 300, 50, C.acc, A(t, tc + (i - 1) * .2, .25)); },
  (t, l) => { say('+150 €', M, 560, 210, C.acc, A(t, l.t0 - .05, .3)); say('in tasca', M, 660, 70, C.mute, A(t, wt(l, /tasca/i) - .1, .3)); luca(t, { x: 380, acc: true, armL: { a: -2.6 }, armR: { a: 2.6 }, jump: Math.max(0, Math.sin(seg(t, l.t0, l.t0 + .5) * Math.PI)) * .1 }); stack(640, 9, t, l.t0); },
  (t, l) => { const ti = wt(l, /incassato/i); marco(t, { lean: -.4 }); luca(t, { acc: true, armL: { a: t > ti ? -2.6 : -.25 }, armR: { a: t > ti ? 2.6 : .25 } }); X.fillStyle = C.tint; X.fillRect(538, 700, 4, 500);
      tag('ha pagato', MX, 640, 56, C.mute, A(t, l.t0, .3)); tag('−80 €', MX, 760, 100, C.ink, A(t, l.t0 + .2, .3)); tag('ha incassato', LX, 640, 56, C.mute, A(t, ti - .2, .3)); tag('+150 €', LX, 760, 110, C.acc, A(t, ti, .3)); },
  (t, l) => { say('E tu?', M, 520, 190, C.ink, A(t, l.t0, .3)); fade(.35, () => marco(t, { x: 180, h: 240 })); fade(.35, () => luca(t, { x: 900, h: 240, acc: true })); figure(540, 300, { label: 'TU', acc: true, pop: spr(t, l.t0 + .2), armL: { a: -.25 }, armR: { a: .25 } }); },
  (t, l) => { const a = A(t, l.t0, .35); X.save(); X.globalAlpha = a; X.translate(540, 560); X.fillStyle = C.paper; X.strokeStyle = C.ink; X.lineWidth = 6; X.beginPath(); X.rect(-470, -120, 940, 240); X.fill(); X.stroke();
      font(26, J, 500); X.fillStyle = C.mute; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', -430, -78); font(86, MONO, 700); X.fillStyle = C.ink; X.textAlign = 'center';
      const cw = 60, x0 = -(CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) { const k = A(t, l.t0 + .1 + i * .07, .12); if (k <= 0) continue; X.globalAlpha = a * k; X.fillText(CODE[i], x0 + i * cw, 22); } X.restore();
      say('Link in bio', M, 900, 130, C.ink, A(t, wt(l, /link/i) - .1, .3)); arrowUp(M + 780, 840, A(t, wt(l, /bio/i), .3)); figure(540, 260, { label: 'TU', acc: true, armL: { a: -.25 }, armR: { a: 2.7 } }); },
];

fetch('timeline.json').then(r => r.json()).then(TL => {
  const L = TL.lines;
  function render(t) {
    X.setTransform(SC, 0, 0, SC, 0, 0); X.fillStyle = C.paper; X.fillRect(0, 0, W, H); X.drawImage(grain, 0, 0, W, H); ground(t);
    let i = 0; for (let k = 0; k < L.length; k++) if (t >= L[k].t0 - .2) i = k;
    S[i](t, L[i]);
  }
  const EV = [{ t: 0, type: 'pop' }]; L.forEach((l, k) => { if (k) EV.push({ t: l.t0 - .2, type: 'swoosh' }); });
  const at = (k, re, type) => EV.push({ t: wt(L[k], re), type });
  at(1, /guadagn/i, 'ding'); at(3, /ottanta/i, 'coin'); at(5, /gratis/i, 'ding'); at(6, /centocinq/i, 'coin'); at(7, /come/i, 'thump'); at(8, /ottanta/i, 'coin'); at(9, /centesimo/i, 'coin');
  at(10, /invitato/i, 'clasp'); at(10, /tre/i, 'clasp'); at(10, /amici/i, 'clasp'); at(10, /cinquanta/i, 'pulse'); at(11, /centocinq/i, 'ding'); at(12, /incassato/i, 'coin'); at(13, /tu/i, 'pop');
  for (let i = 0; i < CODE.length; i++) EV.push({ t: L[14].t0 + .1 + i * .07, type: 'key' }); EV.sort((a, b) => a.t - b.t);
  Object.assign(window, { DUR: TL.dur, render, EV, TEXTS: () => [] });
  Promise.all(["500 40px 'Jost'", "600 40px 'Jost'", "700 40px 'JB Mono'"].map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
});
