// Video 3 — Stick-figure Explainer, vertical 1080×1920. Ink figures on warm paper, one accent; the people are the diagram.
import { clamp, lerp, seg, eo, ei, back, hash, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T } from './beats.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W, X = cv.getContext('2d');
const C = { paper: '#F3F0EA', ink: '#24242C', mute: '#9C978C', tint: '#E2DDD2', acc: '#EB4A2A' };
const J = "'Jost'", MONO = "'JB Mono'";
const font = (px, fam, w) => (X.font = `${w} ${px}px ${fam}`);
const M = 90;                       // left margin
const GROUND = 1185;                // the system line
const A = (t, t0, d = .4) => seg(t, t0, t0 + d);
const spr = (t, t0, d = .4) => { const u = seg(t, t0, t0 + d); return u <= 0 ? 0 : back(u, 2.2); };   // pop out of the ground, ~20 % overshoot

// paper grain, drawn once
const grain = (() => { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const g = c.getContext('2d'); const d = g.createImageData(540, 960);
  for (let i = 0; i < d.data.length; i += 4) { const v = hash(i * .37) * 6 - 3; d.data[i] = 128 + v; d.data[i + 1] = 128 + v; d.data[i + 2] = 128 + v; d.data[i + 3] = 16; } g.putImageData(d, 0, 0); return c; })();

// ———— type ————
function say(txt, x, y, px, col, a, w = 600, align = 'left', e = 0) {   // slides up 18 px while fading in
  if (a <= 0 || e >= 1) return; X.save(); X.globalAlpha = clamp(a) * (1 - e); font(px, J, w); X.fillStyle = col; X.textAlign = align; X.textBaseline = 'alphabetic';
  X.fillText(txt, x, y + (1 - eo(a)) * (px > 120 ? 40 : 18)); X.restore();
}
function subtitle(t) {
  const s = SUBS.find(([a, b]) => t >= a && t < b); if (!s) return; const a = A(t, s[0], .25);
  X.save(); X.globalAlpha = clamp(a); X.fillStyle = C.acc; X.fillRect(M, 1290, 5, 104);
  font(42, J, 500); X.fillStyle = C.ink; X.textAlign = 'left'; X.textBaseline = 'top';
  const words = s[2].split(' '), lines = []; let cur = ''; for (const w of words) { const tt = cur ? cur + ' ' + w : w; if (X.measureText(tt).width > 840 && cur) { lines.push(cur); cur = w; } else cur = tt; } lines.push(cur);
  lines.slice(0, 2).forEach((l, i) => X.fillText(l, M + 26, 1290 + i * 54)); X.restore();
}

// ———— figures ————
// pose: arms as hand targets relative to the shoulder (in figure heights), or 'clasp' points in world coords
function figure(x, h, o) {
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
function box(x, label, price, a, strike = 0, gratis = 0) {   // the game: a plain box on the line
  if (a <= 0) return; const h = 300 * eo(a), w = 230;
  X.save(); X.strokeStyle = C.ink; X.lineWidth = 7; X.fillStyle = C.tint; X.beginPath(); X.rect(x - w / 2, GROUND - h, w, h); X.fill(); X.stroke();
  if (a > .6) { font(64, J, 600); X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(label, x, GROUND - h + 80);
    if (price) { font(44, J, 500); X.fillStyle = C.ink; X.fillText(price, x, GROUND - 90); if (strike > 0) { X.strokeStyle = C.acc; X.lineWidth = 7; X.beginPath(); X.moveTo(x - 90, GROUND - 90); X.lineTo(x - 90 + 180 * eo(strike), GROUND - 90); X.stroke(); } } }
  if (gratis > 0) { X.globalAlpha = clamp(gratis); font(52, J, 600); X.fillStyle = C.acc; X.textAlign = 'center'; X.fillText('gratis', x, GROUND - 30); }
  X.restore();
}
function coin(x, y, r, a) { if (a <= 0) return; X.save(); X.translate(x, y); X.scale(eo(a), eo(a)); X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = C.acc; X.fill(); font(r * 1.1, J, 600); X.fillStyle = C.paper; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('1', 0, 3); X.restore(); }
function arrowUp(x, y, a) { if (a <= 0) return; X.save(); X.translate(x, y + (1 - eo(a)) * 40); X.globalAlpha = clamp(a); X.strokeStyle = C.acc; X.lineWidth = 12; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(0, 80); X.lineTo(0, -80); X.moveTo(-50, -30); X.lineTo(0, -80); X.lineTo(50, -30); X.stroke(); X.restore(); }

// the code card: big, then docked at the top
function codeCard(t) {
  if (t < 17.3) return; const a = A(t, 17.3, .35), dock = eo(seg(t, 19.75, 20.1));
  const y = lerp(560, 250, dock), s = lerp(1, .78, dock);
  X.save(); X.translate(W / 2, y); X.scale(s, s); X.globalAlpha = clamp(a);
  X.fillStyle = C.paper; X.strokeStyle = C.ink; X.lineWidth = 6; X.beginPath(); X.rect(-470, -120, 940, 240); X.fill(); X.stroke();
  font(26, J, 500); X.fillStyle = C.mute; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', -430, -78);
  font(86, MONO, 700); X.fillStyle = C.ink; X.textAlign = 'center';
  const cw = 60, x0 = -(CODE.length - 1) * cw / 2;
  for (let i = 0; i < CODE.length; i++) { const lt = t - (17.5 + i * .1); if (lt < 0) continue; X.globalAlpha = clamp(lt / .12); X.fillText(CODE[i], x0 + i * cw, 22 + (1 - eo(clamp(lt / .2))) * 18); }
  X.globalAlpha = 1; X.fillStyle = C.acc; X.fillRect(-470, 112, 940 * eo(seg(t, 19.0, 19.5)), 8);
  X.restore();
}

// accent run along a chain of joined arms
function chainRun(links, len) {
  if (len <= 0) return; X.save(); X.strokeStyle = C.acc; X.lineWidth = 12; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath();
  let left = len, first = true;
  const curve = (a, c, b, rev) => { const pts = []; for (let i = 0; i <= 16; i++) { const u = rev ? 1 - i / 16 : i / 16; pts.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); } return pts; };
  const pts = []; for (const [R, L] of links) { pts.push(...curve(R.sh, R.mid, R.hand, false), ...curve(L.sh, L.mid, L.hand, true)); }
  for (let i = 0; i < pts.length; i++) { if (first) { X.moveTo(...pts[i]); first = false; continue; } const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (left < d) { const u = left / d; X.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); break; } left -= d; X.lineTo(...pts[i]); }
  X.stroke(); X.restore();
}

function ground(t) { X.strokeStyle = C.tint; X.lineWidth = 5; X.beginPath(); X.moveTo(M - 30, GROUND); X.lineTo(W - M + 30, GROUND); X.stroke(); }

function render(t) {
  X.setTransform(SC, 0, 0, SC, 0, 0);
  X.fillStyle = C.paper; X.fillRect(0, 0, W, H); X.drawImage(grain, 0, 0, W, H);
  ground(t);
  const breathe = Math.sin(t * 2.1) * .02;

  if (t < 4.45) {   // GTA 6 is out — and I play it free
    say('GTA 6 è uscito', M, 400, 120, C.ink, A(t, .05, .35), 600, 'left', seg(t, 4.3, 4.45));
    say('da poche ore', M, 480, 52, C.mute, A(t, T.uscito), 500, 'left', seg(t, 4.3, 4.45));
    say('e io ci gioco', M, 640, 64, C.ink, A(t, T.ioGioco), 500, 'left', seg(t, 4.3, 4.45));
    say('GRATIS', M, 820, 190, C.acc, A(t, T.gratis - .05, .3), 600, 'left', seg(t, 4.3, 4.45));
    const happy = A(t, T.gratis, .3), j = Math.max(0, Math.sin(seg(t, T.gratis, T.gratis + .45) * Math.PI)) * .12;
    figure(330, 300, { pop: spr(t, .1), label: 'IO', jump: j, armL: { a: lerp(-.25, -2.6, eo(happy)) }, armR: { a: lerp(.25, 2.6, eo(happy)) } });
    box(760, 'GTA 6', null, A(t, .3, .35));
  } else if (t < 8.75) {   // how: account + a friend's code
    say('Come?', M, 400, 104, C.ink, A(t, T.spiego - .05), 600);
    say('1  Apri un conto Buddy', M, 520, 56, C.ink, A(t, T.aperto - .1), 500);
    say('2  Metti il codice di un amico', M, 600, 56, C.ink, A(t, T.codice - .1), 500);
    const cl = eo(seg(t, 7.5, 7.8)), clasp = [lerp(470, 540, cl), lerp(GROUND - 200, GROUND - 215, cl)];
    const me = figure(330, 300, { label: 'IO', armR: cl > 0 ? { clasp: [lerp(330 + 100, clasp[0], cl), lerp(GROUND - 160, clasp[1], cl)] } : { a: .25 } });
    const fr = figure(750, 300, { pop: spr(t, T.codice - .1), label: 'AMICO', armL: cl > 0 ? { clasp: [lerp(750 - 100, clasp[0], cl), lerp(GROUND - 160, clasp[1], cl)] } : { a: -.25 } });
    if (me && fr && cl >= 1) { const run = seg(t, T.amico - .1, T.amico + .4); chainRun([[fr.hands[0], me.hands[1]]], run * 520); }
    if (t > T.amico + .3) { const ok = A(t, T.amico + .3, .3); X.save(); X.globalAlpha = clamp(ok); font(44, J, 500); X.fillStyle = C.acc; X.textAlign = 'center'; X.fillText('codice', 540, GROUND - 270); X.restore(); }
  } else if (t < 16.05) {  // +80 € − 79,99 € = 0,01 €
    say('+80 €', M, 470, 170, C.acc, A(t, T.ottanta - .05, .3), 600);
    say('bonus di benvenuto', M, 540, 44, C.mute, A(t, T.ottanta + .2), 500);
    say('− 79,99 €', M, 680, 96, C.ink, A(t, T.prezzo - .05), 600);
    say('il prezzo di GTA 6', M, 740, 44, C.mute, A(t, T.prezzo + .2), 500);
    const rl = A(t, 13.9, .3); if (rl > 0) { X.fillStyle = C.ink; X.fillRect(M, 790, 600 * eo(rl), 5); }
    say('= 0,01 €', M, 900, 110, C.acc, A(t, T.avanza - .05, .3), 600);
    const look = A(t, T.centesimo, .3);
    figure(300, 260, { label: 'IO', armL: { a: -.25 }, armR: { a: lerp(.25, .9, eo(look)) }, lean: look * .6 });
    box(780, 'GTA 6', '79,99 €', A(t, T.gtaCosta, .35));
    coin(420, GROUND - 28, 26, A(t, T.centesimo, .35));
  } else if (t < 23.4) {   // your turn: the code, +80 €, GTA practically free
    const e = seg(t, 19.7, 19.85);
    say('Ora tocca a te.', M, 400, 104, C.ink, A(t, T.tocca - .05), 600, 'left', seg(t, 17.1, 17.3));
    say('Registrati con questo codice', M, 770, 56, C.ink, A(t, T.registrati + .2), 500, 'left', e);
    if (t > 19.8) {
      say('ricevi', M, 480, 52, C.mute, A(t, T.ricevi), 500);
      say('+80 €', M, 640, 170, C.acc, A(t, T.ottanta2 - .05, .3), 600);
      say('e GTA 6 è praticamente', M, 760, 52, C.ink, A(t, T.eGta), 500);
      say('gratis', M, 860, 96, C.acc, A(t, T.gratis2 - .05), 600);
    }
    const pt = A(t, T.tocca, .3);
    figure(240, 260, { label: 'IO', armR: { a: lerp(.25, 1.75, eo(pt)) }, armL: { a: -.25 } });
    figure(560, 280, { pop: spr(t, T.tocca + .2), label: 'TU', acc: true, armL: { a: -.25 }, armR: { a: .25 }, jump: Math.max(0, Math.sin(seg(t, T.ottanta2, T.ottanta2 + .4) * Math.PI)) * .08 });
    box(860, 'GTA 6', '79,99 €', A(t, T.eGta - .2, .35), A(t, T.praticamente, .3), A(t, T.gratis2, .3));
  } else {                 // +50 € for every friend; a chain of hands; link in bio
    const close = seg(t, 29.8, 30.1);
    say('E non è finita.', M, 470, 84, C.ink, A(t, T.nonFinita - .05), 600, 'left', seg(t, 24.3, 24.45));
    say('Per ogni amico che inviti', M, 470, 64, C.ink, A(t, T.ogniAmico), 500, 'left', close);
    const hits = [T.cinquanta0, T.c1, T.c2, T.c3], n = hits.filter(h => t >= h).length;
    if (t > T.altri50 - .1) say(`+${Math.max(1, n) * 50} €`, M, 680, 170, C.acc, A(t, T.altri50 - .1, .3), 600, 'left', close);
    say('Condizioni e info', M, 520, 64, C.mute, A(t, T.condizioni), 500);
    say('Link in bio', M, 680, 140, C.ink, A(t, T.linkBio - .05), 600);
    arrowUp(M + 760, 620, A(t, T.bio - .2, .3));
    // the chain: TU + four friends join hands one by one
    const xs = [150, 345, 540, 735, 930], hgt = 250, lift = A(t, T.bio, .4);
    const clasps = [], joined = [];
    for (let i = 0; i < 4; i++) { const c = eo(seg(t, hits[i] - .3, hits[i])); joined.push(c); const mx = (xs[i] + xs[i + 1]) / 2; clasps.push([mx, GROUND - hgt * (.74 - .17) - hgt * .06 - lift * hgt * .5]); }
    const figs = [];
    for (let i = 0; i < 5; i++) {
      const L = i > 0 && joined[i - 1] > 0 ? { clasp: [lerp(xs[i] - 70, clasps[i - 1][0], joined[i - 1]), lerp(GROUND - 160, clasps[i - 1][1], joined[i - 1])] } : { a: -.25 };
      const R = i < 4 && joined[i] > 0 ? { clasp: [lerp(xs[i] + 70, clasps[i][0], joined[i]), lerp(GROUND - 160, clasps[i][1], joined[i])] } : { a: .25 };
      const pop = i === 0 ? 1 : spr(t, hits[i - 1] - .45);
      figs.push(figure(xs[i], hgt, { pop, label: i === 0 ? 'TU' : `+50 €`, acc: i === 0, armL: L, armR: R }));
    }
    const links = []; for (let i = 0; i < 4; i++) if (figs[i] && figs[i + 1] && joined[i] >= 1) links.push([figs[i].hands[1], figs[i + 1].hands[0]]);
    const runEnd = Math.max(0, ...hits.map((h, i) => t >= h ? (i + 1) : 0));
    if (links.length) chainRun(links, 400 * links.length * clamp(seg(t, hits[0], hits[0] + .3) + (runEnd - 1)) );
  }
  codeCard(t);
  subtitle(t);
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(.1, 'pop'); ev(.3, 'thump'); ev(T.gratis - .05, 'ding'); ev(T.gratis, 'pop');
ev(T.spiego, 'swoosh'); ev(T.aperto - .1, 'pencil'); ev(T.codice - .1, 'pop'); ev(T.codice - .1, 'pencil'); ev(7.8, 'clasp'); ev(T.amico - .1, 'pulse');
ev(8.75, 'swoosh'); ev(T.ottanta, 'coin'); ev(T.gtaCosta, 'thump'); ev(T.prezzo, 'pencil'); ev(13.9, 'pencil'); ev(T.avanza, 'ding'); ev(T.centesimo, 'coin');
ev(16.05, 'swoosh'); ev(T.tocca + .2, 'pop'); ev(17.3, 'swoosh'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'key'); ev(19.75, 'swoosh');
ev(T.ottanta2, 'coin'); ev(T.eGta - .2, 'thump'); ev(T.praticamente, 'pencil'); ev(T.gratis2, 'ding');
ev(23.4, 'swoosh'); for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .45, 'pop'); ev(h, 'clasp'); ev(h, 'coin'); }
ev(29.85, 'swoosh'); ev(T.linkBio, 'pop'); ev(T.bio, 'ding');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { const s = SUBS.find(([a, b]) => t >= a && t < b); return s ? [{ id: 's' + s[0], text: s[2], x0: M, y0: 1290, x1: 990, y1: 1400 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all(["500 40px 'Jost'", "600 40px 'Jost'", "700 40px 'JB Mono'"].map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
