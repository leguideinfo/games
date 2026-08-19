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


/* ---------- flotte en orbite ---------- */
/* Plan de disposition de la flotte : la planète au centre, trois anneaux
   (Basse / Moyenne / Haute orbite) portant des CRÉNEAUX qui tournent chacun
   à leur vitesse. Taper un créneau libre y déploie un chasseur disponible ;
   taper un vaisseau en orbite le rappelle au sol. L'affectation vit sur
   l'unité (u.orb = "anneau:index") : sauvegardée avec la partie, et un
   chasseur en orbite n'est plus disponible au sol — disposer sa flotte est
   un vrai choix. Accès : la CARTE, en tapant sa propre colonie. */
const ORB_ANNEAUX = [
  { nm: "Basse", n: 6, v: 0.10, k: 1.9 },
  { nm: "Moyenne", n: 8, v: -0.065, k: 2.55 },
  { nm: "Haute", n: 10, v: 0.045, k: 3.2 },
];
const ORB_APLAT = 0.40; // perspective des ellipses
function orbRayon() { return Math.min(W, H) * 0.115; }
function orbSlotPos(r, i, t) {
  const A = ORB_ANNEAUX[r], rp = orbRayon();
  const a = (i / A.n) * Math.PI * 2 + t / 1000 * A.v;
  return { x: W / 2 + Math.cos(a) * rp * A.k, y: H * 0.46 + Math.sin(a) * rp * A.k * ORB_APLAT, a };
}
function orbShipAt(r, i) {
  const k = r + ":" + i;
  return S.units.find((u) => u.orb === k) || null;
}
function orbLibres() { return S.units.filter((u) => u.t === "chasseur" && !u.orb && !u.busy); }
function orbDeploie(r, i) {
  if (orbShipAt(r, i)) return false;
  const u = orbLibres()[0];
  if (!u) { toast("Aucun chasseur disponible — assemble-en à la <b>Forge</b>."); sfx.deny(); return false; }
  u.orb = r + ":" + i;
  sfx.build(); save();
  toast("🚀 Chasseur déployé en <b>orbite " + ORB_ANNEAUX[r].nm.toLowerCase() + "</b>.");
  return true;
}
function orbRappelle(r, i) {
  const u = orbShipAt(r, i);
  if (!u) return false;
  delete u.orb;
  sfx.ui(); save();
  toast("🛬 Chasseur rappelé au sol — il reprend la défense de la colonie.");
  return true;
}
function orbPlanete(x, y, r) {
  const g = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 5, x, y, r);
  g.addColorStop(0, "#e8b070"); g.addColorStop(0.65, "#b3743c"); g.addColorStop(1, "#4a2c14");
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();
  const sh = ctx.createLinearGradient(x - r, y, x + r, y);
  sh.addColorStop(0, "rgba(4,6,15,0)"); sh.addColorStop(0.75, "rgba(4,6,15,0)"); sh.addColorStop(1, "rgba(4,6,15,.7)");
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(120,190,255,.22)"; ctx.lineWidth = 2; ctx.stroke();
}
function orbVaisseau(x, y, a) { // le chasseur, orienté le long de son orbite
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -8); ctx.lineTo(5.5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5.5, 6);
  ctx.closePath();
  ctx.fillStyle = "#e8e6e0"; ctx.fill();
  ctx.strokeStyle = "#82878f"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 6.5, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = "#38a9ff"; ctx.shadowColor = "#38a9ff"; ctx.shadowBlur = 7;
  ctx.fill(); ctx.shadowBlur = 0;
  ctx.restore();
}
function drawOrbit(t) {
  ctx.fillStyle = "#060913"; ctx.fillRect(0, 0, W, H);
  for (const s of STARS) {
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t / 900 + s.tw);
    ctx.fillStyle = "#cfe6ff";
    ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
  }
  ctx.globalAlpha = 1;
  const cx = W / 2, cy = H * 0.46, rp = orbRayon();
  for (let r = 0; r < ORB_ANNEAUX.length; r++) {
    const A = ORB_ANNEAUX[r];
    ctx.beginPath();
    ctx.ellipse(cx, cy, rp * A.k, rp * A.k * ORB_APLAT, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(78,180,255,.18)";
    ctx.lineWidth = 1; ctx.setLineDash([4, 8]); ctx.lineDashOffset = -t / 90;
    ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "10px " + UI_FONT; ctx.textAlign = "center";
    ctx.fillStyle = "rgba(139,160,181,.55)";
    const la = Math.PI * 1.13; // sous-gauche : les trois noms s'étagent
    ctx.fillText(A.nm.toUpperCase(),
      cx + Math.cos(la) * rp * A.k, cy + Math.sin(la) * rp * A.k * ORB_APLAT + 12);
  }
  // moitié ARRIÈRE des créneaux, la planète, puis la moitié AVANT :
  // la profondeur de l'orbite se lit d'elle-même
  const passes = [[], []];
  for (let r = 0; r < ORB_ANNEAUX.length; r++)
    for (let i = 0; i < ORB_ANNEAUX[r].n; i++) {
      const p = orbSlotPos(r, i, t);
      passes[p.y < cy ? 0 : 1].push([r, i, p]);
    }
  const libres = orbLibres().length;
  const dessine = ([r, i, p]) => {
    const u = orbShipAt(r, i);
    ctx.globalAlpha = p.y < cy ? 0.62 : 1; // l'arrière est atténué
    if (u) orbVaisseau(p.x, p.y, p.a);
    else {
      const pulse = 0.25 + 0.15 * Math.sin(t / 400 + i + r * 3);
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(78,242,224," + (libres ? pulse + 0.15 : pulse * 0.5).toFixed(2) + ")";
      ctx.lineWidth = 1.2; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  };
  passes[0].forEach(dessine);
  orbPlanete(cx, cy, rp);
  passes[1].forEach(dessine);
  const enOrb = S.units.filter((u) => u.orb).length;
  ctx.textAlign = "center"; ctx.font = "12px " + UI_FONT;
  ctx.fillStyle = "#e6eef5";
  ctx.fillText("DISPOSITION DE LA FLOTTE — " + enOrb + " en orbite · " + libres + " en réserve au sol", cx, H - 88);
  ctx.fillStyle = "#8ba0b5"; ctx.font = "11px " + UI_FONT;
  ctx.fillText(libres ? "Tape un créneau libre pour déployer un chasseur · tape un vaisseau pour le rappeler"
                      : (enOrb ? "Tape un vaisseau pour le rappeler au sol"
                               : "Assemble des Chasseurs à la Forge pour constituer ta flotte"), cx, H - 70);
  ctx.font = "12px " + UI_FONT;
  ctx.fillStyle = "#38a9ff"; ctx.textAlign = "center";
  ctx.fillText("◀ CARTE DU SECTEUR", cx, 64);
  ctx.textAlign = "left";
}
function orbTape(sx, sy) {
  if (Math.abs(sx - W / 2) < 110 && sy > 40 && sy < 84) { view = "map"; setTab("map"); sfx.ui(); return; }
  let best = null, bd = 1e9;
  for (let r = 0; r < ORB_ANNEAUX.length; r++)
    for (let i = 0; i < ORB_ANNEAUX[r].n; i++) {
      const p = orbSlotPos(r, i, performance.now());
      const d = Math.hypot(p.x - sx, p.y - sy);
      if (d < bd) { bd = d; best = [r, i]; }
    }
  if (!best || bd > 26) return;
  if (orbShipAt(best[0], best[1])) orbRappelle(best[0], best[1]);
  else orbDeploie(best[0], best[1]);
}
