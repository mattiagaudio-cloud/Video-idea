// Video 1 — Dark Tech Keynote, vertical 1080×1920. One line per screen, one accent (lime) for money and the code.
import { clamp, lerp, seg, eo, ei, back, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T } from './beats.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W, X = cv.getContext('2d');

const C = { bg: '#07090d', s1: '#10141b', s2: '#161b24', s3: '#1d2430', line: 'rgba(255,255,255,.08)', t1: '#f2f5f9', t2: '#9aa4b2', t3: '#5d6776', acc: '#b7f34a', red: '#ff5a5f' };
const F = { ui: "'Inter'", big: "'Inter Tight'", mono: "'JB Mono'" };
const font = (px, fam, w = 500) => (X.font = `${w} ${px}px ${fam}`);
const rr = (x, y, w, h, r) => { X.beginPath(); X.roundRect(x, y, w, h, r); };
const bk = t => back(t, 1.3);

// ———— stage ————
function stage(t) {
  X.fillStyle = C.bg; X.fillRect(0, 0, W, H);
  let g = X.createRadialGradient(W / 2, 520, 0, W / 2, 520, 1100); g.addColorStop(0, 'rgba(120,140,180,.13)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  g = X.createRadialGradient(900, 1500, 0, 900, 1500, 800); g.addColorStop(0, 'rgba(183,243,74,.045)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  for (let i = 0, x = 12; x < W; x += 48, i++) { X.fillStyle = i % 4 ? 'rgba(255,255,255,.028)' : 'rgba(255,255,255,.055)'; X.fillRect(x, 0, 1, H); }
  for (let i = 0, y = 0; y < H; y += 48, i++) { X.fillStyle = i % 4 ? 'rgba(255,255,255,.028)' : 'rgba(255,255,255,.055)'; X.fillRect(0, y, W, 1); }
  g = X.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
}

// ———— primitives ————
// text that rises into place (fast-out + small overshoot); a: 0..1 arrival, e: 0..1 exit
function line(txt, x, y, px, fam, w, col, a, e = 0, align = 'center', glow = 0) {
  if (a <= 0 || e >= 1) return;
  X.save(); X.globalAlpha = clamp(a * 2) * (1 - e);
  X.translate(x, y + (1 - bk(a)) * 40 - e * 30); font(px, fam, w); X.textAlign = align; X.textBaseline = 'middle'; X.fillStyle = col;
  if (glow) { X.shadowColor = col; X.shadowBlur = glow; }
  X.fillText(txt, 0, 0); X.restore();
}
// a light sweep reveals the text left→right
function sweep(txt, x, y, px, fam, w, col, a, e = 0, glow = 0) {
  if (a <= 0 || e >= 1) return;
  font(px, fam, w); const tw = X.measureText(txt).width, x0 = x - tw / 2 - 40, p = x0 + (tw + 80) * eo(a);
  X.save(); X.globalAlpha = 1 - e; X.beginPath(); X.rect(0, y - px, p, px * 2); X.clip();
  X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = col; if (glow) { X.shadowColor = col; X.shadowBlur = glow; } X.fillText(txt, x, y - e * 30); X.restore();
  if (a < 1) { const g = X.createLinearGradient(p - 120, 0, p + 10, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.55)'); X.fillStyle = g; X.fillRect(p - 120, y - px * .6, 130, px * 1.2); }
}
function label(txt, y, a, e = 0) { line(txt, W / 2, y, 34, F.mono, 500, C.t2, a, e); }
function card(x, y, w, h, a, e = 0, accentEdge = 0) {
  if (a <= 0 || e >= 1) return false;
  const k = bk(a); X.save(); X.globalAlpha = clamp(a * 2) * (1 - e); X.translate(x + w / 2, y + h / 2 + (1 - k) * 50 + e * 40); X.scale(.96 + .04 * k, .96 + .04 * k);
  X.shadowColor = 'rgba(0,0,0,.6)'; X.shadowBlur = 60; X.shadowOffsetY = 24; rr(-w / 2, -h / 2, w, h, 36); X.fillStyle = C.s1; X.fill(); X.shadowColor = 'transparent'; X.shadowOffsetY = 0;
  X.lineWidth = 2; X.strokeStyle = accentEdge ? `rgba(183,243,74,${.25 + .55 * accentEdge})` : C.line; X.stroke();
  if (accentEdge) { X.shadowColor = C.acc; X.shadowBlur = 40 * accentEdge; X.stroke(); X.shadowBlur = 0; }
  X.fillStyle = 'rgba(255,255,255,.06)'; X.fillRect(-w / 2 + 36, -h / 2 + 1, w - 72, 1);
  X.translate(-w / 2, -h / 2); return true;
}
const endCard = () => X.restore();
function check(x, y, r, a, col = C.acc) {
  if (a <= 0) return; X.save(); X.translate(x, y); X.scale(bk(a), bk(a)); X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = col; X.fill();
  X.strokeStyle = C.bg; X.lineWidth = r * .22; X.lineCap = 'round'; X.lineJoin = 'round'; X.beginPath(); X.moveTo(-r * .42, 0); X.lineTo(-r * .1, r * .32); X.lineTo(r * .45, -r * .35); X.stroke(); X.restore();
}
function arrowUp(x, y, s, a) {
  if (a <= 0) return; X.save(); X.translate(x, y + (1 - bk(a)) * 60); X.globalAlpha = clamp(a * 2); X.strokeStyle = C.acc; X.lineWidth = 14 * s; X.lineCap = 'round'; X.lineJoin = 'round';
  X.shadowColor = C.acc; X.shadowBlur = 30; X.beginPath(); X.moveTo(0, 90 * s); X.lineTo(0, -90 * s); X.moveTo(-60 * s, -30 * s); X.lineTo(0, -90 * s); X.lineTo(60 * s, -30 * s); X.stroke(); X.restore();
}
const A = (t, t0, d = .32) => seg(t, t0, t0 + d);          // arrival
const E = (t, t1, d = .14) => seg(t, t1 - d, t1);           // exit (ends at t1)

// ———— screens ————
const S = [];
const scr = (a, b, f) => S.push({ a, b, f });
// 1 · GTA 6, just out
scr(0, 2.45, t => {
  label('USCITO DA POCHE ORE', 640, A(t, T.uscito), E(t, 2.45));
  sweep('GTA 6', W / 2, 860, 300, F.big, 600, C.t1, A(t, .05, .55), E(t, 2.45));
});
// 2 · and I play it free
scr(2.45, 4.45, t => {
  line('e io ci gioco', W / 2, 720, 84, F.ui, 500, C.t2, A(t, T.ioGioco - .05), E(t, 4.45));
  sweep('GRATIS.', W / 2, 900, 230, F.big, 600, C.acc, A(t, T.gratis - .08, .3), E(t, 4.45), 50);
});
// 3 · let me explain
scr(4.45, 5.65, t => line('Ti spiego come.', W / 2, 860, 96, F.ui, 700, C.t1, A(t, T.spiego - .05), E(t, 5.65)));
// 4 · step 01: open an account
scr(5.65, 7.15, t => {
  label('01 · APRI UN CONTO', 470, A(t, 5.65), E(t, 7.15));
  if (card(170, 560, 740, 600, A(t, 5.7), E(t, 7.15))) {
    font(64, F.ui, 700); X.fillStyle = C.t1; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('Buddy', 60, 90);
    font(30, F.mono, 500); X.fillStyle = C.t3; X.fillText('NUOVO CONTO', 60, 150);
    rr(60, 220, 620, 110, 24); X.fillStyle = C.s2; X.fill(); font(40, F.ui, 500); X.fillStyle = C.t2; X.fillText('Apertura conto', 100, 275);
    const on = A(t, T.buddy - .1, .2); rr(530, 245, 110, 60, 30); X.fillStyle = on > .5 ? C.acc : C.s3; X.fill(); X.beginPath(); X.arc(lerp(560, 610, eo(on)), 275, 24, 0, TAU); X.fillStyle = on > .5 ? C.bg : C.t2; X.fill();
    const ok = A(t, T.buddy + .15, .25); if (ok > 0) { X.globalAlpha *= clamp(ok * 2); rr(60, 400, 620, 120, 24); X.fillStyle = 'rgba(183,243,74,.1)'; X.fill(); check(130, 460, 34, ok); font(46, F.ui, 700); X.fillStyle = C.acc; X.fillText('Conto aperto', 190, 462); }
    endCard();
  }
});
// 5 · step 02: a friend's code
scr(7.15, 8.75, t => {
  label('02 · METTI IL CODICE DI UN AMICO', 470, A(t, 7.15), E(t, 8.75));
  if (card(170, 560, 740, 600, A(t, 7.2), E(t, 8.75))) {
    font(30, F.mono, 500); X.fillStyle = C.t3; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', 60, 90);
    rr(60, 140, 620, 130, 24); X.fillStyle = C.s2; X.fill(); X.lineWidth = 2; X.strokeStyle = C.line; X.stroke();
    const n = Math.floor(clamp((t - 7.4) / .07, 0, 10)); for (let i = 0; i < n; i++) { X.beginPath(); X.arc(110 + i * 54, 205, 14, 0, TAU); X.fillStyle = C.t1; X.fill(); }
    if (n < 10 && Math.floor(t * 4) % 2) { X.fillStyle = C.acc; X.fillRect(98 + n * 54, 175, 4, 60); }
    const ok = A(t, T.amico + .05, .25); if (ok > 0) { X.globalAlpha *= clamp(ok * 2); check(100, 360, 34, ok); font(46, F.ui, 700); X.fillStyle = C.acc; X.fillText('Codice valido', 160, 362); }
    endCard();
  }
});
// 6 · step 03: +80 €
scr(8.75, 11.05, t => {
  label('03 · RICEVI IL BONUS', 470, A(t, 8.75), E(t, 11.05));
  if (card(140, 560, 800, 170, A(t, T.arrivati), E(t, 11.05), A(t, T.ottanta, .3))) {
    rr(40, 45, 80, 80, 20); X.fillStyle = C.acc; X.fill(); font(48, F.ui, 700); X.fillStyle = C.bg; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('€', 80, 88);
    X.textAlign = 'left'; font(40, F.ui, 700); X.fillStyle = C.t1; X.fillText('Bonus di benvenuto', 150, 70); font(32, F.ui, 500); X.fillStyle = C.t2; X.fillText('accreditato ora', 150, 118);
    endCard();
  }
  sweep('+80 €', W / 2, 1000, 260, F.big, 600, C.acc, A(t, T.ottanta - .05, .3), E(t, 11.05), 60);
});
// 7 · step 04: GTA 6 costs 79,99
scr(11.05, 13.85, t => {
  label('04 · COMPRA GTA 6', 470, A(t, 11.05), E(t, 13.85));
  if (card(140, 600, 800, 200, A(t, T.gtaCosta), E(t, 13.85))) {
    font(64, F.ui, 700); X.fillStyle = C.t1; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('GTA 6', 60, 100);
    const p = A(t, T.prezzo - .05, .3); X.globalAlpha *= clamp(p * 2); X.textAlign = 'right'; font(72, F.big, 600); X.fillStyle = C.t1; X.fillText('79,99 €', 740, 102);
    endCard();
  }
});
// 8 · 80,00 − 79,99 = 0,01
scr(13.85, 16.05, t => {
  const e = E(t, 16.05);
  line('80,00 €', W / 2 + 200, 560, 84, F.big, 600, C.t2, A(t, 13.85, .25), e, 'right');
  line('− 79,99 €', W / 2 + 200, 670, 84, F.big, 600, C.t2, A(t, 13.95, .25), e, 'right');
  const r = A(t, 14.1, .3); if (r > 0) { X.globalAlpha = 1 - e; X.fillStyle = C.t3; X.fillRect(W / 2 - 300, 740, 600 * eo(r), 3); X.globalAlpha = 1; }
  sweep('0,01 €', W / 2, 920, 240, F.big, 600, C.acc, A(t, T.avanza - .05, .35), e, 60);
  label('MI AVANZA PURE UN CENTESIMO', 1100, A(t, T.centesimo - .3), e);
});
// 9 · your turn
scr(16.05, 17.3, t => line('Ora tocca a te.', W / 2, 860, 104, F.ui, 700, C.t1, A(t, T.tocca - .05), E(t, 17.3)));
// 10-15 · the code card (big, then docked at the top until the end)
function codeCard(t) {
  if (t < 17.3) return;
  const dock = eo(seg(t, 19.75, 20.15)), a = A(t, 17.3, .3);
  const y = lerp(820, 330, dock), s = lerp(1, .72, dock);
  X.save(); X.translate(W / 2, y); X.scale(s, s);
  if (card(-480, -150, 960, 300, a, 0, .4 + .6 * seg(t, 19.0, 19.4))) {
    font(30, F.mono, 500); X.fillStyle = C.t2; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('CODICE AMICO', 480, 70);
    font(88, F.mono, 700); X.fillStyle = C.acc; X.shadowColor = C.acc; X.shadowBlur = 20;
    const cw = 62, x0 = 480 - (CODE.length - 1) * cw / 2;
    for (let i = 0; i < CODE.length; i++) { const lt = t - (17.55 + i * .1); if (lt < 0) continue; X.globalAlpha = clamp(lt / .1); X.fillText(CODE[i], x0 + i * cw, 182 - (1 - eo(clamp(lt / .15))) * 20); }
    endCard();
  }
  X.restore();
  if (t < 19.75) label('REGISTRATI CON QUESTO CODICE', 1090, A(t, T.registrati + .3), E(t, 19.75));
}
// 11 · you get 80 € → GTA practically free
scr(19.85, 23.4, t => {
  const e = E(t, 23.4), up = eo(seg(t, T.eGta - .1, T.eGta + .25));
  X.save(); X.translate(0, -up * 200); X.globalAlpha = 1;
  line('ricevi', W / 2, 700, 64, F.ui, 500, C.t2, A(t, T.ricevi), e);
  sweep('+80 €', W / 2, 880, 230, F.big, 600, C.acc, A(t, T.ottanta2 - .05, .3), e, 60);
  X.restore();
  if (card(140, 950, 800, 200, A(t, T.eGta), e)) {
    font(64, F.ui, 700); X.fillStyle = C.t1; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText('GTA 6', 60, 100);
    X.textAlign = 'right'; font(64, F.big, 600); X.fillStyle = C.t3; X.fillText('79,99 €', 740, 102);
    const s = A(t, T.praticamente, .25); X.fillStyle = C.t1; X.fillRect(740 - 250, 100, 250 * eo(s), 5);
    endCard();
  }
  line('praticamente gratis', W / 2, 1250, 72, F.ui, 700, C.t1, A(t, T.gratis2 - .1), e);
});
// 12 · and it's not over
scr(23.4, 24.45, t => line('E non è finita.', W / 2, 860, 104, F.ui, 700, C.t1, A(t, T.nonFinita - .05), E(t, 24.45)));
// 13-14 · +50 € for every friend you invite
function avatar(x, y, r, on, a) {
  if (a <= 0) return; const k = bk(a); X.save(); X.translate(x, y); X.scale(k, k);
  X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = on ? 'rgba(183,243,74,.14)' : C.s2; X.fill(); X.lineWidth = 3; X.strokeStyle = on ? C.acc : C.line; X.stroke();
  X.fillStyle = on ? C.acc : C.t3; X.beginPath(); X.arc(0, -r * .2, r * .26, 0, TAU); X.fill(); X.beginPath(); X.ellipse(0, r * .42, r * .44, r * .28, 0, Math.PI, 0); X.fill(); X.restore();
}
scr(24.45, 34.0, t => {
  const e1 = E(t, 29.85);
  line('Per ogni amico che inviti', W / 2, 640, 66, F.ui, 700, C.t1, A(t, T.ogniAmico), e1);
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3];
  const n = hits.filter(h => t >= h).length, total = n * 50;
  if (t < 29.85) {
    for (let i = 0; i < 4; i++) { const x = W / 2 - 330 + i * 220; avatar(x, 840, 80, t >= hits[i], A(t, i === 0 ? T.ogniAmico + .3 : hits[i] - .2, .25) * (1 - e1));
      const p = A(t, hits[i], .25); if (p > 0) line('+50 €', x, 975, 46, F.big, 600, C.acc, p, e1); }
    const tot = A(t, T.altri50 - .1, .3); if (tot > 0) {
      const bump = Math.max(...hits.map(h => t >= h ? Math.max(0, 1 - (t - h) / .3) : 0));
      X.save(); X.translate(W / 2, 1170); X.scale(1 + bump * .08, 1 + bump * .08); X.translate(-W / 2, -1170);
      sweep(`+${Math.max(total, 50)} €`, W / 2, 1170, 200, F.big, 600, C.acc, tot, e1, 50); X.restore();
    }
  }
  // close: conditions → link in bio
  line('Condizioni e info', W / 2, 760, 64, F.ui, 500, C.t2, A(t, T.condizioni), 0);
  sweep('Link in bio', W / 2, 920, 150, F.ui, 700, C.t1, A(t, T.linkBio - .05, .4), 0);
  arrowUp(W / 2, 1160, 1, A(t, T.bio - .2, .3));
});

function render(t) {
  X.setTransform(SC, 0, 0, SC, 0, 0); stage(t);
  for (const s of S) if (t >= s.a && t < s.b) { X.save(); s.f(t); X.restore(); }
  codeCard(t);
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(.05, 'boom'); ev(.1, 'sweep'); ev(T.uscito, 'tick'); ev(T.gratis - .08, 'sweep'); ev(T.gratis, 'boom');
for (const s of S.slice(1)) ev(s.a, 'swoosh');
ev(T.buddy - .1, 'toggle'); ev(T.buddy + .15, 'confirm');
for (let i = 0; i < 10; i++) ev(7.4 + i * .07, 'key'); ev(T.amico + .05, 'confirm');
ev(T.arrivati, 'notif'); ev(T.ottanta - .05, 'sweep'); ev(T.ottanta, 'cash');
ev(T.prezzo - .05, 'tick'); ev(14.1, 'tick'); ev(T.avanza, 'cash');
ev(17.3, 'swoosh'); for (let i = 0; i < CODE.length; i++) ev(17.55 + i * .1, 'key'); ev(19.0, 'confirm'); ev(19.75, 'swoosh');
ev(T.ottanta2, 'cash'); ev(T.praticamente, 'strike'); ev(T.gratis2, 'confirm');
for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) ev(h, 'coin');
ev(T.linkBio, 'sweep'); ev(T.bio, 'confirm');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { const s = SUBS.find(([a, b]) => t >= a && t < b); return s ? [{ id: 's' + s[0], text: s[2], x0: 100, y0: 500, x1: 980, y1: 1300, pass: true }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all(["500 40px 'Inter'", "700 40px 'Inter'", "600 40px 'Inter Tight'", "500 40px 'JB Mono'", "700 40px 'JB Mono'"].map(f => document.fonts.load(f))).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
