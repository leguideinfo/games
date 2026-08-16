/* ---------- restauration d'archives : vrais puzzles d'image ---------- */
function drawEarthImage() {
  const c = document.createElement("canvas");
  c.width = 330; c.height = 330;
  const g = c.getContext("2d");
  const r = mulberry32(4242);
  g.fillStyle = "#04060f"; g.fillRect(0, 0, 330, 330);
  for (let i = 0; i < 90; i++) {
    g.globalAlpha = 0.3 + r() * 0.7;
    g.fillStyle = "#cfe6ff";
    g.fillRect(r() * 330, r() * 330, 1.6, 1.6);
  }
  g.globalAlpha = 1;
  const cx = 165, cy = 165, R = 150;
  const sp = g.createRadialGradient(cx - 40, cy - 40, 20, cx, cy, R);
  sp.addColorStop(0, "#7ec8ff"); sp.addColorStop(0.55, "#2a7fd4"); sp.addColorStop(1, "#0a2a5e");
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fillStyle = sp; g.fill();
  g.save();
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip();
  const blob = (x, y, w, h, col) => {
    g.fillStyle = col;
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.3; a += 0.45) {
      const rr = 1 + (r() - 0.5) * 0.55;
      const px = x + Math.cos(a) * w * rr, py = y + Math.sin(a) * h * rr;
      a === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
    }
    g.closePath(); g.fill();
  };
  blob(cx - 70, cy - 45, 68, 50, "#3f9d5a");
  blob(cx + 55, cy + 18, 52, 65, "#4aa863");
  blob(cx - 15, cy + 90, 52, 26, "#c9a06a");
  blob(cx + 20, cy - 98, 40, 20, "#e8f4ff");
  blob(cx - 95, cy + 45, 30, 35, "#3f9d5a");
  g.fillStyle = "rgba(255,255,255,.5)";
  for (let i = 0; i < 8; i++) {
    const a = r() * Math.PI * 2, d = r() * R * 0.8;
    g.beginPath();
    g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 34 + r() * 28, 8 + r() * 6, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const sh = g.createLinearGradient(cx - R, cy, cx + R, cy);
  sh.addColorStop(0, "rgba(2,4,12,0)"); sh.addColorStop(0.7, "rgba(2,4,12,0)"); sh.addColorStop(1, "rgba(2,4,12,.75)");
  g.fillStyle = sh;
  g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  g.restore();
  g.beginPath(); g.arc(cx, cy, R + 4, 0, Math.PI * 2);
  g.strokeStyle = "rgba(140,200,255,.8)"; g.lineWidth = 3;
  g.shadowColor = "#7ec8ff"; g.shadowBlur = 18;
  g.stroke(); g.shadowBlur = 0;
  return c.toDataURL("image/png");
}
function drawForestImage() {
  const c = document.createElement("canvas");
  c.width = 330; c.height = 330;
  const g = c.getContext("2d");
  const r = mulberry32(777);
  const sky = g.createLinearGradient(0, 0, 0, 235);
  sky.addColorStop(0, "#f6c877"); sky.addColorStop(0.5, "#f2a35f"); sky.addColorStop(1, "#d97f4e");
  g.fillStyle = sky; g.fillRect(0, 0, 330, 235);
  g.beginPath(); g.arc(165, 185, 40, 0, Math.PI * 2);
  g.fillStyle = "#fff2c8"; g.shadowColor = "#ffd98a"; g.shadowBlur = 45; g.fill(); g.shadowBlur = 0;
  g.fillStyle = "#3e5a3a";
  g.beginPath(); g.moveTo(0, 210);
  for (let x = 0; x <= 330; x += 28) g.lineTo(x, 196 + r() * 20);
  g.lineTo(330, 240); g.lineTo(0, 240); g.closePath(); g.fill();
  const tri = (x, base, w, h, col) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(x, base); g.lineTo(x + w / 2, base - h); g.lineTo(x + w, base);
    g.closePath(); g.fill();
  };
  for (let x = -10; x < 330; x += 34) tri(x + r() * 8, 252 + r() * 6, 36, 58 + r() * 18, "#274d2c");
  for (let x = -16; x < 330; x += 46) {
    const bx = x + r() * 10, base = 300 + r() * 8;
    g.fillStyle = "#5a3a1f"; g.fillRect(bx + 20, base - 6, 7, 14);
    tri(bx, base, 48, 86 + r() * 22, "#356e38");
  }
  g.fillStyle = "#2c4526"; g.fillRect(0, 300, 330, 30);
  g.fillStyle = "rgba(255,240,220,.26)";
  for (const my of [252, 276]) {
    g.beginPath(); g.ellipse(165 + (r() - 0.5) * 80, my, 150, 9, 0, 0, Math.PI * 2); g.fill();
  }
  return c.toDataURL("image/png");
}
function drawCityImage() {
  const c = document.createElement("canvas");
  c.width = 330; c.height = 330;
  const g = c.getContext("2d");
  const r = mulberry32(909);
  const sky = g.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, "#1c2f5e"); sky.addColorStop(0.55, "#6e5aa8"); sky.addColorStop(1, "#e8825a");
  g.fillStyle = sky; g.fillRect(0, 0, 330, 250);
  for (let i = 0; i < 40; i++) {
    g.globalAlpha = 0.4 + r() * 0.6;
    g.fillStyle = "#e8f0ff";
    g.fillRect(r() * 330, r() * 110, 1.4, 1.4);
  }
  g.globalAlpha = 1;
  g.beginPath(); g.arc(245, 238, 26, 0, Math.PI * 2);
  g.fillStyle = "#ffd9a0"; g.shadowColor = "#ffd9a0"; g.shadowBlur = 30; g.fill(); g.shadowBlur = 0;
  // skyline arrière
  g.fillStyle = "#1a2440";
  for (let x = 0; x < 330; x += 26) {
    const h = 55 + r() * 70;
    g.fillRect(x, 250 - h, 24, h);
  }
  // skyline avant + fenêtres
  const lit = [];
  for (let x = -8; x < 330; x += 38) {
    const w = 26 + r() * 12, h = 85 + r() * 85, bx = x + r() * 6;
    g.fillStyle = "#0e1630";
    g.fillRect(bx, 250 - h, w, h);
    let on = false;
    g.fillStyle = "#ffd98a";
    for (let wy = 250 - h + 8; wy < 242; wy += 11) {
      for (let wx = bx + 4; wx < bx + w - 5; wx += 8) {
        if (r() < 0.55) { g.fillRect(wx, wy, 4, 5); on = true; }
      }
    }
    if (on) lit.push(bx + w / 2);
  }
  // eau + reflets
  const wa = g.createLinearGradient(0, 250, 0, 330);
  wa.addColorStop(0, "#141c38"); wa.addColorStop(1, "#080d1e");
  g.fillStyle = wa; g.fillRect(0, 250, 330, 80);
  g.fillStyle = "rgba(255,217,138,.3)";
  for (const lx of lit) {
    for (let y = 254; y < 326; y += 7) g.fillRect(lx - 2 + (r() - 0.5) * 6, y, 4, 3);
  }
  g.fillStyle = "rgba(255,217,160,.35)";
  for (let y = 254; y < 326; y += 6) g.fillRect(243 + (r() - 0.5) * 8, y, 6, 3);
  return c.toDataURL("image/png");
}
function drawOceanImage() {
  const c = document.createElement("canvas");
  c.width = 330; c.height = 330;
  const g = c.getContext("2d");
  const r = mulberry32(2606);
  const sky = g.createLinearGradient(0, 0, 0, 150);
  sky.addColorStop(0, "#8fd0f0"); sky.addColorStop(1, "#d8eefa");
  g.fillStyle = sky; g.fillRect(0, 0, 330, 150);
  g.beginPath(); g.arc(268, 52, 22, 0, Math.PI * 2);
  g.fillStyle = "#fff2b8"; g.shadowColor = "#fff2b8"; g.shadowBlur = 24; g.fill(); g.shadowBlur = 0;
  g.fillStyle = "rgba(255,255,255,.9)";
  for (const [nx, ny, nw] of [[60, 48, 30], [150, 78, 24], [248, 108, 20]]) {
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(nx + i * nw * 0.5, ny + (i % 2) * 4, nw * (0.5 + r() * 0.3), 0, Math.PI * 2); g.fill(); }
  }
  g.strokeStyle = "#5a6a78"; g.lineWidth = 2;
  for (const [mx, my] of [[95, 98], [122, 84], [205, 62]]) {
    g.beginPath(); g.moveTo(mx - 7, my); g.quadraticCurveTo(mx - 2, my - 5, mx, my); g.quadraticCurveTo(mx + 2, my - 5, mx + 7, my); g.stroke();
  }
  const sea = g.createLinearGradient(0, 150, 0, 330);
  sea.addColorStop(0, "#2f7fb8"); sea.addColorStop(1, "#0d3a66");
  g.fillStyle = sea; g.fillRect(0, 150, 330, 180);
  g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2;
  for (let y = 165; y < 325; y += 14) {
    g.beginPath();
    let px = -10 + r() * 20;
    g.moveTo(px, y);
    while (px < 340) { const seg = 18 + r() * 30; g.quadraticCurveTo(px + seg / 2, y - 4, px + seg, y); px += seg + 8 + r() * 26; g.moveTo(px, y); }
    g.stroke();
  }
  // voilier
  g.fillStyle = "#8a4b2f";
  g.beginPath(); g.moveTo(120, 216); g.lineTo(186, 216); g.lineTo(172, 230); g.lineTo(132, 230); g.closePath(); g.fill();
  g.strokeStyle = "#4a3a30"; g.lineWidth = 3;
  g.beginPath(); g.moveTo(152, 216); g.lineTo(152, 152); g.stroke();
  g.fillStyle = "#f6f2ea";
  g.beginPath(); g.moveTo(156, 156); g.quadraticCurveTo(196, 190, 158, 212); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(148, 162); g.quadraticCurveTo(118, 192, 146, 212); g.closePath(); g.fill();
  return c.toDataURL("image/png");
}
function drawMountainImage() {
  const c = document.createElement("canvas");
  c.width = 330; c.height = 330;
  const g = c.getContext("2d");
  const r = mulberry32(2707);
  const sky = g.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, "#274b8a"); sky.addColorStop(1, "#e8b8c8");
  g.fillStyle = sky; g.fillRect(0, 0, 330, 330);
  g.fillStyle = "#7688b0";
  g.beginPath(); g.moveTo(0, 235);
  g.lineTo(55, 150); g.lineTo(120, 235); g.lineTo(190, 140); g.lineTo(260, 235); g.lineTo(330, 175); g.lineTo(330, 235);
  g.closePath(); g.fill();
  const peak = (px, py, w, col) => {
    g.fillStyle = col;
    g.beginPath(); g.moveTo(px - w, 280); g.lineTo(px, py); g.lineTo(px + w, 280); g.closePath(); g.fill();
    g.fillStyle = "#f4f7fc";
    g.beginPath();
    g.moveTo(px, py);
    g.lineTo(px - w * 0.32, py + (280 - py) * 0.34);
    g.lineTo(px - w * 0.14, py + (280 - py) * 0.27);
    g.lineTo(px, py + (280 - py) * 0.4);
    g.lineTo(px + w * 0.15, py + (280 - py) * 0.26);
    g.lineTo(px + w * 0.32, py + (280 - py) * 0.34);
    g.closePath(); g.fill();
  };
  peak(95, 92, 105, "#3c4f78");
  peak(235, 70, 120, "#465a88");
  g.fillStyle = "#17324a";
  g.fillRect(0, 278, 330, 52);
  for (let x = -6; x < 336; x += 13) {
    const h = 26 + r() * 22;
    g.fillStyle = r() < 0.5 ? "#1d4258" : "#245068";
    g.beginPath(); g.moveTo(x - 8, 292); g.lineTo(x, 292 - h); g.lineTo(x + 8, 292); g.closePath(); g.fill();
  }
  return c.toDataURL("image/png");
}
function drawMoonImage() {
  const c = document.createElement("canvas");
  c.width = 330; c.height = 330;
  const g = c.getContext("2d");
  const r = mulberry32(2808);
  g.fillStyle = "#04060f"; g.fillRect(0, 0, 330, 330);
  for (let i = 0; i < 90; i++) {
    g.globalAlpha = 0.3 + r() * 0.7;
    g.fillStyle = "#eaf2ff";
    g.fillRect(r() * 330, r() * 235, 1.4, 1.4);
  }
  g.globalAlpha = 1;
  // la Terre qui se lève
  g.save();
  g.beginPath(); g.arc(226, 96, 46, 0, Math.PI * 2); g.clip();
  g.fillStyle = "#1c63b8"; g.fillRect(180, 50, 92, 92);
  g.fillStyle = "#2e9e5b";
  for (let i = 0; i < 7; i++) {
    g.beginPath(); g.ellipse(186 + r() * 80, 56 + r() * 80, 8 + r() * 14, 5 + r() * 9, r() * 3, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = "rgba(255,255,255,.5)";
  for (let i = 0; i < 10; i++) {
    g.beginPath(); g.ellipse(184 + r() * 84, 52 + r() * 88, 5 + r() * 7, 1.6 + r() * 1.6, r() * 0.8 - 0.4, 0, Math.PI * 2); g.fill();
  }
  const sh = g.createLinearGradient(180, 0, 272, 0);
  sh.addColorStop(0, "rgba(2,4,12,.6)"); sh.addColorStop(0.45, "rgba(2,4,12,0)");
  g.fillStyle = sh; g.fillRect(180, 50, 92, 92);
  g.restore();
  g.strokeStyle = "rgba(140,190,255,.35)"; g.lineWidth = 3;
  g.beginPath(); g.arc(226, 96, 47, 0, Math.PI * 2); g.stroke();
  // sol lunaire
  const gr = g.createLinearGradient(0, 200, 0, 330);
  gr.addColorStop(0, "#b9bcc4"); gr.addColorStop(1, "#70747e");
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(0, 236);
  g.quadraticCurveTo(90, 208, 180, 226);
  g.quadraticCurveTo(260, 240, 330, 222);
  g.lineTo(330, 330); g.lineTo(0, 330); g.closePath(); g.fill();
  for (let i = 0; i < 12; i++) {
    const cxp = 15 + r() * 300, cyp = 248 + r() * 70, cr = 5 + r() * 14;
    g.fillStyle = "rgba(70,74,84,.55)";
    g.beginPath(); g.ellipse(cxp, cyp, cr, cr * 0.55, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(235,238,244,.5)"; g.lineWidth = 2;
    g.beginPath(); g.ellipse(cxp, cyp - 2, cr, cr * 0.55, 0, Math.PI, Math.PI * 2); g.stroke();
  }
  return c.toDataURL("image/png");
}
function drawRocketImage() {
  const c = document.createElement("canvas");
  c.width = 330; c.height = 330;
  const g = c.getContext("2d");
  const r = mulberry32(1407);
  const sky = g.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, "#080e2c"); sky.addColorStop(0.6, "#2b3670"); sky.addColorStop(1, "#c07a52");
  g.fillStyle = sky; g.fillRect(0, 0, 330, 330);
  for (let i = 0; i < 60; i++) {
    g.globalAlpha = 0.3 + r() * 0.7;
    g.fillStyle = "#eaf2ff";
    g.fillRect(r() * 330, r() * 200, 1.5, 1.5);
  }
  g.globalAlpha = 1;
  const cx = 158;
  // panache de flamme
  const fl = g.createLinearGradient(0, 205, 0, 305);
  fl.addColorStop(0, "#fffbe0"); fl.addColorStop(0.35, "#ffcf5e"); fl.addColorStop(0.75, "#ff7a3c"); fl.addColorStop(1, "rgba(255,90,40,0)");
  g.fillStyle = fl;
  g.beginPath();
  g.moveTo(cx - 15, 205);
  g.bezierCurveTo(cx - 26, 250, cx - 8, 285, cx, 305);
  g.bezierCurveTo(cx + 8, 285, cx + 26, 250, cx + 15, 205);
  g.closePath(); g.fill();
  g.shadowColor = "#ffb066"; g.shadowBlur = 26;
  g.fillStyle = "#fff3c8";
  g.beginPath(); g.ellipse(cx, 214, 11, 20, 0, 0, Math.PI * 2); g.fill();
  g.shadowBlur = 0;
  // corps blanc + nez rouge
  g.fillStyle = "#e8ecf4";
  g.beginPath();
  g.moveTo(cx - 22, 200); g.lineTo(cx - 22, 110);
  g.quadraticCurveTo(cx - 22, 58, cx, 40);
  g.quadraticCurveTo(cx + 22, 58, cx + 22, 110);
  g.lineTo(cx + 22, 200); g.closePath(); g.fill();
  g.fillStyle = "#d6483c";
  g.beginPath();
  g.moveTo(cx - 22, 92);
  g.quadraticCurveTo(cx - 22, 58, cx, 40);
  g.quadraticCurveTo(cx + 22, 58, cx + 22, 92);
  g.closePath(); g.fill();
  // hublot
  g.beginPath(); g.arc(cx, 122, 12, 0, Math.PI * 2);
  g.fillStyle = "#20325c"; g.fill();
  g.lineWidth = 4; g.strokeStyle = "#aeb8cc"; g.stroke();
  // ailerons
  g.fillStyle = "#d6483c";
  g.beginPath(); g.moveTo(cx - 22, 150); g.quadraticCurveTo(cx - 48, 185, cx - 40, 205); g.lineTo(cx - 22, 196); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(cx + 22, 150); g.quadraticCurveTo(cx + 48, 185, cx + 40, 205); g.lineTo(cx + 22, 196); g.closePath(); g.fill();
  // tuyère
  g.fillStyle = "#8a93a8"; g.fillRect(cx - 12, 198, 24, 10);
  // sol + nuages de fumée
  g.fillStyle = "#2a1d22"; g.fillRect(0, 298, 330, 32);
  for (let i = 0; i < 26; i++) {
    const sx = 30 + r() * 270, sy = 285 + r() * 30, sr = 14 + r() * 26;
    g.globalAlpha = 0.5 + r() * 0.4;
    g.fillStyle = i % 3 ? "#cfc4bf" : "#efe6df";
    g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
  return c.toDataURL("image/png");
}
const REST = {
  2: { nm: "La Terre", cap: "Archive 002 · La Terre — c'était chez nous.", make: drawEarthImage, n: 3 },
  3: { nm: "La forêt", cap: "Archive 003 · La forêt — on respirait sous les arbres.", make: drawForestImage, n: 3 },
  4: { nm: "La ville", cap: "Archive 004 · Une ville — des millions de vies qui s'allumaient le soir.", make: drawCityImage, n: 4 },
  5: { nm: "La fusée", cap: "Archive 005 · Le décollage — un jour, l'humanité a quitté le sol.", make: drawRocketImage, n: 5 },
  6: { nm: "L'océan", cap: "Archive 006 · L'océan — la mer chantait sur toute la planète.", make: drawOceanImage, n: 6 },
  7: { nm: "La montagne", cap: "Archive 007 · Les sommets — la neige couronnait le monde.", make: drawMountainImage, n: 6 },
  8: { nm: "La Lune", cap: "Archive 008 · Depuis la Lune — la première fois qu'on s'est vus de loin.", make: drawMoonImage, n: 7 },
};
let rest = null;
function rePos(i, n) {
  const st = 100 / (n - 1);
  return (i % n) * st + "% " + Math.floor(i / n) * st + "%";
}
function openRestore(id) {
  closeSheets();
  const def = REST[id];
  const url = def.make();
  const n = def.n;
  const order = Array.from({ length: n * n }, (_, i) => i);
  const r = mulberry32(id * 337 + 5);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  rest = { id, def, url, n, order, sel: null, placed: new Set() };
  const board = $("#re-board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
  for (let i = 0; i < n * n; i++) {
    const d = document.createElement("div");
    d.className = "rslot";
    d.dataset.i = i;
    d.onclick = () => reTry(i);
    board.appendChild(d);
  }
  reTray();
  $("#re-cap").textContent = "Choisis un morceau, puis tape sa place.";
  $("#sh-restore").hidden = false;
}
function reTray() {
  const tr = $("#re-tray");
  tr.innerHTML = "";
  tr.classList.toggle("dense", rest.n >= 5 && rest.n < 7);
  tr.classList.toggle("dense2", rest.n >= 7);
  if (rest.sel == null || rest.placed.has(rest.sel)) {
    rest.sel = null;
    for (const i of rest.order) if (!rest.placed.has(i)) { rest.sel = i; break; }
  }
  for (const i of rest.order) {
    if (rest.placed.has(i)) continue;
    const b = document.createElement("button");
    b.className = "rpiece" + (rest.sel === i ? " sel" : "");
    b.style.backgroundImage = "url(" + rest.url + ")";
    b.style.backgroundSize = rest.n * 100 + "% " + rest.n * 100 + "%";
    b.style.backgroundPosition = rePos(i, rest.n);
    b.onclick = () => { rest.sel = i; sfx.ui(); reTray(); };
    tr.appendChild(b);
  }
}
function reTry(slot) {
  if (!rest || rest.sel == null) return;
  if (slot !== rest.sel) {
    sfx.deny();
    $("#re-board").classList.remove("shake");
    void $("#re-board").offsetWidth;
    $("#re-board").classList.add("shake");
    return;
  }
  const d = $("#re-board").children[slot];
  d.classList.add("filled", "glow");
  d.style.backgroundImage = "url(" + rest.url + ")";
  d.style.backgroundSize = rest.n * 100 + "% " + rest.n * 100 + "%";
  d.style.backgroundPosition = rePos(slot, rest.n);
  rest.placed.add(slot);
  beep(420 + rest.placed.size * 30, 0.08, "square", 0.035);
  reTray();
  $("#re-cap").textContent = rest.placed.size + " / " + (rest.n * rest.n) + " morceaux";
  if (rest.placed.size >= rest.n * rest.n) reReveal();
}
function reReveal() {
  const { id, def } = rest;
  const board = $("#re-board");
  [...board.children].forEach((d, i) => {
    setTimeout(() => { d.classList.remove("glow"); void d.offsetWidth; d.classList.add("glow"); }, 60 * i);
  });
  sfx.tech();
  $("#re-cap").textContent = "🖼 " + def.cap;
  if (!S.restored.includes(id)) {
    S.restored.push(id);
    const rw = 5 + 5 * id;
    S.eo = Math.min(eoCap(), S.eo + rw);
    setTimeout(() => toast("🖼 Archive restaurée : <b>" + def.nm + "</b> +" + rw + " Eo.", true), 1400);
  }
  save();
  setTimeout(() => { if (!$("#sh-restore").hidden) openArch(); }, 3600);
}

function openAsm() {
  closeSheets();
  const zone = $("#asm-slots");
  zone.innerHTML = "";
  ASM.forEach((slot, si) => {
    const d = document.createElement("div");
    d.className = "asm-slot";
    d.innerHTML = "<div class='sl-nm'>" + slot.nm + "</div>";
    const order = [si % 3, (si + 1) % 3, (si + 2) % 3];
    order.forEach((oi) => {
      const o = slot.opts[oi];
      const b = document.createElement("button");
      b.className = "asm-opt" + (asmSel[si] === oi ? " sel" : "");
      b.textContent = o.l;
      b.dataset.slot = si; b.dataset.opt = oi;
      b.onclick = () => { asmSel[si] = oi; sfx.ui(); openAsm(); };
      d.appendChild(b);
    });
    zone.appendChild(d);
  });
  $("#asm-log").innerHTML = "";
  $("#sh-asm").hidden = false;
}
$("#asm-boot").onclick = () => {
  audioInit();
  const log = $("#asm-log");
  // sélections complètes ?
  for (let i = 0; i < ASM.length; i++) {
    if (asmSel[i] == null) {
      log.innerHTML = "<span class='err'>POST interrompu : aucun composant « " + ASM[i].nm + " » installé.</span>";
      sfx.deny();
      return;
    }
  }
  // compatibilité (premier défaut, message pédagogique)
  for (let i = 0; i < ASM.length; i++) {
    const o = ASM[i].opts[asmSel[i]];
    if (!o.ok) {
      log.innerHTML = "<span class='err'>POST échoué — " + ASM[i].nm + " : " + o.why + ".</span>";
      sfx.deny();
      return;
    }
  }
  if (S.mat < ASM_COST.m || S.eo < ASM_COST.e) {
    log.innerHTML = "<span class='err'>Ressources insuffisantes (200 💠 + 20 Eo).</span>";
    sfx.deny();
    return;
  }
  S.mat -= ASM_COST.m; S.eo -= ASM_COST.e;
  const lines = [
    "POST… <span class='ok'>OK</span>",
    "CPU 6c/12t @ 3,6 GHz… <span class='ok'>OK</span>",
    "Mémoire 64 Go DDR4… <span class='ok'>OK</span>",
    "RAID 1 NVMe synchronisé… <span class='ok'>OK</span>",
    "Liaison 1 Gbit/s… <span class='ok'>OK</span>",
    "<span class='ok'>SYSTÈME D'ÉPOQUE EN LIGNE.</span>",
  ];
  log.innerHTML = "";
  lines.forEach((l, i) => {
    setTimeout(() => {
      log.innerHTML += l + "<br>";
      beep(400 + i * 90, 0.06, "square", 0.03);
      if (i === lines.length - 1) {
        S.reader = true;
        sfx.tech();
        toast("🖥 <b>Système d'époque en ligne.</b> Les Archives attendent.", true);
        save();
        setTimeout(() => { openArch(); }, 900);
      }
    }, 450 * i);
  });
};

