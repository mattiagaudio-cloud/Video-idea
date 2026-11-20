// V6 — 80s Cel Anime, vertical 1080×1920. Painted night city, flat cels with hard shadow + highlight and coloured outlines,
// backlit neon glowing through the frame, played back from videotape. Minimal text: only what the voice says, as neon in the world.
import { clamp, lerp, seg, eo, ei, back, hash, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const out = cv.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; const X = buf.getContext('2d');
const C = { sky0: '#0b0620', sky1: '#2a0f4a', sky2: '#a22a6b', haze: '#ff6a8a', bld: '#120a26', bld2: '#1d1238', win: '#ffd27a', win2: '#7af0ff',
  skin: '#f4c6a8', skinS: '#d48f86', skinH: '#ffe6d6', skinL: '#8a3f4a', hair: '#2a2f6e', hairS: '#1a1d4a', hairH: '#5f6fd8', hairL: '#120f30',
  jacket: '#d8304a', jacketS: '#8f1d3a', jacketH: '#ff6f7f', jacketL: '#4a0c22', shirt: '#f2efe6', eyeW: '#fffaf2', iris: '#3d7bff', irisD: '#1a2f8a',
  neonP: '#ff3fa6', neonC: '#3ff3ff', neonY: '#ffe14a', neonG: '#5cff8a' };
const st = (t, fps = 12) => Math.floor(t * fps) / fps;     // cels step at 12 fps
const A = (t, t0, d = .3) => seg(t, t0, t0 + d);
const font = (px, fam) => (X.font = `${px}px ${fam}`);

// ———— painted city (drawn once, then only slid) ————
const city = document.createElement('canvas'); city.width = 1600; city.height = 1920;
(function paintCity() {
  const g = city.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 1300); sky.addColorStop(0, C.sky0); sky.addColorStop(.55, C.sky1); sky.addColorStop(.85, C.sky2); sky.addColorStop(1, C.haze);
  g.fillStyle = sky; g.fillRect(0, 0, 1600, 1920);
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${.2 + hash(i) * .5})`; g.fillRect(hash(i + 1) * 1600, hash(i + 2) * 700, 2, 2); }
  for (const [layer, col, h0, h1, wp] of [[0, '#2a1446', 500, 800, .25], [1, C.bld2, 650, 1050, .35], [2, C.bld, 800, 1300, .45]]) {
    let x = -20; let k = layer * 50;
    while (x < 1620) { const w = 90 + hash(k) * 140, h = h0 + hash(k + 7) * (h1 - h0), y = 1500 - h; g.fillStyle = col; g.fillRect(x, y, w, h + 500);
      if (layer === 2 && hash(k + 3) > .6) { g.fillRect(x + w / 2 - 3, y - 80, 6, 80); g.fillStyle = '#ff3b5c'; g.fillRect(x + w / 2 - 5, y - 86, 10, 8); g.fillStyle = col; }
      for (let wy = y + 20; wy < 1500; wy += 26) for (let wx = x + 10; wx < x + w - 14; wx += 20) if (hash(wx * .7 + wy * 1.3 + k) < wp) { g.fillStyle = hash(wx + wy) > .8 ? C.win2 : C.win; g.globalAlpha = .55 + hash(wx * wy) * .45; g.fillRect(wx, wy, 9, 13); g.globalAlpha = 1; }
      x += w + 6; k++; } }
  const hz = g.createLinearGradient(0, 1250, 0, 1500); hz.addColorStop(0, 'rgba(255,106,138,0)'); hz.addColorStop(1, 'rgba(255,106,138,.35)'); g.fillStyle = hz; g.fillRect(0, 1250, 1600, 250);
  g.fillStyle = '#0a0616'; g.fillRect(0, 1500, 1600, 420);                                              // wet street / rooftop
  for (let i = 0; i < 60; i++) { g.fillStyle = hash(i) > .5 ? 'rgba(255,210,122,.25)' : 'rgba(122,240,255,.2)'; g.fillRect(hash(i + 5) * 1600, 1520 + hash(i + 9) * 380, 6, 30 + hash(i) * 90); }   // reflections
})();

// ———— cel helpers: fill, hard shadow, hard highlight, coloured outline ————
function cel(pathFn, fill, shade, hi, line, sh = [-.12, -.08], hh = [.07, .06], lw = 5, size = 100) {
  pathFn(); X.fillStyle = fill; X.fill();
  if (shade) { X.save(); pathFn(); X.clip(); X.translate(-sh[0] * size, -sh[1] * size); X.beginPath(); X.rect(-5000, -5000, 1e4, 1e4); pathFn(); X.fillStyle = shade; X.fill('evenodd'); X.restore(); }
  if (hi) { X.save(); pathFn(); X.clip(); X.translate(hh[0] * size, hh[1] * size); X.beginPath(); X.rect(-5000, -5000, 1e4, 1e4); pathFn(); X.restore(); X.save(); pathFn(); X.clip(); X.beginPath(); X.rect(-5000, -5000, 1e4, 1e4); X.translate(-hh[0] * size * 3, -hh[1] * size * 3); pathFn(); X.restore(); }
  pathFn(); X.lineWidth = lw; X.strokeStyle = line; X.lineJoin = 'round'; X.stroke();
}
const P = pts => () => { X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.closePath(); };
const E = (x, y, rx, ry, r = 0) => () => { X.beginPath(); X.ellipse(x, y, rx, ry, r, 0, TAU); };
function glow(fn, col, blur = 40, passes = 2) {   // backlit: drawn additively with halation
  X.save(); X.globalCompositeOperation = 'lighter'; X.shadowColor = col; for (let i = 0; i < passes; i++) { X.shadowBlur = blur * (i + 1); fn(); } X.shadowBlur = 0; fn(); X.restore();
}
function neonText(txt, x, y, px, col, a = 1, fam = "'Archivo Black'", flick = 0) {
  if (a <= 0) return; X.save(); X.globalAlpha = clamp(a) * (flick ? (hash(Math.floor(flick * 30)) > .3 ? 1 : .35) : 1); font(px, fam); X.textAlign = 'center'; X.textBaseline = 'middle';
  X.lineWidth = px * .08; X.strokeStyle = col; X.strokeText(txt, x, y);
  glow(() => { X.fillStyle = '#ffffff'; X.fillText(txt, x, y); X.strokeStyle = col; X.lineWidth = px * .05; X.strokeText(txt, x, y); }, col, 26, 2);
  X.restore();
}
function flare(x, y, s, col = C.neonC) { glow(() => { X.fillStyle = col; X.beginPath(); X.ellipse(x, y, 260 * s, 6 * s, 0, 0, TAU); X.fill(); X.beginPath(); X.arc(x, y, 18 * s, 0, TAU); X.fill(); }, col, 30, 2); }
function speedLines(t, cx, cy, col = 'rgba(255,255,255,.22)') { X.save(); X.strokeStyle = col; for (let i = 0; i < 60; i++) { const a = hash(i) * TAU, r0 = 300 + hash(i + 3) * 200 + (st(t) * 900 % 200); X.lineWidth = 2 + hash(i + 1) * 6; X.beginPath(); X.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); X.lineTo(cx + Math.cos(a) * 1600, cy + Math.sin(a) * 1600); X.stroke(); } X.restore(); }

// ———— the hero, close-up bust (3/4 front) ————
function bust(x, y, s, t, o = {}) {
  const tq = st(t); X.save(); X.translate(x, y); X.scale(s, s);
  const L = 5 / s;
  // jacket + shirt
  cel(P([[-260, 420], [-230, 180], [-90, 120], [90, 120], [230, 180], [270, 420]]), C.jacket, C.jacketS, null, C.jacketL, [-.15, -.05], 0, L, 300);
  cel(P([[-70, 125], [0, 260], [70, 125]]), C.shirt, '#cfc7b8', null, '#8a7c6a', [-.1, 0], 0, L, 100);
  // neck
  cel(P([[-48, 40], [48, 40], [55, 135], [0, 165], [-55, 135]]), C.skin, C.skinS, null, C.skinL, [-.25, -.4], 0, L, 100);
  // face: long egg, soft-point chin
  const face = P([[-120, -180], [-128, -60], [-110, 30], [-60, 100], [0, 128], [55, 98], [100, 30], [118, -60], [112, -180]]);
  cel(face, C.skin, C.skinS, null, C.skinL, [-.18, 0], 0, L, 160);
  // eyes: almond, near the vertical middle, thick upper lash flicking out, tall oval iris with two highlights
  const blink = o.happy ? 1 : (Math.floor(tq * 12) % 41 < 2 ? 1 : 0), wide = o.wide || 0;
  for (const sd of [-1, 1]) { const ex = sd * 56, ey = -42, ew = sd < 0 ? 46 : 40;
    if (blink) { X.strokeStyle = C.skinL; X.lineWidth = 7 / s; X.lineCap = 'round'; X.beginPath(); if (o.happy) { X.moveTo(ex - ew, ey + 6); X.quadraticCurveTo(ex, ey - 24, ex + ew, ey + 6); } else { X.moveTo(ex - ew, ey); X.lineTo(ex + ew, ey); } X.stroke(); continue; }
    const eh = 24 + wide * 10;
    cel(P([[ex - ew, ey + 4], [ex - ew * .4, ey - eh], [ex + ew * .6, ey - eh * .9], [ex + ew, ey], [ex + ew * .3, ey + eh * .6], [ex - ew * .5, ey + eh * .55]]), C.eyeW, null, null, C.skinL, 0, 0, 3 / s);
    X.save(); X.beginPath(); X.moveTo(ex - ew, ey + 4); X.lineTo(ex - ew * .4, ey - eh); X.lineTo(ex + ew * .6, ey - eh * .9); X.lineTo(ex + ew, ey); X.lineTo(ex + ew * .3, ey + eh * .6); X.lineTo(ex - ew * .5, ey + eh * .55); X.closePath(); X.clip();
    const ix = ex + (o.look || 0) * 10; X.fillStyle = C.irisD; X.beginPath(); X.ellipse(ix, ey - 2, 17, 27 + wide * 4, 0, 0, TAU); X.fill(); X.fillStyle = C.iris; X.beginPath(); X.ellipse(ix, ey + 6, 13, 16, 0, 0, TAU); X.fill();
    if (o.reflect) { X.fillStyle = C.neonP; X.fillRect(ix - 10, ey - 6, 20, 5); X.fillStyle = C.neonY; X.fillRect(ix - 8, ey + 2, 16, 3); }
    X.fillStyle = '#ffffff'; X.beginPath(); X.ellipse(ix - 6, ey - 12, 6, 8, 0, 0, TAU); X.fill(); X.beginPath(); X.arc(ix + 7, ey + 10, 3, 0, TAU); X.fill(); X.restore();
    X.strokeStyle = '#1a0f22'; X.lineWidth = 9 / s; X.lineCap = 'round'; X.beginPath(); X.moveTo(ex - ew * 1.05, ey + 2); X.quadraticCurveTo(ex - ew * .2, ey - eh * 1.25, ex + ew * 1.15, ey - 4); X.lineTo(ex + ew * 1.35, ey - 12); X.stroke();
    X.lineWidth = 6 / s; X.strokeStyle = C.hairS; X.beginPath(); X.moveTo(ex - ew * .9, ey - eh - 26 - (o.brow || 0) * 14); X.quadraticCurveTo(ex, ey - eh - 40 - (o.brow || 0) * 18, ex + ew * 1.1, ey - eh - 26); X.stroke(); }
  // nose + mouth (flaps on the voice, stepped)
  X.strokeStyle = C.skinL; X.lineWidth = 4 / s; X.beginPath(); X.moveTo(6, 0); X.lineTo(14, 26); X.lineTo(2, 30); X.stroke();
  const m = Math.round(clamp(o.mouth || 0) * 3) / 3;
  if (m > .1) cel(E(4, 70, 20 + (o.smile || 0) * 8, 4 + m * 13), '#7a1f36', null, null, C.skinL, 0, 0, 3 / s);
  else { X.lineWidth = 5 / s; X.beginPath(); X.moveTo(-26, 66 - (o.smile || 0) * 6); X.quadraticCurveTo(4, 72 + (o.smile || 0) * 10, 34, 64 - (o.smile || 0) * 8); X.stroke(); }
  if (o.glint) { glow(() => { X.fillStyle = '#ffffff'; X.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? 6 : 34; X.lineTo(40 + Math.cos(a) * r, 64 + Math.sin(a) * r); } X.closePath(); X.fill(); }, '#ffffff', 20, 1); }
  // hair: big 80s volume, spikes, one highlight band
  const hairPts = [[-150, 0], [-200, -120], [-185, -240], [-120, -320], [0, -350], [120, -320], [195, -230], [205, -110], [160, 0], [135, -70], [118, -150], [80, -105], [55, -175], [10, -115], [-30, -185], [-65, -110], [-105, -170], [-125, -80]];
  cel(P(hairPts), C.hair, C.hairS, null, C.hairL, [-.2, .1], 0, L, 200);
  X.save(); P(hairPts)(); X.clip(); X.strokeStyle = C.hairH; X.lineWidth = 16 / s; X.beginPath(); X.arc(0, -40, 250, -2.3, -1.2); X.stroke(); X.restore();
  // rim light from the city (backlit cel)
  X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = 'rgba(122,240,255,.55)'; X.lineWidth = 8 / s; X.beginPath(); X.moveTo(175, -140); X.lineTo(150, -40); X.lineTo(118, 0); X.stroke(); X.restore();
  if (o.point) { // a hand pointing at the viewer, foreshortened
    const k = o.point; X.save(); X.translate(180 * k, 260 - 60 * k); X.scale(.6 + .8 * k, .6 + .8 * k);
    cel(P([[-70, 20], [-40, -60], [60, -60], [80, 10], [30, 60], [-40, 60]]), C.skin, C.skinS, null, C.skinL, [-.2, 0], 0, L, 100);
    cel(E(-20, -100, 22, 55), C.skin, C.skinS, null, C.skinL, [-.2, 0], 0, L, 50); X.restore(); }
  X.restore();
}
// a full figure backlit against the city: a dark cel silhouette with a coloured rim
function silhouette(x, y, s, kind, t, rim = C.neonC, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s); const tq = st(t); const bob = o.jump ? -Math.abs(Math.sin(tq * 6)) * 30 : 0; X.translate(0, bob);
  const body = () => { X.beginPath();
    X.moveTo(-45, 0); X.lineTo(-38, -180); X.lineTo(-80, -360); X.lineTo(-60, -460); X.lineTo(60, -460); X.lineTo(80, -360); X.lineTo(38, -180); X.lineTo(45, 0); X.lineTo(15, 0); X.lineTo(0, -170); X.lineTo(-15, 0); X.closePath();
    X.moveTo(70, -520); X.ellipse(0, -530, 62, 72, 0, 0, TAU);
    if (kind === 'spiky') { X.moveTo(-70, -560); X.lineTo(-110, -640); X.lineTo(-40, -600); X.lineTo(0, -680); X.lineTo(40, -600); X.lineTo(110, -640); X.lineTo(70, -560); X.closePath(); }
    if (kind === 'long') { X.moveTo(-70, -560); X.lineTo(-90, -400); X.lineTo(-60, -430); X.lineTo(60, -430); X.lineTo(90, -400); X.lineTo(70, -560); X.closePath(); }
    if (kind === 'cap') { X.moveTo(-70, -570); X.lineTo(120, -575); X.lineTo(70, -600); X.lineTo(-60, -610); X.closePath(); }
    if (kind === 'bun') { X.moveTo(40, -610); X.arc(0, -615, 40, 0, TAU); }
    const ar = o.armUp ? -1 : 1; X.moveTo(-80, -360); X.lineTo(-120, -360 + 170 * ar); X.lineTo(-95, -360 + 175 * ar); X.lineTo(-62, -330); X.moveTo(80, -360); X.lineTo(120, -360 + 170 * ar); X.lineTo(95, -360 + 175 * ar); X.lineTo(62, -330); };
  X.fillStyle = '#0a0616'; body(); X.fill('nonzero');
  X.save(); X.globalCompositeOperation = 'lighter'; X.strokeStyle = rim; X.lineWidth = 5 / s; X.shadowColor = rim; X.shadowBlur = 18; X.save(); X.translate(4, -2); body(); X.restore(); body(); X.stroke(); X.restore();
  X.restore();
}

// ———— scenes ————
function bgCity(t, pan = 0, dim = 0) { X.fillStyle = '#05020c'; X.fillRect(0, 0, W, H); const p = pan % 1040, off = p < 520 ? p : 1040 - p; X.drawImage(city, -off, 0); if (dim) { X.fillStyle = `rgba(5,2,15,${dim})`; X.fillRect(0, 0, W, H); } }
function sHook(t) {   // 0 → 4.45
  if (t < 1.25) {     // extreme close-up: the eyes, "GTA 6" reflected in the irises, speed lines
    bgCity(t, t * 60, .5); speedLines(t, 540, 860, 'rgba(255,63,166,.25)');
    bust(540, 1150, 2.6 - t * .25, t, { reflect: true, wide: 1, mouth: mouthAt(t) });
    neonText('GTA 6', 540, 330, 190, C.neonP, A(t, .05, .15)); flare(540, 330, 1.2, C.neonP);
  } else {            // wide: in front of the window, the TV-like glow of the city; "GRATIS" lights up in neon outside
    bgCity(t, 120 + t * 20);
    neonText('GTA 6', 540, 360, 170, C.neonP, 1);
    neonText('GRATIS', 540, 640, 200, C.neonG, A(t, T.gratis - .05, .1), "'Archivo Black'", t < T.gratis + .4 ? t : 0);
    if (t > T.gratis) flare(540, 640, 1.3, C.neonG);
    bust(540, 1330, 1.25, t, { mouth: mouthAt(t), smile: A(t, T.gratis, .2), glint: t > T.gratis + .1 && t < T.gratis + .5, look: -.3 });
  }
}
function sPhone(t) {  // 4.45 → 8.75: hand, phone, code, checks
  bgCity(t, 300 + t * 25, .45);
  // bokeh
  X.save(); X.globalCompositeOperation = 'lighter'; for (let i = 0; i < 18; i++) { X.fillStyle = `rgba(${hash(i) > .5 ? '255,63,166' : '63,243,255'},.12)`; X.beginPath(); X.arc((hash(i + 2) * 1300 - t * 40) % 1300, hash(i + 4) * 1500, 40 + hash(i) * 70, 0, TAU); X.fill(); } X.restore();
  X.save(); X.translate(560, 900); X.rotate(-.08);
  cel(() => { X.beginPath(); X.roundRect(-230, -420, 460, 840, 50); }, '#1c1a2a', '#0e0d18', null, '#3a3560', [-.05, 0], 0, 6, 300);
  X.save(); X.beginPath(); X.roundRect(-200, -370, 400, 740, 26); X.clip(); X.fillStyle = '#0d0b1d'; X.fillRect(-210, -380, 420, 760);
  const ok1 = t > T.buddy + .1, ok2 = t > T.amico;
  if (t < 7.15) { if (!ok1) { glow(() => { X.fillStyle = C.neonY; X.beginPath(); X.roundRect(-90, -100, 180, 180, 40); X.fill(); }, C.neonY, 20, 1); font(120, "'Archivo Black'"); X.fillStyle = '#1a0f22'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('B', 0, -6); }
    else { glow(() => { X.strokeStyle = C.neonG; X.lineWidth = 26; X.lineCap = 'round'; X.beginPath(); X.moveTo(-80, 0); X.lineTo(-20, 60); X.lineTo(90, -70); X.stroke(); }, C.neonG, 30, 2); } }
  else { X.strokeStyle = C.neonC; X.lineWidth = 6; X.strokeRect(-160, -140, 320, 90); const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)); for (let i = 0; i < n; i++) glow(() => { X.fillStyle = C.neonC; X.beginPath(); X.arc(-110 + i * 44, -95, 13, 0, TAU); X.fill(); }, C.neonC, 12, 1);
    if (ok2) glow(() => { X.strokeStyle = C.neonG; X.lineWidth = 26; X.lineCap = 'round'; X.beginPath(); X.moveTo(-80, 110); X.lineTo(-20, 170); X.lineTo(90, 40); X.stroke(); }, C.neonG, 30, 2); }
  X.restore();
  // the hand holding it + a thumb that taps (cels, stepped)
  const tap = (t > 5.9 && t < 6.6) || (t > 7.3 && t < 8.0) ? (Math.floor(st(t) * 12) % 3 === 0 ? 1 : 0) : 0;
  cel(P([[-260, 300], [-220, 160], [-140, 200], [-150, 440], [-280, 470]]), C.skin, C.skinS, null, C.skinL, [-.1, 0], 0, 5, 200);
  cel(E(150, 300 - tap * 40, 48, 90, -.5), C.skin, C.skinS, null, C.skinL, [-.15, 0], 0, 5, 100);
  X.restore();
  // his face in the corner, talking
  bust(250, 1560, .7, t, { mouth: mouthAt(t), look: .5 });
}
function sMoney(t) {  // 8.75 → 11.05: +80 € blazes on the screen; his eyes go wide
  bgCity(t, 420 + t * 20, .3); speedLines(t, 540, 520, 'rgba(255,225,74,.2)');
  const a = A(t, T.ottanta - .1, .15);
  neonText('+80 €', 540, 480, 240, C.neonY, a); if (a > 0) flare(540, 480, 1.6, C.neonY);
  for (let i = 0; i < 14; i++) { const u = seg(t, T.ottanta + hash(i) * .4, T.ottanta + .9 + hash(i) * .4); if (u <= 0) continue; const x = 540 + (hash(i + 3) - .5) * 900 * u, y = 520 + (hash(i + 5) - .3) * 500 * u + u * u * 600;
    glow(() => { X.fillStyle = C.neonY; X.beginPath(); X.ellipse(x, y, 26 * Math.abs(Math.cos(t * 8 + i)) + 4, 26, 0, 0, TAU); X.fill(); }, C.neonY, 14, 1); }
  bust(540, 1360, 1.2, t, { mouth: mouthAt(t), wide: A(t, T.ottanta, .2), brow: A(t, T.ottanta, .2), smile: A(t, T.ottanta + .3, .3) });
}
function sPay(t) {    // 11.05 → 16.05: the game in a shop window at 79,99 €; he pays; one cent spins back; he laughs
  bgCity(t, 600 + t * 15, .35);
  // shop window
  X.save(); X.translate(540, 600);
  cel(() => { X.beginPath(); X.rect(-380, -330, 760, 620); }, '#140b28', null, null, '#3a3560', 0, 0, 8);
  glow(() => { X.strokeStyle = C.neonC; X.lineWidth = 8; X.strokeRect(-360, -310, 720, 580); }, C.neonC, 20, 1);
  cel(() => { X.beginPath(); X.rect(-150, -250, 300, 400); }, '#5a1b7a', '#3a0f55', null, '#ff3fa6', [-.1, 0], 0, 6, 300);
  X.fillStyle = C.neonY; X.beginPath(); X.arc(0, 60, 90, Math.PI, 0); X.fill(); X.fillStyle = '#1a0f22'; for (let i = 0; i < 5; i++) X.fillRect(-140 + i * 60, 20 - (i % 2) * 40, 34, 130);
  neonText('GTA 6', 0, -170, 92, C.neonP, 1);
  X.restore();
  neonText('79,99 €', 540, 1000, 130, C.neonC, A(t, T.prezzo - .05, .15), "'Archivo Black'", t < T.prezzo + .4 ? t : 0);
  const sold = A(t, 13.3, .2); if (sold > 0) { X.save(); X.translate(560, 990); X.rotate(-.12); X.scale(back(sold), back(sold)); X.strokeStyle = C.neonG; X.lineWidth = 16; X.strokeRect(-260, -90, 520, 180); X.restore(); }
  // the cent: spins up and lands in his palm
  const cu = seg(t, T.avanza - .3, T.avanza + .5);
  if (cu > 0) { const x = 760, y = lerp(1100, 1330, cu) - Math.sin(cu * Math.PI) * 300; glow(() => { X.fillStyle = '#ffb15a'; X.beginPath(); X.ellipse(x, y, 34 * Math.abs(Math.cos(t * 14)) + 4, 34, 0, 0, TAU); X.fill(); }, '#ffb15a', 16, 1);
    if (cu >= 1) neonText('0,01 €', 760, 1240, 70, '#ffb15a', A(t, T.centesimo, .2)); }
  bust(380, 1520, 1.0, t, { mouth: mouthAt(t), happy: t > T.risata && t < T.risata + 1.6, smile: t > T.risata ? 1 : 0, look: .6 });
}
function sTurn(t) {   // 16.05 → 23.4: the turn to camera, speed lines; the code in neon; +80 €; GRATIS
  const drama = t < 17.3;
  bgCity(t, 800 + t * 10, drama ? .55 : .35);
  if (drama) { speedLines(t, 540, 1100, 'rgba(63,243,255,.28)'); bust(540, 1250, lerp(1.4, 2.0, eo(A(t, T.tocca, .5))), t, { mouth: mouthAt(t), smile: .6, brow: .6, glint: t > T.tocca + .5 && t < T.tocca + .9 }); return; }
  bust(540, 1520, 1.0, t, { mouth: mouthAt(t), smile: .5, look: 0 });
  if (t < 19.75) { neonText('CODICE AMICO', 540, 470, 56, C.neonP, A(t, 17.3, .2)); font(96, "'JB Mono'");
    const cw = 66, x0 = 540 - (CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) { const lt = t - (17.5 + i * .1); if (lt < 0) continue; neonText(CODE[i], x0 + i * cw, 620, 96, C.neonC, 1, "'JB Mono'", lt < .15 ? t : 0); } }
  else { neonText('+80 €', 540, 560, 200, C.neonY, A(t, T.ottanta2 - .05, .15));
    if (t > T.eGta) { neonText('GTA 6', 540, 820, 110, C.neonP, A(t, T.eGta, .15)); neonText('GRATIS', 540, 980, 150, C.neonG, A(t, T.gratis2 - .05, .1), "'Archivo Black'", t < T.gratis2 + .4 ? t : 0); } }
}
function sFriends(t) { // 23.4 → 34: friends appear as silhouettes on the rooftop, +50 € each; then link in bio
  bgCity(t, 1000 + t * 8);
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], xs = [190, 360, 720, 890], kinds = ['long', 'cap', 'spiky', 'bun'], rims = [C.neonP, C.neonY, C.neonG, C.neonP];
  const end = t > T.linkBio;
  silhouette(540, 1500, .95, 'spiky', t, C.neonC, { armUp: end });
  hits.forEach((h, i) => { const a = A(t, h - .25, .2); if (a <= 0) return; X.save(); X.globalAlpha = Math.floor(a * 6) / 6; silhouette(xs[i], 1500, .8, kinds[i], t, rims[i], { armUp: end, jump: end }); X.restore();
    if (t < h + 1.4 && !end) neonText('+50 €', xs[i], 880 - eo(A(t, h, .3)) * 40, 80, C.neonY, A(t, h, .12)); });
  if (end) { neonText('LINK IN BIO', 540, 640, 120, C.neonC, A(t, T.linkBio - .05, .12), "'Archivo Black'", t < T.linkBio + .4 ? t : 0);
    const k = A(t, T.bio - .2, .2); if (k > 0) glow(() => { X.fillStyle = C.neonC; X.save(); X.translate(540, 470 + Math.sin(st(t) * 8) * 14); X.beginPath(); X.moveTo(0, -80); X.lineTo(70, 0); X.lineTo(25, 0); X.lineTo(25, 70); X.lineTo(-25, 70); X.lineTo(-25, 0); X.lineTo(-70, 0); X.closePath(); X.fill(); X.restore(); }, C.neonC, 24, 1); }
}
function codeStrip(t) { if (t < 19.75) return; X.save(); X.fillStyle = 'rgba(10,6,22,.6)'; X.fillRect(60, 200, 960, 120); X.restore(); neonText(CODE, 540, 262, 74, C.neonC, A(t, 19.75, .2), "'JB Mono'"); }

// ———— videotape playback: chroma bleed, scanlines, grille, phosphor, dark corners, faint noise ————
const vign = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = r; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2); return c; })();
function tape(t) {
  const s = cv.width / W; out.setTransform(s, 0, 0, s, 0, 0);
  out.drawImage(buf, 0, 0);
  out.save(); out.globalCompositeOperation = 'lighter'; out.globalAlpha = .18; out.drawImage(buf, 5, 0); out.restore();   // chroma bleed
  out.save(); out.globalCompositeOperation = 'screen'; out.globalAlpha = .1; out.drawImage(buf, -3, 1); out.restore();
  out.drawImage(vign, 0, 0);
  const ny = (hash(Math.floor(t * 30)) * H); out.fillStyle = 'rgba(255,255,255,.04)'; out.fillRect(0, ny, W, 6);
}

const SCN = [[0, 4.45, sHook], [4.45, 8.75, sPhone], [8.75, 11.05, sMoney], [11.05, 16.05, sPay], [16.05, 23.4, sTurn], [23.4, 99, sFriends]];
function render(t) {
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.fillStyle = '#05020c'; X.fillRect(0, 0, W, H);
  SCN.find(([a, b]) => t >= a && t < b)[2](t);
  codeStrip(t);
  for (const [a] of [...SCN, [1.25]]) { const k = seg(t, a, a + .08); if (k > 0 && k < 1) { X.fillStyle = `rgba(255,255,255,${.55 * (1 - k)})`; X.fillRect(0, 0, W, H); } }
  if (t < .08) { X.fillStyle = `rgba(255,255,255,${.55 * (1 - t / .08)})`; X.fillRect(0, 0, W, H); }
  tape(t);
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'hit'); ev(.05, 'neon'); ev(1.25, 'swish'); ev(T.gratis - .05, 'neon'); ev(T.gratis + .1, 'shine');
ev(4.45, 'swish'); ev(6.25, 'tap'); ev(T.buddy + .1, 'ok'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'tap', { v: .5 }); ev(T.amico, 'ok');
ev(8.75, 'swish'); ev(T.ottanta - .1, 'neon'); ev(T.ottanta, 'hit');
ev(11.05, 'swish'); ev(T.prezzo - .05, 'neon'); ev(13.3, 'ok'); ev(T.avanza - .3, 'ting'); ev(T.avanza + .2, 'ting', { v: .6 });
ev(16.05, 'hit'); ev(17.3, 'neon'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'buzz', { v: .5 }); ev(19.75, 'swish'); ev(T.ottanta2 - .05, 'neon'); ev(T.gratis2 - .05, 'neon'); ev(T.gratis2, 'shine');
ev(23.4, 'swish'); for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .25, 'swish', { v: .6 }); ev(h, 'coin'); }
ev(T.linkBio - .05, 'neon'); ev(T.bio, 'shine');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 19.75 ? [{ id: 'code', text: CODE, x0: 60, y0: 200, x1: 1020, y1: 320 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("40px 'Archivo Black'"), document.fonts.load("40px 'JB Mono'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
