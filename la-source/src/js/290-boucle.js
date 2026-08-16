/* ---------- boucle ---------- */
let lastT = performance.now(), acc = 0;
// Boucle « qui dort » : le dessin tournait à 60 fps en continu même colonie figée
// (profil perf 16/08). On garde 60 fps dès qu'il se passe quelque chose, sinon on
// tombe à ~22 fps pour l'ambiance. lastDrawT = dernier dessin ; _pcx/y/z = caméra
// précédente (pour détecter un pan/zoom).
let lastDrawT = 0, _pcx = 0, _pcy = 0, _pcz = 0;
/* FOND STATIQUE sur CANVAS EMPILÉ (retour profils Firefox 16/08). wallpaper +
   terrainTex + zones + dunes + lac + chemins + tuiles ne changent qu'au déplacement
   caméra (ou pose/déplacement de bâtiment, extension de territoire). Or drawTerrainTex
   fait 3 passes de fusion PLEIN ÉCRAN (saturation/multiply/overlay) que Firefox
   rasterise sans GPU. On les rend UNE fois sur le canvas de fond (#cv-bg), keyé sur
   l'état ; le compositeur GPU superpose #cv-bg et #cv — AUCUNE copie par image (le
   blit drawImage coûtait 33 % sur Firefox). Rien ne s'y anime (vérifié : aucune de
   ces fonctions n'utilise le temps). */
function staticKey(){
  return [W, H, DPR.toFixed(2), Math.round(cam.x), Math.round(cam.y), cam.z.toFixed(4),
          view, bmin(), bmax(), S.buildings.length, S.links.length,
          duneSet.size, fertSet.size, S.cleared.length,
          // état de chargement des textures du fond : tant qu'un asset n'est pas
          // décodé, drawWallpaper/drawTerrainTex/drawZone/... sortent sans rien
          // peindre. En incluant leurs .ok dans la clé, le fond se REPEINT dès
          // qu'une texture arrive (sinon il restait en aplat jusqu'au 1er pan —
          // retour 16/08). Se stabilise dès que tout est chargé (aucun re-render ensuite).
          "" + (WALL.ok?1:0) + (TILE.ok?1:0) + (FERT.ok?1:0) + (DUNE.ok?1:0) + (LAC.ok?1:0) + (VART.ok?1:0),
          S.buildings.map(b => b.id + ":" + b.x + "," + b.y + ":" + b.t).join("_")].join("|");
}
function drawStaticLayer(t){
  const key = staticKey();
  if (key === sKey && cvbg.width === cv.width && cvbg.height === cv.height){
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return;                           // fond inchangé : #cv-bg est déjà à l'écran, rien à redessiner
  }
  sKey = key;
  if (cvbg.width !== cv.width || cvbg.height !== cv.height){ cvbg.width = cv.width; cvbg.height = cv.height; }
  const real = ctx;
  ctx = bgctx;                        // dessiner sur le canvas de FOND empilé (pas d'offscreen, pas de copie)
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  drawWallpaper();
  drawTerrainTex();
  drawZone(FERT, FERT_CX, FERT_CY, -0.30, -0.30, 0.50, 0.86);
  drawDunes();
  drawLac();
  drawPaths();
  for (let y = bmin(); y <= bmax(); y++) for (let x = bmin(); x <= bmax(); x++) drawTile(x, y, t);
  ctx = real;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
let cryEnvoye = -1;   // dernier total de cristaux annoncé au jeu principal
function frame(t) {
  healCanvas();
  const dt = Math.min((t - lastT) / 1000, 0.1);
  lastT = t;
  // Matériaux et Données : en MIROIR ce sont ceux du jeu principal (recalés par
  // message), la production locale ne tire donc pas dessus.
  if (!MIRROR) {
    S.mat = Math.min(matCap(), S.mat + matRate() * dt);
    S.eo = Math.min(eoCap(), S.eo + eoRate() * dt);
  }
  // Les CRISTAUX 💎, eux, se minent sur le plateau — miroir compris : c'est la
  // seule monnaie qu'on y gagne, et le seul geste qui la produit. L'extraction
  // (et le respawn des gisements) tourne donc TOUJOURS : sans cela le compteur
  // du gisement restait figé et le drone n'était jamais rappelé en soute.
  S.cry = (S.cry || 0) + cryRate() * dt;
  tickExtraction(dt);
  tickRespawn(dt);
  tickDrones(dt, t);
  if (S.buffLeft > 0) {
    S.buffLeft -= dt;
    if (S.buffLeft <= 0) { S.buffLeft = 0; S.buffMult = 1; }
  }
  // orbes
  acc += dt;
  const orbEvery = S.mi < 5 ? 2.2 : 7;
  if (acc > orbEvery) {
    acc = 0;
    // les éclats émergent AUSSI en miroir : le tuto du plateau se rejoue pour
    // tout le monde (retour user 14/08), sa toute première étape en dépend
    if (orbs.length < (S.mi < 5 ? 4 : 3)) {
      // éclats de matériaux : la planète les fait émerger, surtout près des cristaux
      let spot = null;
      for (let i = 0; i < 24; i++) {
        const x = bmin() + 1 + rnd(bmax() - bmin() - 1), y = bmin() + 1 + rnd(bmax() - bmin() - 1);
        if (!buildable(x, y) || !fpLibre(x, y, FP_UNIT) || orbs.some((o) => o.x === x && o.y === y)) continue;
        if (crysAdj(x, y) > 0) { spot = { x, y }; break; }
        if (!spot) spot = { x, y };
      }
      if (spot) orbs.push({ x: spot.x, y: spot.y, val: 6 + 2 * colonyLevel(), born: t });
    }
    save();
  }
  // éboulis : réapparition lente (max 3, ~4 min)
  if (S.mi >= 6 && Date.now() - S.lastRubble > 240000) {
    S.lastRubble = Date.now();
    if (S.rubble.length < 3) {
      for (let i = 0; i < 20; i++) {
        const x = bmin() + rnd(bmax() - bmin() + 1), y = bmin() + rnd(bmax() - bmin() + 1);
        if (buildable(x, y) && fpLibre(x, y, 0.45)) { rubbleSet.add(x + "," + y); S.rubble = [...rubbleSet]; save(); break; }
      }
    }
  }
  // parasites aux frontières (fin de chaîne de missions)
  if (S.mi >= 25) {
    mobT += dt;
    if (mobT > 55 && mobs.length < 2) { mobT = 0; spawnMob(); }
  }
  // combats en cours
  for (const m of [...mobs]) {
    if (!m.atk) continue;
    const el2 = (performance.now() - m.atk.t0) / 2200;
    const u = m.atk.u;
    const fp = w2s(u.x, u.y), tp = w2s(m.x, m.y);
    if (el2 < 1) {
      u.anim = { x: fp.x + (tp.x - fp.x) * el2, y: fp.y - 26 * cam.z + (tp.y - fp.y) * el2 };
    } else {
      const reward = 40 + 10 * colonyLevel();
      burst(tp.x, tp.y, "#ff4d8a");
      S.mat = Math.min(matCap(), S.mat + reward);
      toast("🚀 Parasite éliminé : <b>+" + reward + " 💠</b>", true);
      sfx.up();
      mobs = mobs.filter((x) => x !== m);
      u.anim = null; u.busy = false;
      missionDone("mob_kill");
      save();
    }
  }
  if (S.techs.includes("dhcp") || dhcpOnline()) {
    for (const o of [...orbs]) {
      if (t - o.born > 3500) collectOrb(o, true);
    }
  }
  if (place) {
    if (place.drag) { // auto-défilement quand le doigt approche d'un bord
      const M = 52, SP = 6;
      let mx = 0, my = 0;
      if (place.psx < M) mx = SP; else if (place.psx > W - M) mx = -SP;
      if (place.psy < M + 60) my = SP; else if (place.psy > H - M - 120) my = -SP;
      if (mx || my) { cam.x += mx; cam.y += my; clampCam(); movePlaceScreen(place.psx, place.psy, place.tactile); }
    }
    evalPlace();
  }
  // rendu — au repos on lève le pied : 60 fps si quelque chose bouge, sinon ~22 fps
  // (profil perf 16/08 : le dessin tournait à 60 fps en continu même colonie figée).
  const camMoved = cam.x !== _pcx || cam.y !== _pcy || cam.z !== _pcz;
  _pcx = cam.x; _pcy = cam.y; _pcz = cam.z;
  const _busy = place || mobs.length || fx.length || orbs.length || S.buffLeft > 0 ||
                MIRROR_Q.length || camMoved || S.units.some((u) => u.anim);
  if (t - lastDrawT >= (_busy ? 0 : 45)) {
    lastDrawT = t;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (view === "col") {
    drawStaticLayer(t);        // terrain -> #cv-bg (redessiné seulement si l'état change)
    ctx.clearRect(0, 0, W, H); // #cv : transparent, on n'y pose que les sprites (#cv-bg apparaît dessous)
    drawPlaceHalo(t);
    // (les conduits pointillés bâtiment → Source ont été retirés — retour
    //  propriétaire ; seuls restent les câbles réseau posés par le joueur)
    for (const l of S.links) drawCable(l, t);
    const drawables = S.buildings.map((b) => ({ d: b.x + b.y, b }));
    for (let y = bmin(); y <= bmax(); y++) for (let x = bmin(); x <= bmax(); x++) {
      const k2 = tileAt(x, y).kind;
      if (k2 === "crystal" && CRX.ok)
        drawables.push({ d: x + y, deco: "crys", x, y });
      else if (k2 === "caillou" && ROCK.ok)
        drawables.push({ d: x + y, deco: "rock", x, y });
      // décor libre : pas sous un bâtiment ni sous une unité
      else if (k2 === "sand" && CAI.ok) {
        /* semis de cailloux : masque par EMPREINTE au point reellement dessine
           (le caillou est decale de ±0,31 dans sa case), et trie a SA profondeur —
           sinon un caillou de la case voisine se peignait par-dessus un socle
           pose a cheval */
        const c = caiAt(x, y);
        if (c && !S.units.some((u) => u.x === x && u.y === y) &&
            !S.buildings.some((b2) => { const h = fpOf(b2.t, b2.x, b2.y) / 2 + 0.15;
              return Math.abs(b2.x - (x + c.ox)) < h && Math.abs(b2.y - (y + c.oy)) < h; }))
          drawables.push({ d: (x + c.ox) + (y + c.oy) - 0.001, deco: "cai", x, y });
      }
    }
    if (place) drawables.push({ d: place.hx + place.hy + 0.02, ghost: true });
    // EN VOL le drone est devant tout le décor (trié à wx+wy, il passait
    // derrière la montagne et disparaissait) ; POSÉ sur la balise, il reprend
    // un tri normal pour s'insérer proprement entre les bâtiments.
    for (const dr2 of DRONES) if (dr2.on) drawables.push({ d: dr2.alt > 0.05 ? 1e6 : dr2.wx + dr2.wy + 0.03, dr16: dr2 });
    // chantiers du jeu principal (mode miroir) : fantômes translucides + minuterie
    for (const q of MIRROR_Q) if (!q.up) drawables.push({ d: q.x + q.y + 0.01, mq: q });
    drawables.push({ d: SRC.x + SRC.y - 0.01, src: true });
    if (MONT.ok) drawables.push({ d: MONT_FRONT, mont: true });   // montagne triée comme un sprite haut
    drawables.sort((a, b) => a.d - b.d);
    for (const it of drawables) {
      if (it.ghost) drawPlaceGhost(t);
      else if (it.mq) { ctx.save(); ctx.globalAlpha = 0.45; drawBuilding({ t: it.mq.t, x: it.mq.x, y: it.mq.y, l: 1 }, t); ctx.restore(); }
      else if (it.mont) drawZone(MONT, MONT_CX, MONT_CY, 0, 0, 0.62, 1, true);
      else if (it.src) drawSource(t);
      else if (it.deco === "crys") drawCrystalSprite(it.x, it.y);
      else if (it.deco === "rock") drawRockSprite(it.x, it.y);
      else if (it.deco === "cai") drawCaillou(it.x, it.y);
      else if (it.dr16) drawDrone16(it.dr16, t);
      else drawBuilding(it.b, t);
    }
    for (const q of MIRROR_Q) drawMirrorTimer(q);   // minuterie par-dessus tout (chantier ET amélioration)
    for (const o of orbs) drawOrb(o, t);
    for (const m of mobs) drawMob(m, t);
    for (const u of S.units) drawUnit(u, t);
    drawGuide(t);
    drawCrevasseHint(t);
    for (const f of [...fx]) {
      f.life -= dt;
      if (f.life <= 0) { fx = fx.filter((x) => x !== f); continue; }
      f.x += f.vx * dt; f.y += f.vy * dt;
      ctx.globalAlpha = Math.max(0, f.life / 0.6);
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x, f.y, 3, 3);
    }
    ctx.globalAlpha = 1;
  } else {
    // vue carte : on efface le canvas de fond (le terrain ne doit pas transparaître)
    if (sKey){ bgctx.setTransform(1, 0, 0, 1, 0, 0); bgctx.clearRect(0, 0, cvbg.width, cvbg.height); sKey = ""; }
    drawMap(t);
  }
  }
  // Cristaux : monnaie du plateau, TOUJOURS locale (miroir compris) — elle ne
  // vient jamais du Chantier, elle se mine ici.
  setTxt("cry", fmt(S.cry || 0));
  setTxt("pw", fmt(S.pw || 0));
  const cr = cryRate();
  setTxt("cryrate", cr > 0 ? "+" + (cr * 60).toFixed(0) + "/min" : "à miner");
  /* …et on les remonte au HUD du jeu principal quand on y est embarqué : les
     cristaux sont la monnaie de la colonie, pas un compteur de coin d'écran.
     Émis à l'ENTIER près et seulement quand il change — inutile d'inonder
     l'hôte de messages pour des décimales qu'il n'affiche pas. */
  if (EMBED) {
    const entier = Math.floor(S.cry || 0);
    if (entier !== cryEnvoye) {
      cryEnvoye = entier;
      try { window.parent.postMessage({ type: "awoui:cristaux", total: entier }, "*"); } catch (e) {}
    }
  }
  // HUD — en MIROIR, les autres compteurs affichent le jeu principal (message res)
  if (MIRROR && MIRROR_RES) {
    setTxt("mat", fmt(MIRROR_RES.mat));
    setTxt("matcap", "/ " + fmt(MIRROR_RES.matCap));
    setTxt("matrate", "registre du Chantier");
    setTxt("eo", fmt(MIRROR_RES.dat));
    setTxt("eocap", "/ " + fmt(MIRROR_RES.datCap));
    setTxt("eorate", "Eo");
    setTxt("en", fmt(MIRROR_RES.eUsed) + "/" + fmt(MIRROR_RES.eCap));
  } else {
  setTxt("mat", fmt(S.mat));
  setTxt("matcap", "/ " + fmt(matCap()));
  setTxt("matrate", "+" + fmt(matRate() * 60) + "/min");
  setTxt("eo", fmt(S.eo));
  setTxt("eocap", "/ " + fmt(eoCap()));
  setTxt("eorate", "+" + (eoRate() * 60).toFixed(1) + "/min");
  setTxt("en", fmt(enUse()) + "/" + fmt(enCap()));
  }
  setTxt("buff", S.buffLeft > 0
    ? "SURCHARGE ×" + S.buffMult.toFixed(2) + " · " + Math.ceil(S.buffLeft) + "s"
    : (mobs.length ? "🕷 parasite : −15 %" : ""));
  setTxt("clevel", colonyLevel());
  missionTick();   // le tuto du plateau tourne TOUJOURS, miroir compris (il s'y rejoue)
  if (t - lastGatesT > 250) { refreshGates(); lastGatesT = t; }
  requestAnimationFrame(frame);
}

