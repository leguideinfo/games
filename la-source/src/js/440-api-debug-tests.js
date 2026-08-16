/* ---------- API debug/tests ---------- */
window.__api = {
  screenOf(x, y) { return w2s(x, y); },
  buildableAt(x, y) { return buildable(anc(x), anc(y)); },
  tileKind(x, y) { return tileAt(x, y).kind; },
  build(t, x, y) {
    if (!posable(t, x, y)) return false;
    S.mat -= buildCost(t);
    S.buildings.push(newBld(t, x, y, 1));
    postBuild(t);
    save(); return true;
  },
  giveMat(n) { S.mat = Math.min(matCap(), S.mat + n); },
  orbsPos() { return orbs.filter((o) => o.sx != null).map((o) => ({ sx: o.sx, sy: o.sy, tx: o.x, ty: o.y })); },
  mobsPos() { return mobs.filter((m) => m.sx != null && !m.atk).map((m) => ({ sx: m.sx, sy: m.sy, tx: m.x, ty: m.y })); },
  center(x, y) { const c = w2s(x, y); cam.x += W / 2 - c.x; cam.y += H / 2 - c.y; clampCam(); },
  placeArm(kind, t, mv) { return armPlace(kind, t, mv ? { mv: S.buildings.find((b) => b.t === mv), hx: 0, hy: 0 } : undefined); },
  placeAt(x, y) { movePlaceTile(x, y); return place ? { x: place.hx, y: place.hy, valid: place.valid, why: place.why } : null; },
  placeState() { return place ? { kind: place.kind, t: place.t, x: place.hx, y: place.hy, snap: !!place.snap, valid: place.valid, why: place.why } : null; },
  // pose libre : viser un point d'ÉCRAN (l'aimant joue), comme un vrai pointeur
  placeAtScreen(sx, sy, tactile) { movePlaceScreen(sx, sy, !!tactile); return place ? { x: place.hx, y: place.hy, snap: !!place.snap, valid: place.valid, why: place.why } : null; },
  bldAtScreen(sx, sy) { const b = bldAtScreen(sx, sy); return b ? { id: b.id, t: b.t, x: b.x, y: b.y } : null; },
  screenOfPos(x, y) { return w2s(x, y); },
  bldList() { return S.buildings.map((b) => ({ id: b.id, t: b.t, x: b.x, y: b.y, l: b.l })); },
  placeCommit() { return commitPlace(); },
  placeCancel() { cancelPlace(true); },
  posableAt(t, x, y) { return posableWhy(t, x, y); },
  moveCostOf(t) { const b = S.buildings.find((x2) => x2.t === t); return b ? moveCost(b) : 0; },
  link(ax, ay, bx, by) { return addLink(ax === "src" ? "src" : nkey(ax, ay), bx === "src" ? "src" : nkey(bx, by)); },
  autolink() {
    for (const b of S.buildings) {
      const k = keyOf(b);
      if (netConnected(k)) continue;
      if (!addLink(k, "src")) continue;
      for (const o of S.buildings) {
        const ko = keyOf(o);
        if (ko !== k && netConnected(ko) && !addLink(k, ko)) break;
      }
    }
  },
  simDone() { missionDone("sim1"); },
  netInfo() { if (netDirty) netRecalc(); return { links: S.links.length, connected: netSet.size }; },
  assemble(k) { const f = S.buildings.find((b) => b.t === "forge"); if (f) assemble(k, f); },
  asmOk() { return ASM.map((sl) => sl.opts.findIndex((o) => o.ok)); },
  droneRun(ax, ay, bx, by) { return !!drSpawn([ax, ay], [bx, by]); },
  droneInfo() {
    return DRONES.filter((d) => d.on).map((d) => ({
      phase: d.phase, wx: +d.wx.toFixed(2), wy: +d.wy.toFixed(2),
      alt: +d.alt.toFixed(2), dirs: d.dirs, retour: d.retour,
    }));
  },
  crysAt(x, y) { return { sz: crysSize(x, y), max: crysMax(x, y), stock: crysStock(x, y) }; },
  crysSet(x, y, v) { S.crx[x + "," + y] = v; },
  crysSizes() {
    const n = [0, 0, 0];
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++)
      if (tileAt(x, y).kind === "crystal") n[crysSize(x, y)]++;
    return n;
  },
  crystalsAll() {
    const out = [];
    for (let y = bmin(); y <= bmax(); y++) for (let x = bmin(); x <= bmax(); x++) {
      if (tileAt(x, y).kind === "crystal" && !S.units.some((u) => u.x === x && u.y === y)) {
        out.push(Object.assign({ tx: x, ty: y }, w2s(x, y)));
      }
    }
    return out;
  },
  turboWin() { S.buffMult = 1.5; S.buffLeft = 120; missionDone("turbo"); },
  frenzy() { startFrenzy(); },
  bootHub() { S.hubBoot = true; save(); },
  atlHint() {
    if (!atl || atl.sel == null) return null;
    const c = atl.pieces[atl.sel].cells[0];
    const r = $("#at-grid").children[c[1] * atl.W + c[0]].getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  },
  rePlaceHint() {
    if (!rest || rest.sel == null) return false;
    reTry(rest.sel);
    return true;
  },
  atlPlaceHint() {
    if (!atl || atl.sel == null) return false;
    const c = atl.pieces[atl.sel].cells[0];
    atlTry(c[0], c[1]);
    return true;
  },
  giveEo(n) { S.eo = Math.min(eoCap(), S.eo + n); },
  research(k) { if (!S.techs.includes(k)) { S.techs.push(k); if (k === "dns") unlockMap(); missionDone("tech_" + k); save(); } },
  reset() { localStorage.removeItem(SAVE_KEY); location.reload(); },
};

