// V11 — Top-down open-world gameplay, vertical 1080×1920. An original coastal city seen from above, a convertible that drives,
// drifts and collects cash, a money counter, an in-game phone, a convoy of friends. No official logos, fonts or UI.
import { clamp, lerp, seg, eo, ei, back, hash, monotone, TAU } from '/core/lib.js';
import { DUR, CODE, SUBS, T, loadMouth, mouthAt } from './beats.js';

const W = 1080, H = 1920, BL = 540, RW = 150;           // block pitch and road width (world px)
const cv = document.getElementById('c'); cv.width = innerWidth || W; cv.height = innerHeight || H;
const SC = cv.width / W, X = cv.getContext('2d');
const COAST = 3420;
const A = (t, t0, d = .3) => seg(t, t0, t0 + d);

// ———— the route: keyframes [t, x, y] (road centres are multiples of 540; lanes ±35) ————
const KEYS = [[0, 1045, 3300], [.9, 1045, 2330], [1.35, 1150, 2195], [2.2, 1700, 2195], [4.45, 2600, 2195], [7.4, 3200, 2195], [8.2, 3275, 2050], [11.0, 3275, 1700],
  [11.6, 3200, 1655], [12.3, 2900, 1655], [12.8, 2830, 1600], [23.4, 2830, 1600], [24.0, 2700, 1655], [29.8, 1700, 1655], [30.5, 1585, 1560], [34, 1585, 600]];
const fx = monotone(KEYS.map(k => [k[0], k[1]])), fy = monotone(KEYS.map(k => [k[0], k[2]]));
const pos = t => [fx(t), fy(t)];
function heading(t) { for (let u = t, i = 0; i < 400; i++, u -= .05) { const [x0, y0] = pos(u - .06), [x1, y1] = pos(u + .06); if (Math.hypot(x1 - x0, y1 - y0) > .5) return Math.atan2(y1 - y0, x1 - x0); } return -Math.PI / 2; }

// ———— the city (drawn per visible block) ————
const ROOF = ['#c9b8a0', '#d8c7ae', '#b7a7c9', '#a9c4c9', '#e0b49a', '#c4cfa0', '#d6a9b9'];
function block(bx, by) {   // block between roads, top-left at (bx*BL + RW/2, by*BL + RW/2)
  const x = bx * BL + RW / 2, y = by * BL + RW / 2, s = BL - RW, h = hash(bx * 13.1 + by * 7.7);
  if (x > COAST) return;
  X.fillStyle = '#d9d3c4'; X.fillRect(x - 18, y - 18, s + 36, s + 36);                        // sidewalk
  if (h < .14) { X.fillStyle = '#6fbf6a'; X.fillRect(x, y, s, s); for (let i = 0; i < 6; i++) palm(x + 40 + hash(i + bx) * (s - 80), y + 40 + hash(i + by * 3) * (s - 80), 1); return; }   // park
  const n = h < .5 ? 1 : 4, cell = s / (n === 1 ? 1 : 2);
  for (let i = 0; i < n; i++) { const cx = x + (i % 2) * cell, cy = y + Math.floor(i / 2) * cell, hh = hash(bx * 3 + by * 5 + i);
    X.fillStyle = 'rgba(0,0,0,.25)'; X.fillRect(cx + 14, cy + 14, cell - 10, cell - 10);
    X.fillStyle = ROOF[Math.floor(hh * ROOF.length)]; X.fillRect(cx + 4, cy + 4, cell - 12, cell - 12); X.strokeStyle = 'rgba(0,0,0,.25)'; X.lineWidth = 4; X.strokeRect(cx + 4, cy + 4, cell - 12, cell - 12);
    X.fillStyle = 'rgba(255,255,255,.35)'; X.fillRect(cx + 20, cy + 20, 40, 26); X.fillRect(cx + 70, cy + 20, 26, 26);   // AC units
    if (hh > .7) { X.fillStyle = '#4fd0e0'; X.beginPath(); X.roundRect(cx + cell * .35, cy + cell * .4, cell * .4, cell * .3, 18); X.fill(); X.strokeStyle = '#fff'; X.lineWidth = 5; X.stroke(); }   // pool
  }
}
function palm(x, y, s) { X.save(); X.translate(x, y); X.scale(s, s); X.fillStyle = 'rgba(0,0,0,.25)'; X.beginPath(); X.arc(10, 10, 34, 0, TAU); X.fill(); X.fillStyle = '#2f8f4a'; for (let i = 0; i < 7; i++) { X.rotate(TAU / 7); X.beginPath(); X.ellipse(20, 0, 26, 9, 0, 0, TAU); X.fill(); } X.fillStyle = '#7a5a3a'; X.beginPath(); X.arc(0, 0, 7, 0, TAU); X.fill(); X.restore(); }
function world(t, cx, cy, z) {
  const x0 = cx - W / 2 / z, y0 = cy - H / 2 / z, x1 = cx + W / 2 / z, y1 = cy + H / 2 / z;
  X.fillStyle = '#4a4a52'; X.fillRect(x0, y0, x1 - x0, y1 - y0);                                // asphalt
  // lane markings
  X.fillStyle = '#e8d36a'; for (let gx = Math.floor(x0 / BL) * BL; gx < x1; gx += BL) for (let y = Math.floor(y0 / 60) * 60; y < y1; y += 60) X.fillRect(gx - 3, y, 6, 30);
  for (let gy = Math.floor(y0 / BL) * BL; gy < y1; gy += BL) for (let x = Math.floor(x0 / 60) * 60; x < Math.min(x1, COAST); x += 60) X.fillRect(x, gy - 3, 30, 6);
  for (let by = Math.floor(y0 / BL) - 1; by <= Math.ceil(y1 / BL); by++) for (let bx = Math.floor(x0 / BL) - 1; bx <= Math.ceil(x1 / BL); bx++) block(bx, by);
  // the coast: beach and sea with moving foam
  if (x1 > COAST + 60) { X.fillStyle = '#ecd9a4'; X.fillRect(COAST + 60, y0, 260, y1 - y0); for (let y = Math.floor(y0 / 220) * 220; y < y1; y += 220) palm(COAST + 140, y + 60, 1.1);
    X.fillStyle = '#2aa3c8'; X.fillRect(COAST + 320, y0, x1 - COAST, y1 - y0); X.strokeStyle = 'rgba(255,255,255,.7)'; X.lineWidth = 8; X.beginPath(); for (let y = y0; y < y1; y += 20) X.lineTo(COAST + 320 + Math.sin(y * .02 + t * 3) * 14, y); X.stroke(); }
}
// the billboard on a roof (world), facing up
function billboard(x, y, w, h, fn) { X.save(); X.translate(x, y); X.fillStyle = 'rgba(0,0,0,.35)'; X.fillRect(-w / 2 + 20, -h / 2 + 20, w, h); X.fillStyle = '#1a1420'; X.fillRect(-w / 2, -h / 2, w, h); X.strokeStyle = '#ffd23a'; X.lineWidth = 8; X.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); fn(); X.restore(); }
function anton(txt, x, y, px, col = '#fff', lw = .12) { X.font = `${px}px 'Anton'`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.lineJoin = 'round'; X.lineWidth = px * lw; X.strokeStyle = '#120d14'; X.strokeText(txt, x, y); X.fillStyle = col; X.fillText(txt, x, y); }

// ———— cars (top-down) ————
function car(x, y, ang, col, t, o = {}) {
  X.save(); X.translate(x, y); X.rotate(ang + Math.PI / 2);
  X.fillStyle = 'rgba(0,0,0,.35)'; X.beginPath(); X.roundRect(-34, -64, 80, 140, 22); X.fill();
  X.fillStyle = col; X.beginPath(); X.roundRect(-40, -72, 80, 144, 24); X.fill(); X.strokeStyle = '#120d14'; X.lineWidth = 5; X.stroke();
  X.fillStyle = 'rgba(170,220,255,.8)'; X.beginPath(); X.roundRect(-30, -42, 60, 22, 6); X.fill();
  if (o.open) { X.fillStyle = '#3a2a2a'; X.fillRect(-28, -16, 56, 60); X.fillStyle = '#1a1214'; X.beginPath(); X.arc(-12, 4, 13, 0, TAU); X.fill(); X.fillStyle = '#ffd23a'; X.beginPath(); X.arc(14, 10, 12, 0, TAU); X.fill(); }   // driver + passenger seen from above
  else { X.fillStyle = 'rgba(0,0,0,.35)'; X.beginPath(); X.roundRect(-30, -14, 60, 60, 10); X.fill(); }
  X.fillStyle = '#fff6b0'; X.fillRect(-34, -74, 16, 6); X.fillRect(18, -74, 16, 6); X.fillStyle = '#ff3a3a'; X.fillRect(-34, 68, 16, 6); X.fillRect(18, 68, 16, 6);
  if (o.lights) { X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createLinearGradient(0, -80, 0, -360); g.addColorStop(0, 'rgba(255,240,170,.45)'); g.addColorStop(1, 'rgba(255,240,170,0)'); X.fillStyle = g; X.beginPath(); X.moveTo(-36, -76); X.lineTo(-110, -360); X.lineTo(110, -360); X.lineTo(36, -76); X.fill(); X.restore(); }
  X.restore();
}
function police(x, y, ang, t) { car(x, y, ang, '#f2f2f2', t); X.save(); X.translate(x, y); X.rotate(ang + Math.PI / 2); const ph = Math.floor(t * 8) % 2; X.fillStyle = ph ? '#ff2a3a' : '#2a6bff'; X.fillRect(-26, -4, 24, 10); X.fillStyle = ph ? '#2a6bff' : '#ff2a3a'; X.fillRect(2, -4, 24, 10);
  X.globalCompositeOperation = 'lighter'; X.fillStyle = ph ? 'rgba(255,40,60,.25)' : 'rgba(40,100,255,.25)'; X.beginPath(); X.arc(0, 0, 220, 0, TAU); X.fill(); X.restore(); }
function skids(t, from, to) { X.strokeStyle = 'rgba(20,16,20,.55)'; X.lineWidth = 12; for (const off of [-26, 26]) { X.beginPath(); for (let u = from; u <= Math.min(t, to); u += .03) { const [x, y] = pos(u), a = heading(u); X.lineTo(x + Math.cos(a + Math.PI / 2) * off, y + Math.sin(a + Math.PI / 2) * off); } X.stroke(); } }
function pickup(x, y, t, label, col = '#3ae07a', big = 1) { const b = Math.sin(t * 6) * 8; X.save(); X.translate(x, y + b); X.globalCompositeOperation = 'lighter'; X.fillStyle = col + '44'; X.beginPath(); X.arc(0, 0, 70 * big, 0, TAU); X.fill(); X.restore();
  X.save(); X.translate(x, y + b); X.scale(Math.abs(Math.cos(t * 3)) * .8 + .2, 1); X.fillStyle = col; X.beginPath(); X.arc(0, 0, 40 * big, 0, TAU); X.fill(); X.strokeStyle = '#120d14'; X.lineWidth = 5; X.stroke(); anton(label, 0, 2, 44 * big, '#fff', .08); X.restore(); }

// ———— HUD (screen space, inside TikTok's safe area) ————
function money(t) {
  const keys = [[0, 0], [9.0, 0], [9.93, 80], [14.34, .01]], you = [[19.8, 0], [20.49, 80], [26.35, 130], [27.45, 180], [28.35, 230], [29.15, 280]];
  const k = t < 19.8 ? keys : you; let v = 0, p = 0, tk = -9; for (const [kt, kv] of k) if (t >= kt) { p = v; v = kv; tk = kt; }
  if (t < 9.93 && t > 9.0) v = Math.floor(seg(t, 9.0, 9.93) * 6) * 10;                       // pickups count up before the bag
  const shown = lerp(p, v, eo(seg(t, tk, tk + .4))), bump = Math.max(0, 1 - (t - tk) / .3);
  X.save(); X.translate(1000, 230); X.scale(1 + bump * .15, 1 + bump * .15);
  anton(`€ ${shown.toFixed(2).replace('.', ',')}`, -150, 0, 92, bump > 0 ? '#9dffb0' : '#ffffff', .14); X.restore();
  if (t > 19.8) { X.font = "40px 'Anton'"; X.textAlign = 'right'; X.fillStyle = '#ffd23a'; X.lineWidth = 6; X.strokeStyle = '#120d14'; X.strokeText('TU', 1000, 160); X.fillText('TU', 1000, 160); }
}
function radar(t, px, py) {   // a round minimap, top left
  X.save(); X.translate(160, 250); X.beginPath(); X.arc(0, 0, 110, 0, TAU); X.fillStyle = 'rgba(20,20,26,.75)'; X.fill(); X.clip();
  X.scale(.06, .06); X.translate(-px, -py); X.strokeStyle = '#9a9aa8'; X.lineWidth = RW; for (let g = 0; g < 8000; g += BL) { X.beginPath(); X.moveTo(g, -2000); X.lineTo(g, 8000); X.stroke(); X.beginPath(); X.moveTo(-2000, g); X.lineTo(COAST + 200, g); X.stroke(); }
  X.fillStyle = '#2aa3c8'; X.fillRect(COAST + 320, -2000, 4000, 10000); X.restore();
  X.save(); X.translate(160, 250); X.fillStyle = '#ffd23a'; X.beginPath(); X.moveTo(0, -14); X.lineTo(10, 12); X.lineTo(-10, 12); X.closePath(); X.fill(); X.strokeStyle = '#fff'; X.lineWidth = 5; X.beginPath(); X.arc(0, 0, 110, 0, TAU); X.stroke(); X.restore();
}
function phoneUI(t) {   // the in-game phone slides up over the play
  const a = eo(seg(t, 4.45, 4.75)) * (1 - ei(seg(t, 8.5, 8.75))); if (a <= 0) return;
  X.save(); X.translate(640, lerp(2300, 1000, a)); X.rotate(.04);
  X.fillStyle = '#120d14'; X.beginPath(); X.roundRect(-220, -400, 440, 800, 50); X.fill(); X.fillStyle = '#2a2050'; X.beginPath(); X.roundRect(-190, -340, 380, 680, 22); X.fill();
  if (t < 7.15) { if (t < T.buddy + .1) { X.fillStyle = '#ffd23a'; X.beginPath(); X.roundRect(-80, -120, 160, 160, 36); X.fill(); anton('B', 0, -38, 110, '#120d14', 0); const tp = (t > 5.9 && t < 6.6) ? Math.abs(Math.sin(t * 12)) : 0; X.fillStyle = '#d9926a'; X.beginPath(); X.ellipse(70, 160 - tp * 160, 40, 70, -.4, 0, TAU); X.fill(); }
    else { X.strokeStyle = '#3ae07a'; X.lineWidth = 34; X.lineCap = 'round'; X.beginPath(); X.moveTo(-90, -20); X.lineTo(-25, 50); X.lineTo(100, -100); X.stroke(); } }
  else { X.fillStyle = '#fff'; X.beginPath(); X.roundRect(-150, -180, 300, 90, 18); X.fill(); const n = Math.floor(clamp((t - 7.4) / .09, 0, 6)); X.fillStyle = '#120d14'; for (let i = 0; i < n; i++) { X.beginPath(); X.arc(-110 + i * 44, -135, 13, 0, TAU); X.fill(); }
    if (t > T.amico) { X.strokeStyle = '#3ae07a'; X.lineWidth = 30; X.lineCap = 'round'; X.beginPath(); X.moveTo(-80, 90); X.lineTo(-20, 150); X.lineTo(90, 20); X.stroke(); } }
  X.restore();
}
function shopUI(t) {    // buying the game: a panel over the play
  const a = eo(seg(t, 12.6, 12.9)) * (1 - ei(seg(t, 15.8, 16.05))); if (a <= 0) return;
  X.save(); X.translate(540, 960); X.scale(a, a); X.fillStyle = 'rgba(18,13,20,.88)'; X.beginPath(); X.roundRect(-430, -330, 860, 660, 30); X.fill(); X.strokeStyle = '#ffd23a'; X.lineWidth = 6; X.stroke();
  X.fillStyle = '#5a1b7a'; X.fillRect(-340, -250, 260, 360); X.fillStyle = '#ff7a4a'; X.beginPath(); X.arc(-210, -20, 90, Math.PI, 0); X.fill(); X.fillStyle = '#120d14'; for (let i = 0; i < 4; i++) X.fillRect(-330 + i * 65, -60 - (i % 2) * 40, 36, 170);
  anton('GTA 6', -210, -200, 70); anton('79,99 €', 170, -120, 120, '#fff');
  if (t > 13.3) { X.strokeStyle = '#3ae07a'; X.lineWidth = 26; X.lineCap = 'round'; X.beginPath(); X.moveTo(80, 40); X.lineTo(150, 110); X.lineTo(290, -40); X.stroke(); }
  if (t > T.avanza) { const c = back(A(t, T.avanza, .25), 2.4); X.save(); X.translate(170, 230); X.scale(c, c); X.fillStyle = '#e8a24a'; X.beginPath(); X.arc(-120, 0, 34, 0, TAU); X.fill(); X.strokeStyle = '#120d14'; X.lineWidth = 5; X.stroke(); anton('0,01 €', 40, 4, 80, '#ffd23a'); X.restore(); }
  X.restore();
}

// ———— camera + render ————
const camK = t => { const [x, y] = pos(t);
  if (t < .9) return [1045, lerp(2650, 2420, t / .9), 1.75];                                       // hook: the drift comes into frame
  if (t >= 16.05 && t < 23.4) { const k = eo(seg(t, 16.05, 16.8)) * (1 - eo(seg(t, 23.0, 23.4))); return [lerp(x, 2430, k), lerp(y - 160, 1120, k), lerp(1.6, 1.05, k)]; }
  if (t >= 29.85) { const k = eo(seg(t, 29.85, 30.6)); return [lerp(x, 1585, k), y - 160, lerp(1.6, 1.25, k)]; }
  return [x, y - 160, 1.6]; };
function render(t) {
  X.setTransform(SC, 0, 0, SC, 0, 0); X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  const [cx, cy, z] = camK(t); X.save(); X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-cx, -cy);
  world(t, cx, cy, z);
  // billboards on the roofs
  if (t < 23.4) billboard(2430, 1080, 900, 300, () => { if (t < 16.05) { anton('GTA 6', 0, 0, 200, '#ff5d8f'); return; }
    if (t < 20.0) { X.font = "40px 'Anton'"; X.fillStyle = '#ffd23a'; X.textAlign = 'center'; X.fillText('CODICE AMICO', 0, -100); X.font = "700 74px 'JB Mono'"; X.fillStyle = '#fff'; const cw = 56, x0 = -(CODE.length - 1) * cw / 2; for (let i = 0; i < CODE.length; i++) if (t > 17.5 + i * .1) X.fillText(CODE[i], x0 + i * cw, 20); return; }
    anton('GTA 6', 0, -40, 130, '#ff5d8f'); if (t > T.gratis2 - .05) { const k = back(A(t, T.gratis2 - .05, .2), 2.4); X.save(); X.rotate(-.1); X.scale(k, k); anton('GRATIS', 0, 70, 120, '#3ae07a'); X.restore(); } });
  billboard(1585, 2700, 520, 220, () => anton('GTA 6', 0, 0, 150, '#ff5d8f'));
  skids(t, .8, 1.6);
  // cash pickups on the coast road (collected as the car passes)
  if (t < 11) for (let i = 0; i < 6; i++) { const py = 2050 - i * 60, tc = 9.0 + i * .155; if (t < tc) pickup(3275, py, t + i, '€'); }
  if (t < T.ottanta && t > 8.0) pickup(3275, 1760, t, '80', '#3ae07a', 1.6);
  if (t > T.ottanta && t < T.ottanta + .6) { const k = seg(t, T.ottanta, T.ottanta + .6); X.save(); X.globalAlpha = 1 - k; anton('+80 €', 3275, 1700 - k * 160, 140, '#9dffb0'); X.restore(); }
  // friends merge in from side streets and follow in convoy
  const hits = [T.cinquanta0, T.c1, T.c2, T.c3], cols = ['#3f9bff', '#ffd23a', '#5ce07a', '#b57bff'], side = [[2160, 2300], [2160, 1000], [1620, 2300], [1620, 1000]];
  hits.forEach((h, i) => { if (t < h - .9) return; const lag = (i + 1) * .32, [tx, ty] = pos(Math.max(23.4, t - lag)), k = eo(seg(t, h - .9, h)); const x = lerp(side[i][0], tx, k), y = lerp(side[i][1], ty, k);
    const ang = k < 1 ? Math.atan2(ty - side[i][1], tx - side[i][0]) : heading(t - lag); car(x, y, ang, cols[i], t, { open: true });
    if (t > h && t < h + 1.3) { const u = seg(t, h, h + 1.3); X.save(); X.globalAlpha = 1 - u * u; anton('+50 €', x, y - 140 - u * 120, 90, '#9dffb0'); X.restore(); } });
  const [x, y] = pos(t), ang = heading(t), drift = t > .85 && t < 1.6 ? Math.sin(seg(t, .85, 1.6) * Math.PI) * .5 : 0;
  car(x, y, ang + drift, '#e3262f', t, { open: true, lights: t > 29.8 });
  if (t < 4.45) { const pt = t - .55, [qx, qy] = pt < 0 ? [1045, 3300 - pt * 1000] : pos(pt); police(qx, qy, pt < 0 ? -Math.PI / 2 : heading(pt), t); }
  X.restore();
  // HUD
  radar(t, x, y); money(t); phoneUI(t); shopUI(t);
  if (t > T.gratis - .05 && t < 4.45) { const k = back(A(t, T.gratis - .05, .2), 2.4); X.save(); X.translate(540, 760); X.rotate(-.08); X.scale(k, k); anton('GRATIS', 0, 0, 230, '#3ae07a'); X.restore(); }
  if (t < .5) { X.save(); X.translate(540, 760); const k = back(A(t, 0, .2), 2.2); X.scale(k, k); anton('GTA 6', 0, 0, 260, '#ff5d8f'); X.restore(); }
  if (t > T.linkBio) { const k = back(A(t, T.linkBio - .05, .25), 2.4); X.save(); X.translate(540, 720); X.scale(k, k); anton('LINK IN BIO', 0, 0, 150, '#ffd23a'); X.translate(0, -190 + Math.sin(t * 8) * 14); X.fillStyle = '#ffd23a'; X.strokeStyle = '#120d14'; X.lineWidth = 8; X.beginPath(); X.moveTo(0, -90); X.lineTo(80, 0); X.lineTo(30, 0); X.lineTo(30, 70); X.lineTo(-30, 70); X.lineTo(-30, 0); X.lineTo(-80, 0); X.closePath(); X.fill(); X.stroke(); X.restore(); }
  if (t > 19.75 && t < 99) { const a = A(t, 19.9, .3); if (a > 0) { X.save(); X.globalAlpha = a; X.fillStyle = 'rgba(18,13,20,.85)'; X.beginPath(); X.roundRect(140, 360, 800, 100, 20); X.fill(); X.font = "700 62px 'JB Mono'"; X.fillStyle = '#fff'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(CODE, 540, 412); X.restore(); } }
  if (t < .08) { X.fillStyle = `rgba(255,255,255,${.6 * (1 - t / .08)})`; X.fillRect(0, 0, W, H); }
}

const EV = [], ev = (t, type, o = {}) => EV.push({ t: +t.toFixed(3), type, ...o });
ev(0, 'boom'); ev(0, 'siren'); ev(.1, 'engine'); ev(.85, 'skid'); ev(2.2, 'engine'); ev(T.gratis - .05, 'boom');
ev(4.45, 'whoosh'); ev(6.2, 'tap'); ev(T.buddy + .1, 'ok'); for (let i = 0; i < 6; i++) ev(7.4 + i * .09, 'tap', { v: .6 }); ev(T.amico, 'ok'); ev(8.5, 'whoosh');
for (let i = 0; i < 6; i++) ev(9.0 + i * .155, 'cash', { v: .6 }); ev(T.ottanta, 'boom'); ev(T.ottanta + .02, 'cash');
ev(11.5, 'skid'); ev(12.6, 'whoosh'); ev(T.prezzo, 'hit'); ev(13.3, 'ok'); ev(T.avanza, 'ting'); ev(15.8, 'whoosh');
ev(16.05, 'whoosh'); for (let i = 0; i < CODE.length; i++) ev(17.5 + i * .1, 'tap', { v: .45 }); ev(T.ottanta2, 'cash'); ev(T.gratis2 - .05, 'boom');
ev(23.5, 'engine'); for (const h of [T.cinquanta0, T.c1, T.c2, T.c3]) { ev(h - .9, 'engine', { v: .6 }); ev(h, 'cash'); }
ev(T.linkBio - .05, 'boom'); ev(T.linkBio, 'siren');
EV.sort((a, b) => a.t - b.t);
function TEXTS(t) { return t > 20.2 ? [{ id: 'code', text: CODE, x0: 140, y0: 360, x1: 940, y1: 460 }] : []; }
Object.assign(window, { DUR, render, EV, TEXTS });
Promise.all([loadMouth(), document.fonts.load("40px 'Anton'"), document.fonts.load("700 40px 'JB Mono'")]).then(() => document.fonts.ready).then(() => { render(0); window.READY = true; });
