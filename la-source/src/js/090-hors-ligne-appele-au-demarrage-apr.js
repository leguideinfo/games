/* ---------- hors-ligne (appelé au démarrage, après init complète) ---------- */
function offlineGains() {
  const el = (Date.now() - (S.lastSeen || Date.now())) / 1000;
  if (el < 30 || !S.buildings.length) return;
  const capT = S.techs.includes("backup") ? 24 * 3600 : 2 * 3600;
  const b0 = S.buffMult; S.buffMult = 1;
  const t = Math.min(el, capT);
  // Matériaux : production des bâtiments, simplement écrêtée par la soute.
  const gm = Math.max(0, Math.min(matRate() * t, matCap() - S.mat));
  // Cristaux : les drones ont miné pendant l'absence. Pas de plafond à écrêter
  // (les cristaux n'en ont pas), mais le gisement reste FINI — on ne prend que
  // ce qu'il contient, et il s'épuise pour de bon s'il se vide.
  let gc = 0;
  for (let i = S.units.length - 1; i >= 0; i--) {
    const u = S.units[i];
    if (u.t !== "recolteur" || tileAt(u.x, u.y).kind !== "crystal") continue;
    const st = crysStock(u.x, u.y);
    if (st <= 0) continue;
    const take = Math.min(st, CRX_V * (crysSize(u.x, u.y) + 1) * t);
    S.crx[u.x + "," + u.y] = st - take;
    gc += take;
    if (S.crx[u.x + "," + u.y] <= 0.01) crysDeplete(u.x, u.y, i);
  }
  const ge = Math.max(0, Math.min(eoRate() * Math.min(el, capT), eoCap() - S.eo));
  S.buffMult = b0;
  if (gm > 1 || ge > 0.5 || gc > 1) {
    S.mat += gm; S.eo += ge; S.cry = (S.cry || 0) + gc;
    const bouts = [];
    if (gc > 1) bouts.push("<b>+" + fmt(gc) + " 💎</b>");
    if (gm > 1) bouts.push("<b>+" + fmt(gm) + " 💠</b>");
    if (ge > 0.5) bouts.push("<b>+" + fmt(ge) + " Eo</b>");
    setTimeout(() => toast("Pendant ton absence : " + bouts.join(" · ")), 1200);
  }
  S.buffLeft = 0; S.buffMult = 1;
  save();
}

