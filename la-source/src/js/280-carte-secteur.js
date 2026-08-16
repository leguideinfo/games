/* ---------- carte secteur ---------- */
const NEIGH = [];
{
  const r = mulberry32(777);
  const names = ["Nova-3", "Kern", "Aster-9", "Bel-Ouri", "Cinder", "Drift-2", "Ohm", "Vega-Lys"];
  names.forEach((nm, i) => {
    const a = (i / names.length) * Math.PI * 2 + r() * 0.6;
    const d = 0.24 + r() * 0.2;
    NEIGH.push({ nm, a, d, s: 0.6 + r() * 0.8, link: r() > 0.4 });
  });
}
const STARS = [];
{
  const r = mulberry32(42);
  for (let i = 0; i < 120; i++) STARS.push({ x: r(), y: r(), s: r() * 1.6 + 0.4, tw: r() * 6 });
}
function drawMap(t) {
  ctx.fillStyle = "#060913"; ctx.fillRect(0, 0, W, H);
  for (const s of STARS) {
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t / 900 + s.tw);
    ctx.fillStyle = "#cfe6ff";
    ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
  }
  ctx.globalAlpha = 1;
  const cx = W / 2, cy = H / 2;
  // liens
  for (const n of NEIGH) {
    if (!n.link) continue;
    const nx = cx + Math.cos(n.a) * n.d * W * 1.6, ny = cy + Math.sin(n.a) * n.d * H;
    ctx.strokeStyle = "rgba(56,169,255,.18)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]); ctx.lineDashOffset = -t / 60;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
    ctx.setLineDash([]);
  }
  // voisins
  ctx.textAlign = "center"; ctx.font = "10px " + UI_FONT;
  for (const n of NEIGH) {
    const nx = cx + Math.cos(n.a) * n.d * W * 1.6, ny = cy + Math.sin(n.a) * n.d * H;
    n.sx = nx; n.sy = ny;
    ctx.beginPath(); ctx.arc(nx, ny, 4 * n.s, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(139,160,181,.8)"; ctx.fill();
    ctx.fillStyle = "#8ba0b5";
    ctx.fillText(n.nm, nx, ny + 16);
  }
  // toi
  ctx.beginPath(); ctx.arc(cx, cy, 8 + 2 * Math.sin(t / 300), 0, Math.PI * 2);
  ctx.fillStyle = "#38a9ff"; ctx.shadowColor = "#38a9ff"; ctx.shadowBlur = 22;
  ctx.fill(); ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = "#eaffff"; ctx.fill();
  ctx.fillStyle = "#e6eef5";
  ctx.fillText("L'Étincelle (toi)", cx, cy + 26);
}

