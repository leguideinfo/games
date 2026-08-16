/* ---------- entrées canvas ---------- */
let pd = null, dragged = false, pinch = null;
cv.addEventListener("pointerdown", (e) => {
  audioInit();
  pd = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, id: e.pointerId };
  dragged = false;
});
cv.addEventListener("pointermove", (e) => {
  if (place && !place.drag && !pd && view === "col" && e.pointerType === "mouse") {
    const r = cv.getBoundingClientRect();
    place.lift = 0;
    movePlaceScreen(e.clientX - r.left, e.clientY - r.top);
    syncPlaceUI();
    return;
  }
  if (!pd || e.pointerId !== pd.id || view !== "col") return;
  const dx = e.clientX - pd.x, dy = e.clientY - pd.y;
  if (Math.abs(dx) + Math.abs(dy) > 10) dragged = true;
  if (dragged) { cam.x = pd.cx + dx; cam.y = pd.cy + dy; clampCam(); }
});
cv.addEventListener("pointerup", (e) => {
  if (!pd || e.pointerId !== pd.id) { pd = null; return; }
  const wasDragged = dragged;
  pd = null; dragged = false;
  if (wasDragged) return;
  const r = cv.getBoundingClientRect();
  const sx = e.clientX - r.left, sy = e.clientY - r.top;
  if (view === "map") {
    for (const n of NEIGH) {
      if (n.sx != null && Math.hypot(sx - n.sx, sy - n.sy) < 26) {
        toast("Colonie voisine <b>« " + n.nm + " »</b> — visites & fédérations : à venir (multi asynchrone).");
        sfx.ui();
        return;
      }
    }
    return;
  }
  // mode câblage : relier deux machines
  if (wire) {
    const tpw = s2w(sx, sy);
    let k = null;
    if (tpw.x === SRC.x && tpw.y === SRC.y) k = "src";
    else { const bw = bldAtScreen(sx, sy); if (bw) k = keyOf(bw); }
    if (!k) { toast("Tape un <b>bâtiment</b> ou la <b>Source</b> à câbler."); return; }
    if (!wire.a) {
      wire.a = k;
      sfx.ui();
      toast("🔌 <b>" + nodeAt(k).nm + "</b> — choisis l'autre extrémité.");
      return;
    }
    const err = addLink(wire.a, k);
    if (err) { sfx.deny(); toast("🔌 " + err); }
    else toast("🔌 Câble posé <b>(10 💠)</b>.");
    wire.a = null;
    return;
  }
  // parasites
  for (const m of mobs) {
    if (m.sx != null && !m.atk && Math.hypot(sx - m.sx, sy - m.sy) < 26) {
      const u = S.units.find((v) => v.t === "chasseur" && !v.busy);
      if (!u) { toast("Il te faut un <b>Chasseur</b> — assemble-le à la Forge."); sfx.deny(); return; }
      u.busy = true;
      m.atk = { u, t0: performance.now() };
      sfx.fireMob();
      return;
    }
  }
  // orbes d'abord
  for (const o of orbs) {
    if (o.sx != null && Math.hypot(sx - o.sx, sy - o.sy) < 24) {
      collectOrb(o, false);
      return;
    }
  }
  // pose armée : viser (1er tap) puis confirmer (2e tap au même endroit)
  if (place) {
    const now = performance.now();
    /* 2e tap « au même endroit » : en pose libre, l'égalité de case ne veut plus
       rien dire — on compare la DISTANCE ÉCRAN au fantôme (24 px, la taille d'un
       doigt), tolérance qui vaut aussi pour la souris */
    const pf = w2s(place.hx, place.hy);
    const surLeFantome = Math.hypot(sx - pf.x, sy - pf.y) < 24;
    if (place.aimed && surLeFantome && now - place.lastTap >= 250) {
      commitPlace();
    } else {
      place.lift = 0;
      movePlaceScreen(sx, sy, e.pointerType !== "mouse");
      place.aimed = true; place.lastTap = now;
      sfx.ui();
      syncPlaceUI();
    }
    return;
  }
  const tp = s2w(sx, sy);
  if (tp.x === SRC.x && tp.y === SRC.y) { openSource(); return; }
  const b = bldAtScreen(sx, sy);
  if (b) { openBld(b); return; }
  // amas de cristaux : envoyer un drone ouvrier de la soute
  if (inB(tp.x, tp.y) && tileAt(tp.x, tp.y).kind === "crystal" &&
      S.units.some((u) => u.t === "recolteur" && u.x === tp.x && u.y === tp.y)) {
    toast("🛸 Un drone travaille déjà ici — <b>💠 " + Math.ceil(crysStock(tp.x, tp.y)) + "</b> restant.");
    return;
  }
  if (inB(tp.x, tp.y) && tileAt(tp.x, tp.y).kind === "crystal" &&
      !S.units.some((u) => u.x === tp.x && u.y === tp.y)) {
    if ((S.dr || 0) > 0) {
      S.dr--;
      S.units.push({ t: "recolteur", x: tp.x, y: tp.y,
        fly: { x0: SRC.x, y0: SRC.y, t0: performance.now(), dur: 1100 } });
      sfx.build();
      const gsz = ["petit", "moyen", "grand"][crysSize(tp.x, tp.y)];
      toast("🛸 Drone en route vers le gisement " + gsz + " — <b>💠 " +
        Math.ceil(crysStock(tp.x, tp.y)) + "</b> à extraire" +
        (S.dr > 0 ? " · " + S.dr + " en soute." : "."), true);
      missionDone("drone1");
      save();
    } else if (!bcount("forge")) {
      toast("Plus de drone en soute — la <b>Forge d'assemblage</b> en produira, plus tard.");
    } else {
      toast("Plus de drone en soute — assemble-en à la <b>Forge</b>.");
    }
    return;
  }
  if (buildable(tp.x, tp.y)) {
    openBuild(tp);
  } else if (inB(tp.x, tp.y) && S.mi >= 6 && tileAt(tp.x, tp.y).kind === "crevasse") {
    openCrevasse(tp);
  } else if (inB(tp.x, tp.y) && tileAt(tp.x, tp.y).kind === "montagne") {
    toast("⛰ <b>La chaîne de montagnes</b> — trop escarpé pour bâtir.");
    sfx.deny();
  } else if (inB(tp.x, tp.y) && tileAt(tp.x, tp.y).kind === "lac") {
    toast("🌊 <b>Le Grand Lac</b> — de l'eau libre sur une planète morte. On n'y bâtit rien.");
    sfx.ui();
  } else if (inB(tp.x, tp.y) && S.mi >= 6 && tileAt(tp.x, tp.y).kind === "caillou") {
    openRubble(tp);
  } else {
    closeSheets();
    selTile = null;
  }
});
// molette + pinch
cv.addEventListener("wheel", (e) => {
  e.preventDefault();
  zoomAt(e.deltaY < 0 ? 1.12 : 0.89);
}, { passive: false });
cv.addEventListener("touchstart", (e) => {
  if (e.touches.length === 2) {
    pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  }
}, { passive: true });
cv.addEventListener("touchmove", (e) => {
  if (e.touches.length === 2 && pinch) {
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    if (place && place.drag) cancelPlace(true);
    zoomAt(d / pinch);
    pinch = d;
  }
}, { passive: true });
cv.addEventListener("touchend", () => { pinch = null; });
function zoomAt(f) {
  if (view !== "col") return;
  const zb = zBounds();
  const nz = clamp(cam.z * f, zb.lo, zb.hi);
  const cxs = W / 2, cys = H / 2;
  cam.x = cxs - (cxs - cam.x) * (nz / cam.z);
  cam.y = cys - (cys - cam.y) * (nz / cam.z);
  cam.z = nz;
  clampCam();
}
$("#z-in").onclick = () => zoomAt(1.25);
$("#buildbtn").onclick = () => {
  if (place) { cancelPlace(); return; }
  if (paletteVide()) { sfx.deny(); toast("✨ Récolte des éclats pour <b>amorcer le HUB-01</b>."); return; }
  sfx.ui(); openBuild(null);
};
$("#placebar .ok").onclick = () => commitPlace();
$("#placebar .cancel").onclick = () => cancelPlace();
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && place) cancelPlace(); });
$("#wirebtn").onclick = () => {
  if (place) cancelPlace(true);
  wire = wire ? null : { a: null };
  $("#wirebtn").classList.toggle("on", !!wire);
  toast(wire ? "🔌 <b>Mode câblage</b> : tape deux machines à relier (10 💠 le câble)." : "Mode câblage terminé.");
};
$("#z-out").onclick = () => zoomAt(0.8);

