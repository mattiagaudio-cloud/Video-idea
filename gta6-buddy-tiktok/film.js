// GTA 6 gratis — Microgame Frenzy, vertical 1080×1920. Every frame is a pure function of t.
import { clamp, lerp, seg, ss, eo, ei, back, hash, mulberry, TAU } from '/core/lib.js';

const W = 1080, H = 1920;
const cv = document.getElementById('c');
cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W;
const main = cv.getContext('2d');
let X = main;                                   // current drawing context
const setCtx = c => { const p = X; X = c; return p; };

// game buffer (full frame, drawn by each medium)
const gbuf = document.createElement('canvas'); gbuf.width = W; gbuf.height = H;
const gctx = gbuf.getContext('2d');
const pix = document.createElement('canvas'); pix.width = 135; pix.height = 240;
const pctx = pix.getContext('2d');

// ———————————————————— timeline (seconds, fitted to the voice track) ————————————————————
export const DUR = 34.0;
const CODE = 'B2601M2FCQ7OBC';
// scenes: inside a game (full frame) between [a,b]; push-in over IN, shrink-out over OUT
const IN = .22, OUT = .30;
const GAMES = [
  { id: 'hook',   a: 0.00,  b: 4.62,  m: 'neon',    noIn: true, cmd: 'GIOCA!',      cmdT: 0.05 },
  { id: 'apri',   a: 5.55,  b: 7.12,  m: 'crayon',  cmd: 'APRI!',        cmdT: 5.62 },
  { id: 'codice', a: 7.12,  b: 8.75,  m: 'crt',     cmd: 'CODICE!',      cmdT: 7.18 },
  { id: 'incassa',a: 8.75,  b: 11.05, m: 'riso',    cmd: 'INCASSA!',     cmdT: 8.80 },
  { id: 'paga',   a: 11.05, b: 16.00, m: 'swiss',   cmd: 'PAGA!',        cmdT: 11.10 },
  { id: 'gratis', a: 21.30, b: 23.40, m: 'neon2',   cmd: null },
  { id: 'reels',  a: 23.40, b: 24.45, m: 'reels',   cmd: 'SPEED UP!',    cmdT: 23.42, fly: true },
  { id: 'inv1',   a: 24.45, b: 27.12, m: 'pixel',   cmd: 'INVITA!',      cmdT: 24.50, fly: true },
  { id: 'inv2',   a: 27.12, b: 27.97, m: 'woodcut', cmd: null },
  { id: 'inv3',   a: 27.97, b: 28.82, m: 'blueprint', cmd: null },
  { id: 'inv4',   a: 28.82, b: 29.82, m: 'riso2',   cmd: null },
];
// home-stage commands (no game)
const HOME_CMDS = [
  { cmd: 'TOCCA A TE!', t: 16.08, tag: 17.1 },
  { cmd: 'LINK IN BIO!', t: 31.30, tag: 99 },
];
// balance board keys: [t, value]
const BAL = [[0, 0], [9.95, 80], [14.05, 0.01], [20.5, 80], [26.35, 130], [27.45, 180], [28.35, 230], [29.15, 280]];
const BAL_LABEL = t => t < 16 ? 'IL MIO SALDO' : 'IL TUO SALDO';
// subtitles
const SUBS = [
  [0.00, 2.40, 'GTA 6 è uscito da poche ore…'],
  [2.45, 4.40, '…e io ci gioco GRATIS.'],
  [4.45, 7.10, 'Ti spiego come. Ho aperto un conto con Buddy,'],
  [7.15, 11.00, 'ho messo il codice di un amico… e mi sono arrivati 80 €!'],
  [11.05, 13.75, 'GTA costa 79,99 €.'],
  [13.85, 16.00, 'Mi avanza pure un centesimo.'],
  [16.05, 19.75, 'Ora tocca a te! Registrati con il codice amico che vedi sullo schermo:'],
  [19.80, 23.35, 'ricevi 80 € e GTA è praticamente gratis.'],
  [23.40, 27.05, 'E non è finita: per ogni amico che inviti, altri 50 €.'],
  [27.10, 29.80, 'Cinquanta! Cinquanta! Cinquanta!'],
  [29.85, 33.95, 'Condizioni e info? Le trovi nel link in bio.'],
];
// code card: letters land 17.35 → 19.2, held big, docks at 19.9
const CODE_T0 = 17.35, CODE_STEP = 0.135, CODE_DOCK = 19.9;

// ———————————————————— palette ————————————————————
const P = { ground: '#2a0f5c', ground2: '#3b1580', mag: '#ff2e88', gold: '#ffc928', cyan: '#1fd1d1', ink: '#140726',
  ok: '#2fe07a', fail: '#ff3b3b', white: '#ffffff', card: '#1b0840', copper: '#d07a3e', copperD: '#8c4a1f', copperL: '#f2a76a', band: '#ff3b3b' };

// ———————————————————— helpers ————————————————————
const rr = (x, y, w, h, r) => { X.beginPath(); X.roundRect(x, y, w, h, r); };
const font = (px, fam, w = '') => (X.font = `${w} ${px}px ${fam}`.trim());
const step = (t, fps) => Math.floor(t * fps + 1e-6) / fps;      // animate on twos etc.
function toonShape(path, fill, shade, lw = 7, sh = [10, 10]) {
  // hard shadow: shade colour offset, then fill, then outline
  X.save(); X.translate(sh[0], sh[1]); path(); X.fillStyle = P.ink; X.fill(); X.restore();
  path(); X.fillStyle = fill; X.fill();
  if (shade) { X.save(); path(); X.clip(); X.translate(-14, -14); path(); X.restore(); }
  path(); X.lineWidth = lw; X.strokeStyle = P.ink; X.lineJoin = 'round'; X.stroke();
}
function outlined(text, x, y, px, fam, fill, lw, drop, dropCol = P.mag) {
  font(px, fam); X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineJoin = 'round';
  if (drop) { X.fillStyle = dropCol; X.strokeStyle = dropCol; X.lineWidth = lw; X.strokeText(text, x + drop, y + drop); X.fillText(text, x + drop, y + drop); }
  X.strokeStyle = P.ink; X.lineWidth = lw; X.strokeText(text, x, y); X.fillStyle = fill; X.fillText(text, x, y);
}
function wrap(text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (X.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
const eur = v => v.toFixed(2).replace('.', ',') + ' €';
function balAt(t) { let v = 0, tc = -9, prev = 0; for (const [k, val] of BAL) if (t >= k) { prev = v; v = val; tc = k; } return { v, prev, tc }; }

// ———————————————————— the hero: Cent, a one-cent coin ————————————————————
// marks that survive every medium: round copper disc · the "1" · a red sweatband
function centToon(x, y, r, t, o = {}) {
  const tq = step(t, 15), bob = Math.sin(tq * TAU * 2.33) * 6 * (o.still ? 0 : 1);
  X.save(); X.translate(x, y + bob); X.rotate(o.rot || 0);
  if (o.legs !== false) {   // legs
    X.lineCap = 'round'; X.strokeStyle = P.ink; X.lineWidth = 9;
    const k = Math.sin(tq * TAU * 2.33);
    for (const s of [-1, 1]) { X.beginPath(); X.moveTo(s * r * .35, r * .8); X.lineTo(s * r * .45 + k * s * 6, r * 1.35); X.stroke();
      X.fillStyle = P.white; X.beginPath(); X.ellipse(s * r * .5 + k * s * 6, r * 1.38, 20, 11, 0, 0, TAU); X.fill(); X.lineWidth = 6; X.stroke(); X.lineWidth = 9; }
  }
  if (o.arm) { X.strokeStyle = P.ink; X.lineWidth = 9; X.beginPath(); X.moveTo(r * .85, 0); const a = o.arm; X.lineTo(r * .85 + Math.cos(a) * r * .7, Math.sin(a) * r * .7); X.stroke();
    X.fillStyle = P.white; X.beginPath(); X.arc(r * .85 + Math.cos(a) * r * .78, Math.sin(a) * r * .78, 17, 0, TAU); X.fill(); X.lineWidth = 6; X.stroke(); }
  const body = () => { X.beginPath(); X.arc(0, 0, r, 0, TAU); };
  toonShape(body, P.copper, true, 8);
  X.save(); body(); X.clip(); X.fillStyle = P.copperD; X.beginPath(); X.arc(10, 10, r, 0, TAU); X.arc(0, 0, r * .86, 0, TAU, true); X.fill('evenodd'); X.restore();
  X.lineWidth = 4; X.strokeStyle = P.copperD; X.beginPath(); X.arc(0, 0, r * .8, 0, TAU); X.stroke();
  // sweatband
  X.save(); body(); X.clip(); X.fillStyle = P.band; X.fillRect(-r, -r * .78, r * 2, r * .26); X.strokeStyle = P.ink; X.lineWidth = 5; X.strokeRect(-r - 5, -r * .78, r * 2 + 10, r * .26); X.restore();
  // eyes (blink)
  const blink = (Math.floor(tq * 15) % 53) < 2 ? .15 : 1;
  X.fillStyle = P.ink; for (const s of [-1, 1]) { X.beginPath(); X.ellipse(s * r * .28 + (o.look || 0) * 8, -r * .22, r * .09, r * .13 * blink, 0, 0, TAU); X.fill(); }
  if (o.mouth !== false) { X.lineWidth = 6; X.lineCap = 'round'; X.beginPath(); X.arc(0, r * .02, r * .16, .2, Math.PI - .2); X.stroke(); }
  // the "1"
  font(r * .62, "'Titan One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.copperD; X.fillText('1', 3, r * .5 + 3); X.fillStyle = P.copperL; X.fillText('1', 0, r * .5);
  X.restore();
}

// ———————————————————— static textures (built once, seeded) ————————————————————
function noiseCanvas(w, h, seed, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const d = g.createImageData(w, h); const R = mulberry(seed); for (let i = 0; i < w * h; i++) { const v = f(R()); d.data[i * 4] = v[0]; d.data[i * 4 + 1] = v[1]; d.data[i * 4 + 2] = v[2]; d.data[i * 4 + 3] = v[3]; } g.putImageData(d, 0, 0); return c; }
const paperTooth = noiseCanvas(540, 960, 11, r => [120, 100, 70, r < .5 ? 0 : (r - .5) * 60]);
const woodGrain = noiseCanvas(540, 960, 23, r => [60, 40, 20, r * 30]);
const dotTile = (() => { const c = document.createElement('canvas'); c.width = c.height = 12; const g = c.getContext('2d'); g.fillStyle = '#000'; g.beginPath(); g.arc(6, 6, 4.2, 0, TAU); g.fill(); return c; })();
const plateA = document.createElement('canvas'), plateB = document.createElement('canvas');
for (const c of [plateA, plateB]) { c.width = W; c.height = H; }

// ———————————————————— media (each draws the full game frame at local time lt) ————————————————————
// 1. NEON NIGHT CITY (hook and its echo)
function sceneNeon(lt, t, echo) {
  const g = X.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1a0638'); g.addColorStop(.42, '#5b1474'); g.addColorStop(.62, '#e2457a'); g.addColorStop(.72, '#ff9a4a'); g.addColorStop(.73, '#1a0b2e'); g.addColorStop(1, '#09030f');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  // stars
  for (let i = 0; i < 70; i++) { const x = hash(i) * W, y = hash(i + 99) * H * .4, tw = .5 + .5 * Math.sin(t * 3 + i); X.fillStyle = `rgba(255,255,255,${.25 + .5 * tw})`; X.fillRect(x, y, 3, 3); }
  // sun with stripes
  const sx = W / 2, sy = H * .64, sr = 300;
  X.save(); X.beginPath(); X.arc(sx, sy, sr, 0, TAU); X.clip();
  const sg = X.createLinearGradient(0, sy - sr, 0, sy + sr); sg.addColorStop(0, '#ffe26a'); sg.addColorStop(1, '#ff3d7a'); X.fillStyle = sg; X.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  X.fillStyle = '#5b1474'; for (let i = 0; i < 7; i++) { const y = sy - 20 + i * 38 + ((t * 30) % 38); X.fillRect(sx - sr, y, sr * 2, 6 + i * 2.5); }
  X.restore();
  // skyline (drifts slowly)
  const drift = (t * 18) % 160;
  X.fillStyle = '#120420';
  for (let i = -1; i < 9; i++) { const bw = 110 + hash(i * 3) * 60, bh = 220 + hash(i * 7) * 420, bx = i * 150 - drift, by = H * .73 - bh;
    X.fillRect(bx, by, bw, bh);
    for (let wy = by + 24; wy < H * .73 - 20; wy += 34) for (let wx = bx + 14; wx < bx + bw - 14; wx += 26) if (hash(wx * .13 + wy * .71 + i) > .62) { X.fillStyle = hash(wx + wy) > .5 ? '#ffd36a' : '#ff6fb1'; X.fillRect(wx, wy, 11, 15); X.fillStyle = '#120420'; } }
  // palm trees
  for (const [px, s, fl] of [[110, 1.15, 1], [960, 1, -1], [820, .7, -1]]) palm(px, H * .735, s, fl, t);
  // neon grid road
  X.save(); X.beginPath(); X.rect(0, H * .73, W, H * .27); X.clip();
  X.strokeStyle = '#ff2e88'; X.lineWidth = 3; X.shadowColor = '#ff2e88'; X.shadowBlur = 14;
  for (let i = -12; i <= 12; i++) { X.beginPath(); X.moveTo(W / 2 + i * 30, H * .73); X.lineTo(W / 2 + i * 260, H); X.stroke(); }
  for (let k = 0; k < 9; k++) { const u = ((k + (t * 1.6) % 1) / 9); const y = H * .73 + Math.pow(u, 2.2) * H * .27; X.beginPath(); X.moveTo(0, y); X.lineTo(W, y); X.stroke(); }
  X.restore();
  // car silhouette
  carSil(W / 2, H * .86 + Math.sin(step(t, 12) * 9) * 3, t);
  // TITLE: "GTA 6" in the film's lettering
  const ta = echo ? seg(lt, .05, .3) : seg(lt, .05, .32);
  const s = back(ta) * (echo ? .72 : 1);
  X.save(); X.translate(W / 2, echo ? 560 : 690); X.scale(s, s); X.rotate(-.05);
  font(250, "'Titan One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineJoin = 'round';
  X.shadowColor = '#1fd1d1'; X.shadowBlur = 40; X.lineWidth = 26; X.strokeStyle = '#1fd1d1'; X.strokeText('GTA 6', 0, 0);
  X.shadowBlur = 0; X.lineWidth = 12; X.strokeStyle = P.ink; X.strokeText('GTA 6', 0, 0);
  const tg = X.createLinearGradient(0, -110, 0, 110); tg.addColorStop(0, '#fff6c8'); tg.addColorStop(1, '#ff7ab6'); X.fillStyle = tg; X.fillText('GTA 6', 0, 0);
  X.restore();
  if (!echo) { // "USCITO OGGI" ribbon
    const ra = back(seg(lt, .8, 1.05));
    if (ra > 0) { X.save(); X.translate(W / 2, 880); X.scale(ra, ra); X.rotate(.03); rr(-250, -48, 500, 96, 12); X.fillStyle = P.gold; X.fill(); X.lineWidth = 7; X.strokeStyle = P.ink; X.stroke();
      font(58, "'Titan One'"); X.fillStyle = P.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('APPENA USCITO', 0, 4); X.restore(); }
  }
  // price tag 79,99 € → slashed → GRATIS stamp
  const pa = echo ? seg(lt, .2, .45) : seg(lt, 1.25, 1.5);
  if (pa > 0) {
    X.save(); X.translate(W / 2, echo ? 820 : 1060); X.scale(back(pa), back(pa));
    rr(-230, -78, 460, 156, 18); X.fillStyle = '#ffffff'; X.fill(); X.lineWidth = 8; X.strokeStyle = P.ink; X.stroke();
    font(104, "'Archivo Black'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.ink; X.fillText('79,99 €', 0, 6);
    const sl = echo ? seg(lt, .5, .7) : seg(lt, 3.05, 3.3);
    if (sl > 0) { X.strokeStyle = P.fail; X.lineWidth = 16; X.lineCap = 'round'; X.beginPath(); X.moveTo(-200, 30); X.lineTo(-200 + 400 * sl, -26); X.stroke(); }
    X.restore();
    const st = echo ? seg(lt, 1.28, 1.36) : seg(lt, 3.80, 3.88);
    if (st > 0) stamp(W / 2 + 20, (echo ? 820 : 1060) + 10, 'GRATIS', P.fail, st, -.16, 1.25);
  }
}
function palm(x, y, s, fl, t) {
  X.save(); X.translate(x, y); X.scale(s * fl, s); X.fillStyle = '#0d0318'; X.strokeStyle = '#0d0318';
  X.lineWidth = 22; X.lineCap = 'round'; X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(30, -260, 70, -520); X.stroke();
  const sw = Math.sin(t * 1.7) * .06;
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .48 + sw; X.save(); X.translate(70, -520); X.rotate(a);
    X.beginPath(); X.moveTo(0, 0); X.quadraticCurveTo(110, -40, 230, 40); X.quadraticCurveTo(110, -5, 0, 0); X.fill(); X.restore(); }
  X.restore();
}
function carSil(x, y, t) {
  X.save(); X.translate(x, y); X.fillStyle = '#0a0310';
  X.beginPath(); X.moveTo(-300, 40); X.lineTo(-290, -10); X.lineTo(-170, -30); X.lineTo(-90, -95); X.lineTo(110, -95); X.lineTo(200, -30); X.lineTo(300, -15); X.lineTo(305, 40); X.closePath(); X.fill();
  X.fillStyle = '#ff2e88'; X.shadowColor = '#ff2e88'; X.shadowBlur = 30; X.fillRect(-300, -5, 70, 14); X.fillRect(230, -5, 70, 14); X.shadowBlur = 0;
  X.fillStyle = '#05010a'; for (const wx of [-180, 180]) { X.beginPath(); X.arc(wx, 40, 52, 0, TAU); X.fill(); }
  X.restore();
}
function stamp(x, y, text, col, a, rot, s = 1) {
  const k = a < 1 ? lerp(2.2, 1, ei(a)) : 1;
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(k * s, k * s); X.globalAlpha = Math.min(1, a * 1.5);
  font(150, "'Titan One'"); X.textAlign = 'center'; X.textBaseline = 'middle';
  const w = X.measureText(text).width + 70;
  rr(-w / 2, -95, w, 190, 22); X.lineWidth = 16; X.strokeStyle = col; X.stroke();
  X.fillStyle = col; X.fillText(text, 0, 8);
  X.restore();
}

// 2. CRAYON — APRI! (open the account)
function crayonLine(pts, col, w, seed, passes = 3) {
  X.strokeStyle = col; X.lineCap = 'round'; X.lineJoin = 'round';
  for (let p = 0; p < passes; p++) { X.globalAlpha = .55; X.lineWidth = w * (0.7 + .3 * hash(seed + p)); X.beginPath();
    pts.forEach(([x, y], i) => { const jx = (hash(seed * 7 + i * 13 + p * 31) - .5) * w * .7, jy = (hash(seed * 11 + i * 17 + p * 29) - .5) * w * .7; i ? X.lineTo(x + jx, y + jy) : X.moveTo(x + jx, y + jy); }); X.stroke(); }
  X.globalAlpha = 1;
}
const rectPts = (x, y, w, h, n = 6) => { const p = []; for (let i = 0; i <= n; i++) p.push([x + w * i / n, y]); for (let i = 1; i <= n * 2; i++) p.push([x + w, y + h * i / (n * 2)]); for (let i = 1; i <= n; i++) p.push([x + w - w * i / n, y + h]); for (let i = 1; i <= n * 2; i++) p.push([x, y + h - h * i / (n * 2)]); return p; };
const circPts = (x, y, r, n = 24) => Array.from({ length: n + 2 }, (_, i) => [x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]);
function crayonFill(x, y, w, h, col, seed, ang = .5) {
  X.save(); X.beginPath(); X.rect(x, y, w, h); X.clip(); X.strokeStyle = col; X.globalAlpha = .45; X.lineWidth = 14; X.lineCap = 'round';
  for (let i = -h; i < w + h; i += 13) { X.beginPath(); X.moveTo(x + i + (hash(seed + i) - .5) * 8, y - 10); X.lineTo(x + i - h * ang + (hash(seed + i * 3) - .5) * 8, y + h + 10); X.stroke(); }
  X.restore(); X.globalAlpha = 1;
}
function sceneCrayon(lt, t) {
  const boil = Math.floor(t * 12);       // line boil on 12 fps
  X.fillStyle = '#fbf4e2'; X.fillRect(0, 0, W, H); X.drawImage(paperTooth, 0, 0, W, H);
  // phone
  const px = 270, py = 420, pw = 540, ph = 980;
  crayonFill(px, py, pw, ph, '#3a3f7a', 3);
  crayonLine(rectPts(px, py, pw, ph), '#1d1d3a', 16, boil);
  // screen
  const opened = seg(lt, 1.05, 1.35);
  crayonFill(px + 40, py + 90, pw - 80, ph - 190, opened > 0 ? '#ffd23f' : '#cfe8ff', 5);
  crayonLine(rectPts(px + 40, py + 90, pw - 80, ph - 190), '#1d1d3a', 9, boil + 3);
  // app tile → opened account screen
  if (opened <= 0) {
    const tx = px + 150, ty = py + 330, ts = 240;
    crayonFill(tx, ty, ts, ts, '#ff5aa5', 8); crayonLine(rectPts(tx, ty, ts, ts, 4), '#1d1d3a', 10, boil + 5);
    X.save(); X.translate(tx + ts / 2, ty + ts / 2); font(64, "'Titan One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = '#1d1d3a'; X.fillText('Buddy', 0, 4); X.restore();
    font(46, "'Lilita One'"); X.textAlign = 'center'; X.fillStyle = '#1d1d3a'; X.fillText('apri un conto', W / 2, ty + ts + 70);
  } else {
    X.save(); X.translate(W / 2, py + 470); X.scale(back(opened), back(opened));
    crayonLine(circPts(0, -60, 110), '#178a3e', 16, boil + 9); crayonLine([[-55, -60], [-12, -15], [65, -110]], '#178a3e', 20, boil + 11);
    font(70, "'Titan One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = '#1d1d3a'; X.fillText('CONTO', 0, 130); X.fillText('APERTO', 0, 210);
    X.restore();
  }
  // Cent in crayon: copper scribble disc + "1" + red band, peeking at the phone's corner
  const cx = 150, cy = 1150;
  X.save(); X.beginPath(); X.arc(cx, cy, 95, 0, TAU); X.clip(); crayonFill(cx - 95, cy - 95, 190, 190, '#c8743a', 21, -.4); crayonFill(cx - 95, cy - 80, 190, 30, '#e03030', 22, .2); X.restore();
  crayonLine(circPts(cx, cy, 95), '#5a2c10', 10, boil + 13);
  font(80, "'Titan One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = '#5a2c10'; X.fillText('1', cx, cy + 35);
  X.fillStyle = '#1d1d3a'; for (const s of [-1, 1]) { X.beginPath(); X.arc(cx + s * 28, cy - 20, 9, 0, TAU); X.fill(); }
  // finger tap
  const tap = seg(lt, .55, 1.0), up = seg(lt, 1.05, 1.3);
  const fy = lerp(1500, py + 470, eo(tap)) + up * 120, fx = W / 2 + 40;
  X.save(); X.translate(fx, fy); X.rotate(-.12);
  crayonFill(-45, 0, 90, 600, '#f2c19a', 31, .1); crayonLine([[-45, 600], [-45, 40], [0, -2], [45, 40], [45, 600]], '#7a4a2a', 10, boil + 17);
  crayonLine([[-22, 40], [-26, 10], [0, 0], [26, 10], [22, 40]], '#ffffff', 8, boil + 19, 2);
  X.restore();
  if (tap >= 1 && up < .4) { X.strokeStyle = '#1d1d3a'; X.lineWidth = 7; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, r0 = 60, r1 = 60 + 60 * seg(lt, 1.0, 1.15); X.beginPath(); X.moveTo(fx + Math.cos(a) * r0, py + 470 + Math.sin(a) * r0); X.lineTo(fx + Math.cos(a) * r1, py + 470 + Math.sin(a) * r1); X.stroke(); } }
}

// 3. CRT TERMINAL — CODICE! (the friend's code)
function sceneCRT(lt, t) {
  X.fillStyle = '#041006'; X.fillRect(0, 0, W, H);
  const G = '#5cff8a';
  X.save(); X.shadowColor = G; X.shadowBlur = 18; X.fillStyle = G; X.textAlign = 'left'; X.textBaseline = 'alphabetic';
  font(64, "'VT323'");
  const lines = ['BUDDY OS v1.0', '', '> NUOVO CONTO ........ OK', '> CODICE AMICO:'];
  lines.forEach((l, i) => X.fillText(l, 110, 600 + i * 70));
  // the friend's code, typed then masked
  const typed = Math.floor(clamp((lt - .32) / .07, 0, 9));
  font(120, "'VT323'"); const mask = '#'.repeat(typed) + (Math.floor(t * 4) % 2 && typed < 9 ? '█' : '');
  X.fillText(mask, 110, 900);
  font(56, "'VT323'"); X.fillText('(il codice di un amico)', 110, 960);
  if (lt > 1.05) { X.fillStyle = G; X.fillRect(104, 1000, 470, 92); X.fillStyle = '#041006'; font(84, "'VT323'"); X.fillText(' CODICE OK ✓', 112, 1071); }
  X.restore();
  // Cent as hand-authored glyph art, the "1" inverse
  X.save(); X.shadowColor = G; X.shadowBlur = 14; font(46, "'VT323'"); X.fillStyle = G; X.textAlign = 'left';
  const art = ['   .----.   ', '  /=====\\  ', ' | o  o |  ', ' |  [1]  |  ', '  \\____/   ', '   d  b    '];
  const bx = 660, by = 990, cw = X.measureText('M').width; art.forEach((l, i) => X.fillText(l, bx, by + i * 40));
  X.fillRect(bx + 5 * cw - 2, by + 3 * 40 - 34, cw + 4, 42); X.fillStyle = '#041006'; X.fillText('1', bx + 5 * cw, by + 3 * 40);
  X.restore();
  // scanlines + vignette
  X.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 0; y < H; y += 6) X.fillRect(0, y, W, 3);
  const v = X.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.75)'); X.fillStyle = v; X.fillRect(0, 0, W, H);
}

// 4. RISOGRAPH — INCASSA! (80 € arrive) / riso2 (a friend for +50)
function risoPlates(drawA, drawB) {
  const pc = setCtx(plateA.getContext('2d')); X.clearRect(0, 0, W, H); drawA(); setCtx(plateB.getContext('2d')); X.clearRect(0, 0, W, H); drawB(); setCtx(pc);
  for (const [pl, col] of [[plateA, '#ff48b0'], [plateB, '#0078bf']]) { const g = pl.getContext('2d'); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  X.fillStyle = '#f7f1e3'; X.fillRect(0, 0, W, H);
  X.save(); X.globalCompositeOperation = 'multiply'; X.drawImage(plateA, 6, -4); X.drawImage(plateB, -5, 5); X.restore();
  X.drawImage(paperTooth, 0, 0, W, H);
}
const halftone = (x, y, w, h) => { X.save(); X.fillStyle = X.createPattern(dotTile, 'repeat'); X.fillRect(x, y, w, h); X.restore(); };
function risoCoin(x, y, r, rot, solid) {
  X.save(); X.translate(x, y); X.scale(Math.abs(Math.cos(rot)) * .9 + .1, 1); X.beginPath(); X.arc(0, 0, r, 0, TAU);
  if (solid) { X.fillStyle = '#000'; X.fill(); } else { X.lineWidth = 10; X.strokeStyle = '#000'; X.stroke(); font(r * 1.1, "'Archivo Black'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = '#000'; X.fillText('€', 0, 4); }
  X.restore();
}
function sceneRiso(lt, t) {
  const fr = step(t, 15);
  const coins = Array.from({ length: 26 }, (_, i) => ({ x: 120 + hash(i * 5) * 840, d: hash(i * 9) * 1.1, sp: 1100 + hash(i) * 700, r: 50 + hash(i * 3) * 30 }));
  risoPlates(() => { // pink plate: wallet + coin fills
    rr(220, 1030, 640, 380, 40); X.fillStyle = '#000'; X.fill();
    for (const c of coins) { const u = fr - .25 - c.d; if (u < 0) continue; const y = Math.min(-100 + u * c.sp, 1060); risoCoin(c.x, y, c.r, u * 9, true); }
    // big 80 €
    const a = seg(lt, 1.2, 1.32); if (a > 0) { X.save(); X.translate(W / 2, 640); X.scale(back(a), back(a)); font(330, "'Archivo Black'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = '#000'; X.fillText('80 €', 0, 0); X.restore(); }
  }, () => { // blue plate: halftone shadows, outlines, Cent
    X.save(); rr(220, 1030, 640, 380, 40); X.clip(); halftone(220, 1030, 640, 380); X.restore();
    X.lineWidth = 12; rr(220, 1030, 640, 380, 40); X.strokeStyle = '#000'; X.stroke(); rr(560, 1150, 300, 140, 30); X.stroke();
    for (const c of coins) { const u = fr - .25 - c.d; if (u < 0) continue; const y = Math.min(-100 + u * c.sp, 1060); risoCoin(c.x + 8, y + 8, c.r, u * 9, false); }
    const a = seg(lt, 1.2, 1.32); if (a > 0) { X.save(); X.translate(W / 2 + 14, 654); X.scale(back(a), back(a)); font(330, "'Archivo Black'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineWidth = 12; X.strokeStyle = '#000'; X.strokeText('80 €', 0, 0); X.restore(); }
    // Cent: disc + "1", sweatband in the pink plate's overprint
    X.save(); X.translate(130, 900); X.beginPath(); X.arc(0, 0, 80, 0, TAU); X.clip(); halftone(-80, -80, 160, 160); X.restore();
    X.lineWidth = 10; X.beginPath(); X.arc(130, 900, 80, 0, TAU); X.stroke(); font(80, "'Archivo Black'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('1', 130, 925);
  });
  // band in pink plate colour drawn on top (multiply look)
  X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = '#ff48b0'; X.fillRect(50, 838, 160, 24); X.restore();
}
function sceneRiso2(lt, t) {   // the fourth friend, fast
  risoPlates(() => { friendShape(W / 2, 1250, 1.3, '#000'); }, () => { X.save(); X.beginPath(); X.arc(W / 2, 860, 260, 0, TAU); X.clip(); halftone(W / 2 - 260, 600, 520, 520); X.restore(); });
  plusFifty(lt, .3, '#0078bf', "'Archivo Black'");
}

// 5. SWISS GRID — PAGA! (80,00 − 79,99 = 0,01)
function sceneSwiss(lt, t) {
  X.fillStyle = '#ffffff'; X.fillRect(0, 0, W, H);
  X.strokeStyle = 'rgba(0,0,0,.08)'; X.lineWidth = 2; for (let i = 1; i < 6; i++) { X.beginPath(); X.moveTo(i * W / 6, 0); X.lineTo(i * W / 6, H); X.stroke(); }
  const L = 120, R = 960; X.textBaseline = 'alphabetic';
  const row = (txt, y, a, col = '#000', sz = 150) => { if (a <= 0) return; X.save(); X.globalAlpha = 1; const dx = (1 - eo(a)) * 260; font(sz, "'Archivo Black'"); X.textAlign = 'right'; X.fillStyle = col; X.fillText(txt, R + dx, y); X.restore(); };
  font(40, "'Archivo Black'"); X.textAlign = 'left'; X.fillStyle = '#000'; X.fillText('SALDO', L, 560); X.fillText('GTA 6', L, 780);
  row('80,00 €', 600, seg(lt, .12, .3));
  row('−79,99 €', 820, seg(lt, 1.22, 1.4), '#e3001b');
  const rl = seg(lt, 2.35, 2.6); X.fillStyle = '#000'; X.fillRect(L, 880, (R - L) * eo(rl), 16);
  row('0,01 €', 1080, seg(lt, 2.85, 3.05), '#000', 190);
  font(40, "'Archivo Black'"); X.textAlign = 'left'; if (lt > 2.9) X.fillText('AVANZO', L, 1035);
  // Cent: a signal-red disc with "1" pops out of the result, rolls off the grid
  const pop = seg(lt, 3.85, 4.05), roll = seg(lt, 4.05, 4.75);
  if (pop > 0) {
    const x0 = 820, y0 = 1190 + (1 - back(pop)) * 60, x = x0 + ei(roll) * 520, r = 85;
    X.save(); X.translate(x, y0); X.rotate(roll * 7);
    X.fillStyle = '#e3001b'; X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fill();
    X.fillStyle = '#ffffff'; font(110, "'Archivo Black'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('1', 0, 8);
    X.fillStyle = '#000'; X.fillRect(-r, -r * .7, r * 2, 18);
    X.restore();
    if (roll > 0 && roll < 1) { X.strokeStyle = '#000'; X.lineWidth = 6; for (let i = 0; i < 3; i++) { const yy = 1160 + i * 30; X.beginPath(); X.moveTo(x - 140 - i * 30, yy); X.lineTo(x - 260 - i * 30, yy); X.stroke(); } }
  }
}

// 6. PIXEL — INVITA! (a friend joins, +50 €)
const PAL = ['#0f0e1c', '#ffffff', '#ffcf3a', '#ff4f8b', '#3ad1ff', '#55e07a', '#d07a3e', '#8c4a1f', '#e03030', '#2b2050'];
function pxRect(x, y, w, h, c) { X.fillStyle = PAL[c]; X.fillRect(Math.round(x), Math.round(y), w, h); }
function pxFriend(x, y, c, fr) { const k = fr % 2; pxRect(x - 5, y - 26, 10, 10, 1); pxRect(x - 4, y - 23, 2, 2, 0); pxRect(x + 2, y - 23, 2, 2, 0); pxRect(x - 6, y - 16, 12, 12, c); pxRect(x - 5 + k * 2, y - 4, 3, 6, 0); pxRect(x + 2 - k * 2, y - 4, 3, 6, 0); }
function sceneP(lt, t) {
  const pc = setCtx(pctx); X.imageSmoothingEnabled = false;
  const fr = Math.floor(t * 8);
  pxRect(0, 0, 135, 240, 9); for (let i = 0; i < 40; i++) pxRect(hash(i) * 135, hash(i + 7) * 120, 1, 1, 1);
  pxRect(0, 170, 135, 70, 0); for (let x = 0; x < 135; x += 8) pxRect(x + ((fr * 2) % 8), 172, 4, 1, 4);
  // a house with a door
  pxRect(78, 120, 44, 50, 3); pxRect(74, 112, 52, 8, 8); pxRect(94, 146, 12, 24, 0); pxRect(84, 128, 8, 8, 2); pxRect(108, 128, 8, 8, 2);
  // friends walk in from the left toward the door (one invites the next)
  const walk = clamp((lt - .15) / 1.6);
  pxFriend(20 + walk * 70, 170, 5, fr); if (lt > .6) pxFriend(-10 + walk * 70, 170, 4, fr + 1);
  // Cent: copper pixel disc with "1", red band
  const cx = 30, cy = 140; for (let yy = -9; yy <= 9; yy++) for (let xx = -9; xx <= 9; xx++) if (xx * xx + yy * yy <= 81) pxRect(cx + xx, cy + yy, 1, 1, xx * xx + yy * yy > 64 ? 7 : 6);
  pxRect(cx - 8, cy - 7, 17, 3, 8); pxRect(cx - 1, cy - 2, 2, 8, 7); pxRect(cx - 2, cy - 1, 1, 1, 7); pxRect(cx - 3, cy - 4, 2, 2, 0); pxRect(cx + 2, cy - 4, 2, 2, 0);
  setCtx(pc);
  X.imageSmoothingEnabled = false; X.drawImage(pix, 0, 0, W, H); X.imageSmoothingEnabled = true;
  // pixel caption
  font(46, "'Press Start 2P'"); X.textAlign = 'center'; X.fillStyle = PAL[1]; X.fillText('AMICO INVITATO', W / 2, 560);
  plusFifty(lt, 1.85, PAL[2], "'Press Start 2P'", 120);
}

// 7. WOODCUT — +50 €
function friendShape(x, y, s, col) { X.save(); X.translate(x, y); X.scale(s, s); X.fillStyle = col; X.beginPath(); X.arc(0, -330, 110, 0, TAU); X.fill(); X.beginPath(); X.moveTo(-190, 60); X.quadraticCurveTo(-200, -190, 0, -200); X.quadraticCurveTo(200, -190, 190, 60); X.closePath(); X.fill(); X.restore(); }
function sceneWood(lt, t) {
  X.fillStyle = '#efe3c6'; X.fillRect(0, 0, W, H); X.drawImage(woodGrain, 0, 0, W, H);
  X.fillStyle = '#16110c'; X.fillRect(70, 300, W - 140, 1150);
  // carved rays
  X.save(); X.beginPath(); X.rect(70, 300, W - 140, 1150); X.clip(); X.strokeStyle = '#efe3c6'; X.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const a = i / 26 * TAU + t * .2; X.lineWidth = 10 + hash(i) * 10; X.beginPath(); X.moveTo(W / 2 + Math.cos(a) * 340, 760 + Math.sin(a) * 340); X.lineTo(W / 2 + Math.cos(a) * 900, 760 + Math.sin(a) * 900); X.stroke(); }
  X.restore();
  friendShape(W / 2, 1210, 1.15, '#efe3c6');
  X.save(); X.beginPath(); X.rect(0, 0, W, H); X.strokeStyle = '#16110c'; X.lineWidth = 7; for (let i = 0; i < 12; i++) { X.beginPath(); X.moveTo(W / 2 - 160 + i * 28, 1010); X.lineTo(W / 2 - 200 + i * 34, 1280); X.stroke(); } X.restore();
  plusFifty(lt, .1, '#c8261e', "'Archivo Black'");
}

// 8. BLUEPRINT — +50 €
function sceneBlue(lt, t) {
  X.fillStyle = '#1b4fa0'; X.fillRect(0, 0, W, H);
  X.strokeStyle = 'rgba(255,255,255,.13)'; X.lineWidth = 2; for (let x = 0; x < W; x += 60) { X.beginPath(); X.moveTo(x, 0); X.lineTo(x, H); X.stroke(); } for (let y = 0; y < H; y += 60) { X.beginPath(); X.moveTo(0, y); X.lineTo(W, y); X.stroke(); }
  X.strokeStyle = '#ffffff'; X.lineWidth = 5; const d = clamp(lt / .35);
  X.save(); X.setLineDash([2400 * d, 3000]);
  X.beginPath(); X.arc(W / 2, 850, 120, 0, TAU); X.stroke();
  X.beginPath(); X.moveTo(W / 2 - 210, 1290); X.quadraticCurveTo(W / 2 - 220, 1010, W / 2, 1000); X.quadraticCurveTo(W / 2 + 220, 1010, W / 2 + 210, 1290); X.closePath(); X.stroke();
  X.restore();
  // dimension line
  X.lineWidth = 3; X.beginPath(); X.moveTo(W / 2 - 260, 960); X.lineTo(W / 2 - 260, 1290); X.stroke();
  font(44, "'JB Mono'", 800); X.textAlign = 'center'; X.fillStyle = '#ffffff'; X.fillText('AMICO N° 3', W / 2 - 160, 1180);
  plusFifty(lt, .1, '#ffffff', "'JB Mono'", 200, 800);
}
function plusFifty(lt, at, col, fam, px = 220, wgt = '') {
  const a = seg(lt, at, at + .12); if (a <= 0) return;
  X.save(); X.translate(W / 2, 650); X.scale(back(a), back(a)); X.rotate(-.06); font(px, fam, wgt); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = col; X.fillText('+50 €', 0, 0); X.restore();
}

// 9. SLOT REELS — SPEED UP!
function sceneReels(lt, t) {
  const strips = ['neon', 'crayon', 'crt', 'riso', 'swiss'];
  const n = 3, sw = W / n;
  for (let i = 0; i < n; i++) {
    const stop = .45 + i * .2, sp = lt < stop ? (lt * 9 + i) : (stop * 9 + i);
    const idx = Math.floor(sp) % strips.length, off = (sp % 1) * H;
    X.save(); X.beginPath(); X.rect(i * sw, 0, sw, H); X.clip();
    for (const [k, dy] of [[idx, off], [(idx + 1) % strips.length, off - H]]) {
      X.save(); X.translate(0, dy); drawMedium(strips[k], 1.6, 10 + k); X.restore();
    }
    X.restore(); X.fillStyle = P.ink; X.fillRect(i * sw - 6, 0, 12, H);
  }
}

function drawMedium(m, lt, t) {
  switch (m) {
    case 'neon': return sceneNeon(lt, t, false);
    case 'neon2': return sceneNeon(lt, t, true);
    case 'crayon': return sceneCrayon(lt, t);
    case 'crt': return sceneCRT(lt, t);
    case 'riso': return sceneRiso(lt, t);
    case 'riso2': return sceneRiso2(lt, t);
    case 'swiss': return sceneSwiss(lt, t);
    case 'pixel': return sceneP(lt, t);
    case 'woodcut': return sceneWood(lt, t);
    case 'blueprint': return sceneBlue(lt, t);
    case 'reels': return sceneReels(lt, t);
  }
}

// ———————————————————— home stage ————————————————————
const PHONE = { x: 250, y: 470, w: 580, h: 960, r: 70 };     // the frame-within-the-frame
const SCREEN = { x: PHONE.x + 34, y: PHONE.y + 90, w: PHONE.w - 68, h: PHONE.h - 170 };
function home(t, spot) {
  X.fillStyle = P.ground; X.fillRect(0, 0, W, H);
  // rotating sunburst
  X.save(); X.translate(W / 2, 900); X.rotate(t * .35); X.fillStyle = P.ground2;
  for (let i = 0; i < 16; i++) { X.beginPath(); X.moveTo(0, 0); X.arc(0, 0, 2000, i / 16 * TAU, (i + .5) / 16 * TAU); X.closePath(); X.fill(); }
  X.restore();
  // stage floor
  X.fillStyle = '#1c0a40'; X.fillRect(0, 1380, W, H - 1380); X.fillStyle = P.mag; X.fillRect(0, 1380, W, 14);
  for (let i = 0; i < 9; i++) { X.fillStyle = Math.floor(t * 4 + i) % 2 ? P.gold : '#5a3a10'; X.beginPath(); X.arc(60 + i * 120, 1420, 12, 0, TAU); X.fill(); }
  // the phone
  const ph = () => rr(PHONE.x, PHONE.y, PHONE.w, PHONE.h, PHONE.r);
  toonShape(ph, '#2b2b3d', false, 9, [16, 16]);
  rr(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 24); X.fillStyle = '#0c0820'; X.fill(); X.lineWidth = 6; X.strokeStyle = P.ink; X.stroke();
  rr(PHONE.x + PHONE.w / 2 - 70, PHONE.y + 36, 140, 22, 11); X.fillStyle = P.ink; X.fill();
  // red trigger button under the phone
  const bt = () => { X.beginPath(); X.ellipse(W / 2, 1470, 110, 42, 0, 0, TAU); };
  toonShape(bt, P.fail, false, 7, [0, 12]);
  if (spot) { // lights cut to one top spot
    X.save(); X.fillStyle = `rgba(5,2,12,${.82 * spot})`; X.beginPath(); X.rect(0, 0, W, H);
    X.moveTo(W / 2 - 120, 0); X.lineTo(W / 2 + 120, 0); X.lineTo(W / 2 + 470, 1500); X.lineTo(W / 2 - 470, 1500); X.closePath(); X.fill('evenodd');
    X.restore();
  }
}
const screenEmpty = (t) => { // idle phone screen: Buddy-free waiting animation
  X.save(); rr(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 24); X.clip();
  X.fillStyle = '#16103a'; X.fillRect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
  font(64, "'Titan One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = Math.floor(t * 3) % 2 ? P.gold : P.white;
  X.fillText(t > 29.8 ? 'TOCCA QUI ↑' : t > 16 ? 'IL TUO TURNO' : 'PRONTI?', W / 2, SCREEN.y + SCREEN.h * (t > 16 ? .78 : .5)); X.restore();
};

// ———————————————————— HUD: balance board, command word, code card, subtitles ————————————————————
function board(t) {
  const { v, prev, tc } = balAt(t);
  const a = seg(t, tc, tc + .35), shown = lerp(prev, v, eo(a));
  const bump = tc > 0 ? Math.max(0, 1 - (t - tc) / .35) : 0;
  X.save(); X.translate(W / 2, 250); X.scale(1 + bump * .12, 1 + bump * .12);
  const b = () => rr(-330, -78, 660, 156, 28);
  toonShape(b, P.card, false, 8, [10, 10]);
  font(34, "'Lilita One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.cyan; X.fillText(BAL_LABEL(t), 0, -44);
  font(96, "'Titan One'"); X.fillStyle = bump > 0 && v > prev ? P.ok : bump > 0 ? P.gold : P.white; X.fillText(eur(shown), 0, 24);
  X.restore();
}
function cmdAt(t) {   // the active command word, from games and home beats
  let best = null;
  for (const g of GAMES) if (g.cmd && t >= g.cmdT && t < g.b) best = { text: g.cmd, t0: g.cmdT, tag: g.cmdT + .6, fly: g.fly, end: g.b };
  for (const h of HOME_CMDS) if (t >= h.t && t < h.tag + 2) best = { text: h.cmd, t0: h.t, tag: h.tag, end: h.tag + .4, fly: true };
  return best;
}
function command(t) {
  const c = cmdAt(t); if (!c) return;
  const lt = t - c.t0;
  const slam = lt < .1 ? lerp(2.4, .9, lt / .1) : lt < .18 ? lerp(.9, 1, (lt - .1) / .08) : 1;   // 3 frames in, overshoot, settle
  let x = W / 2, y = 900, s = slam, al = 1;
  if (t >= c.tag) { const k = eo(seg(t, c.tag, c.tag + .18));
    if (c.fly) { y = lerp(900, -300, k); al = 1 - k; } else { x = lerp(W / 2, 250, k); y = lerp(900, 420, k); s = lerp(1, .38, k); } }
  if (al <= 0) return;
  X.save(); X.globalAlpha = al; X.translate(x, y); X.rotate(-.07); X.scale(s, s);
  if (t < c.tag) { // burst behind
    X.fillStyle = P.gold; X.beginPath(); for (let i = 0; i < 28; i++) { const r = i % 2 ? 260 : 420, a = i / 28 * TAU; X.lineTo(Math.cos(a) * r, Math.sin(a) * r * .55); } X.closePath(); X.fill(); X.lineWidth = 8; X.strokeStyle = P.ink; X.stroke(); }
  const px = c.text.length > 9 ? 150 : 190;
  outlined(c.text, 0, 0, px, "'Titan One'", P.white, 28, 12);
  X.restore();
}
function codeCard(t) {
  if (t < CODE_T0 - .05) return;
  const dock = eo(seg(t, CODE_DOCK, CODE_DOCK + .35));
  const big = { x: W / 2, y: 900, s: 1 }, small = { x: W / 2, y: 425, s: .62 };
  const x = lerp(big.x, small.x, dock), y = lerp(big.y, small.y, dock), s = lerp(big.s, small.s, dock);
  const appear = back(seg(t, CODE_T0 - .05, CODE_T0 + .12));
  X.save(); X.translate(x, y); X.scale(s * appear, s * appear);
  const b = () => rr(-500, -120, 1000, 240, 30);
  toonShape(b, '#ffffff', false, 9, [14, 14]);
  font(30, "'Lilita One'"); X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = P.mag; X.fillText('CODICE AMICO', 0, -82);
  font(104, "'JB Mono'", 800); X.fillStyle = P.ink;
  const cw = 66, x0 = -(CODE.length - 1) * cw / 2;
  for (let i = 0; i < CODE.length; i++) { const lt = t - (CODE_T0 + i * CODE_STEP); if (lt < 0) continue;
    const k = lt < .08 ? lerp(1.8, 1, lt / .08) : 1; X.save(); X.translate(x0 + i * cw, 22); X.scale(k, k); X.fillText(CODE[i], 0, 0); X.restore(); }
  X.restore();
}
function subtitle(t) {
  const s = SUBS.find(([a, b]) => t >= a && t < b); if (!s) return;
  const [a, b, text] = s, k = back(seg(t, a, a + .12));
  font(56, "'Lilita One'"); const lines = wrap(text, 820);
  const lh = 66, hgt = lines.length * lh + 40, wid = Math.max(...lines.map(l => X.measureText(l).width)) + 120;
  const cy = 1370 + (lines.length - 1) * 0;   // card bottom sits above the TikTok caption zone
  X.save(); X.translate(W / 2, cy); X.scale(k, k);
  const c = () => rr(-wid / 2, -hgt / 2, wid, hgt, 30);
  toonShape(c, P.card, false, 7, [8, 8]);
  // speaker icon
  X.fillStyle = P.gold; X.beginPath(); X.moveTo(-wid / 2 + 30, -12); X.lineTo(-wid / 2 + 42, -12); X.lineTo(-wid / 2 + 58, -26); X.lineTo(-wid / 2 + 58, 26); X.lineTo(-wid / 2 + 42, 12); X.lineTo(-wid / 2 + 30, 12); X.closePath(); X.fill();
  X.fillStyle = P.white; X.textAlign = 'center'; X.textBaseline = 'middle';
  lines.forEach((l, i) => X.fillText(l, 20, -((lines.length - 1) * lh) / 2 + i * lh + 3));
  X.restore();
}
function check(t) {   // ✓ stamp on the phone after each game
  for (const g of GAMES) { if (g.id === 'hook' || g.m === 'reels') continue; const lt = t - (g.b - OUT * .2); if (lt > 0 && lt < .5) {
    const k = lt < .08 ? lerp(2, 1, lt / .08) : 1; X.save(); X.translate(PHONE.x + PHONE.w - 40, PHONE.y + 120); X.rotate(.18); X.scale(k, k);
    X.beginPath(); X.arc(0, 0, 70, 0, TAU); X.fillStyle = P.ok; X.fill(); X.lineWidth = 8; X.strokeStyle = P.ink; X.stroke();
    X.lineWidth = 16; X.strokeStyle = P.white; X.lineCap = 'round'; X.beginPath(); X.moveTo(-28, 0); X.lineTo(-6, 24); X.lineTo(32, -24); X.stroke(); X.restore(); } }
}
function fuse(t, g) {   // the game timer: a fuse with one knot per beat, the spark passing each knot on it
  if (!g || g.m === 'reels' || g.id === 'hook' || g.id === 'gratis' || (g.id === 'paga' && t > 14.85)) return;
  const u = clamp((t - g.a) / (g.b - g.a)), y = 1250, x0 = 120, x1 = 960;
  X.save(); X.lineCap = 'round'; X.strokeStyle = P.ink; X.lineWidth = 18; X.beginPath(); X.moveTo(x0, y); X.lineTo(x1, y); X.stroke();
  X.strokeStyle = '#d8b27a'; X.lineWidth = 10; X.beginPath(); X.moveTo(x0 + (x1 - x0) * u, y); X.lineTo(x1, y); X.stroke();
  const n = 4; for (let i = 1; i < n; i++) { const kx = x0 + (x1 - x0) * i / n; if (kx > x0 + (x1 - x0) * u) { X.fillStyle = '#d8b27a'; X.beginPath(); X.arc(kx, y, 12, 0, TAU); X.fill(); X.lineWidth = 5; X.strokeStyle = P.ink; X.stroke(); } }
  const sx = x0 + (x1 - x0) * u; X.fillStyle = P.gold; X.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 30, a = i / 10 * TAU + t * 20; X.lineTo(sx + Math.cos(a) * r, y + Math.sin(a) * r); } X.closePath(); X.fill();
  X.restore();
}
function arrowUp(t) {   // LINK IN BIO
  const a = seg(t, 31.25, 31.45); if (a <= 0) return;
  const bob = Math.sin(t * 9) * 18;
  X.save(); X.translate(W / 2, 680 + bob); X.scale(back(a) * .7, back(a) * .7);
  const ar = () => { X.beginPath(); X.moveTo(0, -230); X.lineTo(170, -40); X.lineTo(70, -40); X.lineTo(70, 200); X.lineTo(-70, 200); X.lineTo(-70, -40); X.lineTo(-170, -40); X.closePath(); };
  toonShape(ar, P.gold, false, 9, [12, 12]);
  X.restore();
}

// ———————————————————— compose ————————————————————
function activeGame(t) { return GAMES.find(g => t >= g.a && t < g.b); }
const screenRect = () => [SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h];
function render(t) {
  X = main; X.setTransform(SC, 0, 0, SC, 0, 0);
  const g = activeGame(t);
  // home stage is always under (seen during transitions and home beats)
  const spot = seg(t, 16.05, 16.2) * (1 - seg(t, 19.85, 20.1));
  home(t, spot);
  if (!g) {
    screenEmpty(t);
    // Cent on the home stage
    const tocca = t > 16 && t < 21.3, link = t > 29.82;
    const cx = tocca ? W / 2 : link ? 165 : 150, cy = tocca ? 650 : link ? 1110 : 1150;
    const hop = tocca ? Math.max(0, Math.sin(seg(t, 16.1, 16.5) * Math.PI)) * 120 : 0;
    centToon(cx, cy - hop, tocca ? 130 : link ? 110 : 100, t, { arm: link ? -1.6 : (t > 4.6 && t < 5.6 ? -0.9 + Math.sin(step(t, 15) * 14) * .4 : null), look: tocca ? 0 : 1 });
    arrowUp(t);
    
  } else {
    // draw the game into its buffer, then place it: push in from the phone screen, shrink back out
    const lt = t - g.a;
    const pc = setCtx(gctx); X.setTransform(1, 0, 0, 1, 0, 0); X.save(); drawMedium(g.m, lt, t); X.restore(); setCtx(pc);
    X.setTransform(SC, 0, 0, SC, 0, 0);
    const kin = g.noIn ? 1 : eo(seg(t, g.a, g.a + IN)), kout = 1 - ei(seg(t, g.b - OUT, g.b));
    // chained games (no home beat between) skip the shrink
    const next = GAMES.find(n => Math.abs(n.a - g.b) < 1e-6), prev = GAMES.find(n => Math.abs(n.b - g.a) < 1e-6);
    const k = Math.min(prev && !g.noIn ? 1 : kin, next ? 1 : kout);
    const [sx, sy, sw, sh] = screenRect();
    const rx = lerp(sx, 0, k), ry = lerp(sy, 0, k), rw = lerp(sw, W, k), rh = lerp(sh, H, k);
    if (k < 1) screenEmpty(t);
    X.save(); rr(rx, ry, rw, rh, lerp(24, 0, k)); X.clip(); X.drawImage(gbuf, rx, ry, rw, rh); X.restore();
    // a hard jolt on every medium switch: a short flash capped at 60 %
    const sw0 = seg(t, g.a, g.a + .07); if (sw0 > 0 && sw0 < 1 && g.a > 0) { X.fillStyle = `rgba(255,255,255,${.55 * (1 - sw0)})`; X.fillRect(0, 0, W, H); }
    if (k >= 1) fuse(t, g);
  }
  check(t);
  board(t);
  codeCard(t);
  command(t);
  subtitle(t);
}

// ———————————————————— events for the sound mixer ————————————————————
const EV = [];
const ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
for (const g of GAMES) { if (g.a > 0) ev(g.a, 'whoosh'); if (g.cmd) ev(g.cmdT, 'slam'); }
for (const h of HOME_CMDS) ev(h.t, 'slam');
ev(0.05, 'rev'); ev(1.25, 'pop'); ev(3.05, 'scribble'); ev(3.80, 'stamp'); ev(4.32, 'whooshOut');
ev(6.10, 'tap'); ev(6.60, 'pop'); ev(6.65, 'squeak');
for (let i = 0; i < 9; i++) ev(7.12 + .32 + i * .07, 'key'); ev(8.17, 'beep');
for (let i = 0; i < 14; i++) ev(9.0 + i * .12 + hash(i) * .05, 'coin', { v: .5 + hash(i * 3) * .4 }); ev(9.95, 'register');
ev(11.17, 'slide'); ev(12.27, 'slide'); ev(13.40, 'rule'); ev(13.90, 'ding'); ev(14.90, 'pop'); ev(15.10, 'roll');
ev(16.05, 'spot'); ev(16.45, 'heart'); ev(17.05, 'heart');
for (let i = 0; i < CODE.length; i++) ev(CODE_T0 + i * CODE_STEP, 'clack', { v: .6 + (i % 2) * .2 });
ev(CODE_DOCK, 'whooshOut'); ev(20.5, 'register'); ev(22.58, 'stamp');
ev(23.42, 'reel');
ev(26.35, 'coinUp'); ev(27.45, 'coinUp'); ev(28.35, 'coinUp'); ev(29.15, 'coinUp');
ev(31.25, 'whooshOut'); ev(31.32, 'pop');
for (const g of GAMES) { if (g.id === 'hook' || g.m === 'reels') continue; ev(g.b - OUT * .2, 'check'); }
for (const [k] of BAL) if (k > 0) ev(k, 'flip');
EV.sort((a, b) => a.t - b.t);

// texts on screen, for readcheck
function TEXTS(t) {
  const out = []; const s = SUBS.find(([a, b]) => t >= a && t < b); if (s) out.push({ id: 'sub' + s[0], text: s[2], x0: 120, y0: 1300, x1: 960, y1: 1450 });
  if (t > CODE_T0 + CODE.length * CODE_STEP) out.push({ id: 'code', text: CODE, x0: 80, y0: 300, x1: 1000, y1: 1020 });
  out.push({ id: 'bal' + balAt(t).tc, text: eur(balAt(t).v), x0: 220, y0: 170, x1: 860, y1: 330, pass: true });
  return out;
}

Object.assign(window, { DUR, render, EV, TEXTS });
document.fonts.load("100px 'Titan One'").then(() => Promise.all(["100px 'Lilita One'", "800 100px 'JB Mono'", "100px 'Archivo Black'", "100px 'VT323'", "40px 'Press Start 2P'"].map(f => document.fonts.load(f))))
  .then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
