/* ---------- moteur de pose : viser, voir, confirmer ----------
   Trois chemins mènent à la même pose : glisser une carte sur le terrain,
   choisir puis viser puis ✅, ou (chemin historique) case présélectionnée +
   bouton prix. Rien n'est débité tant que la pose n'est pas confirmée. */
function placeCost(pl) {
  if (!pl) return { mat: 0, eo: 0 };
  if (pl.kind === "move") return { mat: moveCost(pl.mv), eo: 0 };
  if (pl.kind === "unit") return { mat: UT[pl.t].cost, eo: UT[pl.t].ceo };
  return { mat: buildCost(pl.t), eo: buildCostEo(pl.t) };
}
function placeNom(pl) {
  if (!pl) return "";
  if (pl.kind === "unit") return UT[pl.t].nm;
  return BT[pl.t].nm;
}
function evalPlace() {
  if (!place) return;
  let r;
  if (place.kind === "unit") r = posableUnit(place.hx, place.hy);
  else r = posableWhy(place.t, place.hx, place.hy, place.mv || null);
  if (r.ok && !MIRROR) {   // miroir : ressources ET énergie se jugent au Chantier du jeu principal, jamais localement
    const c = placeCost(place);
    if (S.mat < c.mat || S.eo < c.eo) r = { ok: false, why: "Pas assez de ressources" };
    else if (place.kind === "bld" && enUse(BT[place.t].conso) > enCap())
      r = { ok: false, why: "⚡ insuffisante — améliore la Centrale" };
  }
  place.valid = r.ok; place.why = r.why || ""; place.bx = r.bx; place.by = r.by;
}
// meilleure case de départ : valide, proche de la Source, et visible à l'écran
function bestTile(pl) {
  let best = null, bd = 1e9;
  for (let y = bmin(); y <= bmax(); y++) for (let x = bmin(); x <= bmax(); x++) {
    const ok = pl.kind === "unit" ? posableUnit(x, y).ok : posable(pl.t, x, y, pl.mv || null);
    if (!ok) continue;
    const p = w2s(x, y);
    const vu = p.x > 40 && p.x < W - 40 && p.y > 130 && p.y < H - 190;
    const d = Math.hypot(x - SRC.x, y - SRC.y) + (vu ? 0 : 40);
    if (d < bd) { bd = d; best = { x, y, vu }; }
  }
  return best;
}
function armPlace(kind, t, opt) {
  opt = opt || {};
  if (kind === "bld") {   // le tuto du plateau gouverne la découverte, miroir compris
    if ((BT[t].mAt || 0) > S.mi) return false;
  }
  wire = null; $("#wirebtn").classList.remove("on");
  place = { kind, t, mv: opt.mv || null, hx: 0, hy: 0, valid: false, why: "",
            drag: false, ptrId: null, psx: 0, psy: 0, lift: 0,
            aimed: false, lastTap: 0 };
  let sx = opt.hx, sy = opt.hy;
  if (sx === -999) { place.hx = -999; place.hy = -999; evalPlace(); closeSheets(); syncPlaceUI(); return true; }
  if (sx == null) {
    let b = bestTile(place);
    /* bestTile ne candidate que des cases entieres : avec des voisins poses en
       pose libre, toutes peuvent etre « trop pres » alors qu'une place existe a
       mi-case. On cherche alors en continu autour de la Source avant de renoncer. */
    if (!b && place.kind !== "unit") {
      const alt = placeLibreProche(place.t, SRC.x, SRC.y, place.mv || null, bmax() - bmin() + 1);
      if (alt) b = { x: alt.x, y: alt.y, vu: false };
    }
    if (!b) { place = null; sfx.deny(); toast("Aucune place libre — étends le territoire."); return false; }
    sx = b.x; sy = b.y;
    if (!b.vu) centerCam(sx, sy);
  }
  movePlaceTile(sx, sy);   // pose hx/hy, calcule l'aimant (le halo dit vrai des le depart) et evalue
  closeSheets();
  syncPlaceUI();
  return true;
}
function movePlaceTile(x, y) {
  if (!place) return;
  // les drones vivent sur des cases entieres ; les batiments au millieme de case
  if (place.kind === "unit") { x = Math.round(x); y = Math.round(y); } else { x = quant(x); y = quant(y); }
  place.hx = x; place.hy = y;
  place.snap = (x === Math.round(x) && y === Math.round(y));
  evalPlace();
}
/* Le fantôme suit le pointeur EN CONTINU (pose libre) — sauf les drones, qui
   vivent sur des cases entières et restent aimantés d'office. Le type de pointeur
   est retenu : l'auto-défilement rejoue la position chaque frame et doit garder
   le même seuil d'aimant que le geste en cours. */
function movePlaceScreen(sx, sy, tactile) {
  if (!place) return;
  place.psx = sx; place.psy = sy; place.tactile = !!tactile;
  const f = s2wF(sx, sy - place.lift);
  if (place.kind === "unit") { movePlaceTile(Math.round(f.x), Math.round(f.y)); return; }
  const a = aimante(f, !!tactile);
  place.hx = a.x; place.hy = a.y; place.snap = a.snap;
  evalPlace();
}
/* Quel bâtiment est SOUS ce point d'écran ? Par EMPREINTE, plus par égalité de
   case : en pose libre un sprite déborde de sa case d'ancrage, et taper son
   bord doit ouvrir sa fiche, pas la palette de la case voisine. Si plusieurs
   empreintes contiennent le point (la marge FP_MARGE laisse un liseré partagé),
   la plus petite gagne : c'est elle qu'on visait. Repli sur l'ancre pour les
   positions entières héritées et pour l'e2e qui vise « la case ». */
function bldAtScreen(sx, sy) {
  const f = s2wF(sx, sy);
  let best = null, bs = 1e9;
  for (const b of S.buildings) {
    const s = fpOf(b.t, b.x, b.y) / 2 + 0.06;   // un peu d'air : la base est plus large que l'empreinte
    if (Math.abs(f.x - b.x) < s && Math.abs(f.y - b.y) < s && s < bs) { best = b; bs = s; }
  }
  if (best) return best;
  /* Repli sur l'ANCRE, avec deux garde-fous trouves en revue :
     - jamais sur une case de gisement, caillou ou crevasse : un petit module
       ancre sur la case d'un petit cristal capturait le tap destine au cristal
       (plus moyen d'y envoyer un drone) ;
     - si plusieurs modules partagent la case, le plus PROCHE du point tape,
       pas le premier de la liste. */
  const ax = Math.round(f.x), ay = Math.round(f.y);
  if (tileAt(ax, ay).kind !== "sand") return null;
  let near = null, nd = 1e9;
  for (const b of S.buildings) if (anc(b.x) === ax && anc(b.y) === ay) {
    const d = Math.hypot(b.x - f.x, b.y - f.y);
    if (d < nd) { nd = d; near = b; }
  }
  return near;
}
function cancelPlace(silence) {
  if (!place) return;
  place = null;
  syncPlaceUI();
  if (!silence) sfx.ui();
}
function commitPlace() {
  if (!place) return false;
  /* MIROIR — deux cas, et deux seulement (modèle voulu par l'utilisateur) :
     · le plan est DÉJÀ au registre du Chantier → il est « en attente de pose » :
       on le pose ICI, gratuitement, DIRECTEMENT à son niveau du Chantier ;
     · il n'y est pas → la demande part au Chantier (qui juge soutes, énergie et
       file) et le fantôme minuté reviendra s'installer sur LA CASE choisie.
     Les modules propres au plateau (Hub, Switch…) suivent la voie normale plus
     bas : ils sont gratuits en miroir et c'est le tuto qui les cadence. */
  if (MIRROR && place.kind === "bld") {
    const stock = mirrorStock(place.t);
    if (stock) {
      evalPlace();
      if (!place.valid) { sfx.deny(); if (place.why) toast(place.why); return false; }
      const b = newBld(place.t, place.hx, place.hy, stock);
      S.buildings.push(b);
      MIRROR_LAYOUT[b.t] = { x: b.x, y: b.y }; saveLayout();
      netDirty = true; place = null; syncPlaceUI(); sfx.build();
      burst(w2s(b.x, b.y).x, w2s(b.x, b.y).y, BT[b.t].col);
      toast("📦 <b>" + BT[b.t].nm + "</b> sorti des soutes et posé — <b>NIV " + stock + "</b>, comme au Chantier.", true);
      save();
      return true;
    }
    if (mirrorKnown(place.t)) {
      /* le voeu doit etre VALIDE : sans ce verrou, deux taps sur le lac ou hors
         plateau envoyaient une commande au Chantier — et le batiment y etait
         livre tel quel, sauvegarde sur l'eau */
      evalPlace();
      if (!place.valid) { sfx.deny(); if (place.why) toast(place.why); return false; }
      MIRROR_WISH[place.t] = { x: quant(place.hx), y: quant(place.hy) };
      try { window.parent.postMessage({ type: "awoui:build", id: MIRROR_INV[place.t] || place.t }, "*"); } catch (e) {}
      toast("🔨 Demande transmise au <b>Chantier</b> — si les soutes suivent, le chantier s'ouvre ici même.");
      cancelPlace(true); return false;
    }
  }
  if (MIRROR && place.kind === "unit") { sfx.deny(); toast("Les unités s'assemblent dans le jeu principal."); cancelPlace(true); return false; }
  evalPlace();
  if (!place.valid) { sfx.deny(); if (place.why) toast(place.why); return false; }
  const pl = place, c = placeCost(pl);
  if (pl.kind === "move") {
    const b = pl.mv;
    S.mat -= c.mat;
    b.x = quant(pl.hx); b.y = quant(pl.hy);
    if (MIRROR) { MIRROR_LAYOUT[b.t] = { x: b.x, y: b.y }; saveLayout(); }   // la position choisie fait foi
    // les câbles pointent sur l'identifiant du bâtiment, pas sur sa case :
    // ils suivent le déplacement sans qu'on ait rien à réécrire
    netDirty = true; pathCache = { key: "", segs: [] };
    place = null; syncPlaceUI(); sfx.build();
    burst(w2s(b.x, b.y).x, w2s(b.x, b.y).y, BT[b.t].col);
    toast("🚚 <b>" + BT[b.t].nm + "</b> déplacé — câbles reconnectés" + (MIRROR ? "." : " (−" + fmt(c.mat) + " 💠)."), true);
    save();
    return true;
  }
  if (pl.kind === "unit") {
    S.mat -= c.mat; S.eo -= c.eo;
    S.units.push({ t: pl.t, x: anc(pl.hx), y: anc(pl.hy) });
    S.fr = (S.fr || 0) + 1;
    place = null; syncPlaceUI(); sfx.build();
    toast("🛸 Drone ouvrier en place.");
    missionDone("unit_recolteur");
    save();
    return true;
  }
  S.mat -= c.mat; S.eo -= c.eo;
  S.buildings.push(newBld(pl.t, pl.hx, pl.hy, 1));
  place = null; syncPlaceUI(); sfx.build();
  postBuild(pl.t);
  save();
  return true;
}
function paletteVide() {
  for (const [key, def] of Object.entries(BT)) {
    if ((def.mAt || 0) > S.mi) continue;
    return false;
  }
  return true;
}
function syncPlaceUI() {
  const bar = $("#placebar");
  if (!place) { bar.hidden = true; document.body.classList.remove("placing"); return; }
  const c = placeCost(place);
  bar.hidden = false;
  document.body.classList.add("placing");
  bar.querySelector(".pb-nm").innerHTML =
    (place.kind === "move" ? "🚚 Déplacer " : "") + placeNom(place);
  bar.querySelector(".pb-cost").textContent = c.mat ? fmt(c.mat) + " 💠" + (c.eo ? " + " + c.eo + " Eo" : "") : "";
  const ok = bar.querySelector(".ok");
  ok.disabled = !place.valid;
  ok.textContent = place.valid ? "✅ POSER ICI" : "✕ " + (place.why || "impossible ici");
}
/* glisser-déposer depuis une carte du menu vers le terrain.
   Pas de setPointerCapture : la feuille est au-dessus du canvas, donc
   `pd` (le pan) ne se déclenche jamais ; on écoute sur window le temps
   du geste, ce qui laisse le `click` intact pour les boutons prix. */
function initDragPose() {
  const list = $("#buildlist");
  list.addEventListener("pointerdown", (e) => {
    const card = e.target.closest(".bcard");
    if (!card || card.classList.contains("locked") || !card.dataset.k) return;
    if (e.target.closest("button")) return; // le bouton prix garde son clic
    const key = card.dataset.k, x0 = e.clientX, y0 = e.clientY;
    let armed = false;
    const move = (ev) => {
      if (!armed) {
        if (Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) <= 10) return;
        armed = true;
        if (!armPlace("bld", key, { hx: -999, hy: -999 })) { fin(); return; }
        place.drag = true; place.lift = ev.pointerType === "touch" ? 46 : 0;
        $("#sh-build").classList.add("dragging");
      }
      const r = cv.getBoundingClientRect();
      movePlaceScreen(ev.clientX - r.left, ev.clientY - r.top, ev.pointerType === "touch");
      syncPlaceUI();
    };
    const up = (ev) => {
      if (armed && place) {
        place.drag = false; place.lift = 0;   // le fantôme retombe à sa vraie place
        if (place.valid) commitPlace();
        else { place.aimed = true; place.lastTap = performance.now(); syncPlaceUI(); }
      } else if (!armed) {
        // simple tap sur le corps de la carte : on arme sur la meilleure case
        armPlace("bld", key);
        if (place) toast("Touche le terrain pour viser, puis <b>✅ POSER ICI</b>.");
      }
      fin();
    };
    const fin = () => {
      $("#sh-build").classList.remove("dragging");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  });
}
function openBuild(tile) {
  closeSheets();
  selTile = tile; // après closeSheets, qui remet selTile à null
  const list = $("#buildlist");
  list.innerHTML = "";
  const sel = tile;
  for (const [key, def] of Object.entries(BT)) {
    // Le TUTO gouverne la découverte partout : la séquence Hub → amorçage →
    // câble → Switch se rejoue à l'identique en miroir (demande user 14/08).
    if ((def.mAt || 0) > S.mi) continue; // pas encore découvert
    // En miroir, le Chantier dit ce qu'on POSSÈDE (pose gratuite et immédiate,
    // au niveau du registre) et ce qu'il FAUT bâtir (tarif réel, file du jeu).
    const stock = MIRROR ? mirrorStock(key) : 0;   // niveau détenu au Chantier, 0 sinon
    const pcost = (MIRROR && !stock) ? mirrorCost(key) : null;
    const locked = MIRROR ? !!(pcost && pcost.lock) : (def.tech && !S.techs.includes(def.tech));
    const cost = buildCost(key), ceo = buildCostEo(key);
    const enOk = MIRROR ? true : enUse(def.conso) <= enCap();   // miroir : l'énergie se juge au Chantier, pas ici
    const card = document.createElement("div");
    card.className = "bcard" + (locked || !enOk ? " locked" : "");
    card.dataset.k = key;
    let lockTxt = "";
    if (locked) lockTxt = MIRROR
      ? "🔒 Plan à redécouvrir — l'arbre des technologies du jeu principal le libère."
      : "Requiert la technologie " + TECHS[def.tech].nm + ".";
    else if (stock) lockTxt = "Déjà au registre du Chantier — posez-le où vous voulez, sans rien dépenser.";
    else if (!enOk) lockTxt = "⚡ insuffisante — améliore la Centrale énergétique.";
    card.innerHTML =
      "<div class='ic'>" + def.ic + "</div>" +
      "<div class='grow'><div class='nm' style='color:" + def.col + "'>" + def.nm + "</div>" +
      "<div class='ds'>" + (lockTxt || def.ds + (def.conso ? " · −" + def.conso + " ⚡/niv" : "")) + "</div></div>";
    const btn = document.createElement("button");
    // trois étiquettes : « EN STOCK · NIV n » (déjà au Chantier → pose gratuite),
    // le TARIF RÉEL du Chantier (à bâtir, dans ses unités 🔩/💰/Eo/🔷), ou le
    // tarif local 💠 (modules propres au plateau, et standalone)
    btn.textContent = stock ? "EN STOCK · NIV " + stock
      : pcost ? fmt(pcost.mat) + " 🔩" + (pcost.cre ? " · " + fmt(pcost.cre) + " 💰" : "") +
          (pcost.dat ? " · " + pcost.dat + " Eo" : "") + (pcost.sil ? " · " + fmt(pcost.sil) + " 🔷" : "")
      : MIRROR ? "GRATUIT" : fmt(cost) + " 💠" + (ceo ? " + " + ceo + " Eo" : "");
    btn.disabled = locked || !enOk || (!MIRROR && (S.mat < cost || S.eo < ceo));
    if (GUIDE_BUILD[S.mi] === key && !btn.disabled) btn.classList.add("guide");
    btn.onclick = () => {
      if (locked || !enOk) { sfx.deny(); return; }
      if (sel && posable(key, sel.x, sel.y)) { // case déjà visée : pose directe
        if (armPlace("bld", key, { hx: sel.x, hy: sel.y }) && !commitPlace()) cancelPlace(true);
        return;
      }
      if (sel) {
        /* le centre de la case tapee est pris (voisin decale, en pose libre) :
           on cherche la place libre la plus proche DANS cette case, et a defaut
           on arme sur la case tapee pour MONTRER le refus — plutot que d'armer
           sans un mot ailleurs, pres de la Source */
        const alt = placeLibreProche(key, sel.x, sel.y, null, 0.6);
        armPlace("bld", key, alt ? { hx: alt.x, hy: alt.y } : { hx: sel.x, hy: sel.y });
        return;
      }
      armPlace("bld", key); // sinon : mode viser-puis-confirmer
    };
    card.appendChild(btn);
    list.appendChild(card);
  }
  $("#sh-build").hidden = false;
}

function postBuild(key) {
  if (key === "extracteur" && bcount("extracteur") === 1)
    setTimeout(() => toast("⚡ <b>Énergie</b> découverte : la base de la soute alimente tes bâtiments (100 ⚡)."), 700);
  if (key === "serveur" && bcount("serveur") === 1)
    setTimeout(() => toast("💾 <b>Données</b> découvertes : tes serveurs calculent des Eo."), 700);
  if (key === "coffret" && bcount("coffret") === 1) {
    // il n'est PAS relié d'office : l'alimenter puis le câbler sont les
    // deux missions suivantes (retour propriétaire)
    setTimeout(() => toast("🧰 <b>HUB-01</b> posé — il lui faut du courant : <b>récolte des éclats</b> ✨ pour l'amorcer."), 700);
  }
  if (key === "switchhub")
    setTimeout(() => toast("🔀 Câble le Switch à la Source (🔌), puis branche tes prochains bâtiments dessus."), 700);
  missionDone("build_" + key);
}

let curBld = null;
/* Le panneau #sh-bld est PARTAGÉ (bâtiment, éboulis…) : ses boutons gardent
   sinon le libellé, la visibilité ET le gestionnaire de l'ouverture précédente.
   Toute ouverture repart donc d'une ardoise nette — chacune ne rallume ensuite
   que ce qui la concerne. */
function resetBldSheet() {
  for (const id of ["#bl-move", "#bl-turbo", "#bl-del", "#bl-up"]) {
    const el = $(id);
    el.hidden = id !== "#bl-up";   // seul « améliorer/déblayer » est toujours utile
    el.disabled = false;
    el.onclick = null;
    el.classList.remove("guide");
  }
  $("#bl-stats").innerHTML = "";
  $("#bl-forge").innerHTML = "";
}
function openBld(b) {
  closeSheets();
  resetBldSheet();
  curBld = b;
  const def = BT[b.t];
  $("#bl-name").innerHTML = def.ic + " " + def.nm + " <span style='color:var(--dim);font-size:12px'>· NIV " + b.l + "</span>";
  $("#bl-desc").textContent = def.ds;
  let stats = "";
  if (S.mi >= 3 && b.t !== "switchhub" && b.t !== "dhcpsrv" && b.t !== "coffret") {
    const con = netConnected(keyOf(b));
    stats += "<div class='stat'><span>Réseau</span><b>" + (con ? "🔌 raccordé" : "⚠ non raccordé · −30 %") + "</b></div>";
  } else if (b.t === "switchhub" || b.t === "dhcpsrv" || b.t === "coffret") {
    stats += "<div class='stat'><span>Ports</span><b>" + portUsed(keyOf(b)) + " / " + portMax(keyOf(b)) + "</b></div>";
  }
  if (b.t === "extracteur") {
    const cb = crysAdj(b.x, b.y);
    stats += "<div class='stat'><span>Extraction</span><b>+" + fmt(0.7 * Math.pow(b.l, 1.4) * (1 + 0.15 * cb) * 60) + " 💠/min</b></div>";
    if (cb) stats += "<div class='stat'><span>Bonus cristaux adjacents</span><b>+" + (15 * cb) + " %</b></div>";
  }
  if (b.t === "centrale") stats += "<div class='stat'><span>Capacité ⚡ apportée</span><b>+" + fmt(80 * Math.pow(b.l, 1.15)) + "</b></div>";
  if (b.t === "entrepot") stats += "<div class='stat'><span>Capacité 💠 apportée</span><b>+" + fmt(250 * Math.pow(b.l, 1.2)) + "</b></div>";
  if (b.t === "serveur" || b.t === "ferme")
    stats += "<div class='stat'><span>Calcul</span><b>+" +
      (0.05 * (b.t === "ferme" ? 4 : 1) * Math.pow(b.l, 1.3) * 60).toFixed(1) + " Eo/min</b></div>";
  if (b.t === "datacenter") stats += "<div class='stat'><span>Capacité Eo apportée</span><b>+" + fmt(40 * Math.pow(b.l, 1.2)) + "</b></div>";
  if (b.t === "reseau") stats += "<div class='stat'><span>Contrats</span><b>+" + fmt(0.35 * b.l * 60) + " 💠/min</b></div>";
  if (b.t === "console") stats += "<div class='stat'><span>Production globale</span><b>+" + (4 * b.l) + " %</b></div>";
  if (BT[b.t].conso) stats += "<div class='stat'><span>Consommation</span><b style='color:var(--amber)'>−" + (BT[b.t].conso * b.l) + " ⚡</b></div>";
  $("#bl-stats").innerHTML = stats;
  const fa = $("#bl-forge");
  fa.innerHTML = "";
  if (b.t === "forge") {
    const cap = bsum("forge") + 3; // les 2 drones de soute d'origine ne comptent pas
    const enService = S.units.length + Math.max(0, (S.dr || 0) - 2);
    fa.innerHTML = "<div class='sl-nm' style='margin:6px 0'>🛠 PRODUCTION D'UNITÉS</div>" +
      "<div class='stat'><span>Unités assemblées</span><b>" + enService + " / " + cap + "</b></div>";
    for (const [k, u] of Object.entries(UT)) {
      const row = document.createElement("button");
      row.className = "forge-asm";
      row.innerHTML = u.ic + " " + u.nm + " · " + u.cost + " 💠" + (u.ceo ? " + " + u.ceo + " Eo" : "") +
        "<div class='ds2'>" + u.ds + "</div>";
      row.disabled = enService >= cap || S.mat < u.cost || S.eo < u.ceo;
      if (!row.disabled && ((S.mi === 24 && k === "recolteur") ||
          (S.mi === 25 && k === "chasseur" && !S.units.some((v) => v.t === "chasseur"))))
        row.classList.add("guide");
      row.onclick = () => assemble(k, b);
      fa.appendChild(row);
    }
    // l'autre visage de la Forge : l'Atelier de Mémoire
    const ah = document.createElement("div");
    ah.className = "sl-nm";
    ah.style.margin = "12px 0 6px";
    ah.textContent = "🧩 ATELIER DE MÉMOIRE";
    fa.appendChild(ah);
    const ids = Object.keys(ATL).map(Number).sort((x, y) => x - y);
    const next = ids.find((i) => !S.memories.includes(i) && (i === 1 || S.memories.includes(i - 1)));
    const mb = document.createElement("button");
    mb.className = "forge-asm";
    if (next) {
      mb.innerHTML = "🧩 Mémoire 00" + next + " — <b>RECONSTITUER</b>" +
        "<div class='ds2'>La Forge assemble aussi les souvenirs.</div>";
      mb.onclick = () => openAtelier(next);
    } else {
      mb.innerHTML = "🖼 Fresque complète — <b>REVOIR</b>" +
        "<div class='ds2'>Toutes les Mémoires sont reconstituées.</div>";
      mb.onclick = () => openArch();
    }
    fa.appendChild(mb);
  }
  const mvB = $("#bl-move");
  const mc = moveCost(b);
  // miroir : l'aménagement du plateau appartient TOUJOURS au joueur (et il est
  // gratuit — l'économie vit au Chantier) ; standalone : gating mission d'origine
  mvB.hidden = MIRROR ? false : S.mi < 6;
  mvB.textContent = MIRROR ? "🚚 DÉPLACER" : "🚚 DÉPLACER · " + fmt(mc) + " 💠";
  mvB.disabled = MIRROR ? false : S.mat < mc;
  mvB.onclick = () => {
    if (S.mat < mc) { sfx.deny(); toast("Déplacer coûte <b>" + fmt(mc) + " 💠</b> — la grue n'est pas donnée."); return; }
    closeSheets();
    armPlace("move", b.t, { mv: b, hx: b.x, hy: b.y });
    toast("🚚 Choisis la nouvelle place de <b>" + BT[b.t].nm + "</b>, puis ✅. Les câbles suivront.");
  };
  const uc = upCost(b);
  const upBtn = $("#bl-up");
  upBtn.classList.toggle("guide", (S.mi === 5 && b.t === "extracteur" || S.mi === 9 && b.t === "centrale") && S.mat >= uc);
  if (b.l >= 10) { upBtn.textContent = "NIV MAX"; upBtn.disabled = true; }
  else {
    // miroir : un ouvrage du registre s'améliore AU CHANTIER (tarif réel affiché) ;
    // un module propre au plateau s'améliore ici, gratuitement
    const upReg = MIRROR && mirrorKnown(b.t);
    let upTarif = "";
    if (upReg) {
      const pc = mirrorCost(b.t);
      if (pc) upTarif = " · " + fmt(pc.mat) + " 🔩" + (pc.cre ? " · " + fmt(pc.cre) + " 💰" : "") + (pc.dat ? " · " + pc.dat + " Eo" : "");
    }
    // Le libellé dit le GESTE et son prix, rien de plus : « AU CHANTIER »
    // encombrait le bouton pour une information que le tarif porte déjà (il est
    // dans les unités du Chantier). Le toast, lui, explique où part la demande.
    upBtn.textContent = upReg ? "AMÉLIORER" + upTarif
      : MIRROR ? "AMÉLIORER" : "AMÉLIORER · " + fmt(uc) + " 💠";
    const enOkUp = enUse(BT[b.t].conso) <= enCap();
    upBtn.disabled = MIRROR ? false : (S.mat < uc || !enOkUp);
    upBtn.onclick = () => {
      if (upReg) {   // la demande part au Chantier — le niveau montera par le flux
        try { window.parent.postMessage({ type: "awoui:build", id: MIRROR_INV[b.t] || b.t }, "*"); } catch (e) {}
        toast("🔨 Amélioration demandée au <b>Chantier</b> — la minuterie apparaîtra sur le bâtiment.");
        closeSheets();
        return;
      }
      if (S.mat < uc) { sfx.deny(); return; }
      if (enUse(BT[b.t].conso) > enCap()) { sfx.deny(); toast("⚡ insuffisante — améliore la <b>Centrale énergétique</b>."); return; }
      S.mat -= uc; b.l++;
      sfx.up(); missionDone("upgrade"); save();
      openBld(b);
    };
  }
  const tb = $("#bl-turbo");
  tb.classList.toggle("guide", S.mi === 21 && !!def.game);
  if (def.game && S.mi >= 13) {
    tb.hidden = false;
    tb.textContent = "⚡ SURCHARGE";
    tb.onclick = () => openTurbo(b);
  } else tb.hidden = true;
  /* RETIRER — le geste inverse de la pose, comme la démolition du Chantier.
     Deux régimes, parce que l'ouvrage n'appartient pas au même monde :
     · MIROIR, ouvrage du registre → on ne démolit RIEN au Chantier : on le
       range. Il repart « EN STOCK » dans la palette et se repose ailleurs
       quand on veut. Un geste d'aménagement, réversible, sans perte.
     · sinon (module du plateau, ou jeu autonome) → démolition franche, avec
       la moitié des matériaux rendus — la règle du Chantier. */
  const del = $("#bl-del");
  const rangeable = MIRROR && mirrorKnown(b.t);
  del.hidden = false;
  del.textContent = rangeable ? "✕ RANGER" : "✕ DÉMOLIR";
  del.title = rangeable
    ? "Retire l'ouvrage du plateau — il retourne en stock, rien n'est perdu."
    : "Démolit l'ouvrage et rend la moitié de ses matériaux.";
  del.onclick = () => {
    const nom = BT[b.t].nm;
    const k = keyOf(b);
    S.links = S.links.filter((l) => l.a !== k && l.b !== k);   // les câbles suivent
    S.buildings = S.buildings.filter((x) => x !== b);
    netDirty = true; pathCache = { key: "", segs: [] };
    if (rangeable) {
      delete MIRROR_LAYOUT[b.t]; saveLayout();
      toast("📦 <b>" + nom + "</b> rangé — il vous attend en stock, à reposer où vous voulez.", true);
    } else {
      let du = 0;
      for (let l = 0; l < b.l; l++) du += Math.round(BT[b.t].base * Math.pow(1.6, l));
      du = Math.round(du / 2);
      // On annonce ce qui est RÉELLEMENT rentré, pas ce qui était dû : soute
      // pleine, le remboursement est écrêté et promettre « +30 💠 » pour zéro
      // matériau reçu ferait douter le joueur du reste de l'interface. Même
      // rigueur que la démolition du Chantier.
      const avant = S.mat;
      if (!MIRROR) S.mat = Math.min(matCap(), S.mat + du);
      const recu = Math.round(S.mat - avant);
      toast("🧨 <b>" + nom + "</b> démoli" + (recu > 0 ? " — <b>+" + fmt(recu) + " 💠</b> récupérés." : "."), true);
    }
    sfx.ui(); closeSheets(); save();
  };
  $("#sh-bld").hidden = false;
}

function assemble(k, fb) {
  const u = UT[k];
  const cap = bsum("forge") + 3; // les 2 drones de soute d'origine ne comptent pas
  if (S.units.length + Math.max(0, (S.dr || 0) - 2) >= cap || S.mat < u.cost || S.eo < u.ceo) { sfx.deny(); return; }
  if (k === "recolteur") { // rien n'est débité tant que le drone n'est pas posé
    sfx.ui();
    armPlace("unit", k);
    toast("🛸 Drone prêt — <b>pose-le sur des cristaux</b> ✨, puis ✅.");
    save();
    return;
  }
  S.mat -= u.cost; S.eo -= u.ceo;
  sfx.build();
  {
    S.units.push({ t: k, x: anc(fb.x), y: anc(fb.y) });   // le Chasseur nait sur la CASE d'ancrage de la Forge : les unites restent entieres
    closeSheets();
    toast("🚀 Chasseur en patrouille.");
  }
  save();
}

function openSource() {
  closeSheets();
  const side = GRID + 2 * S.ext;
  $("#src-stats").innerHTML =
    "<div class='stat'><span>Niveau de colonie</span><b>" + colonyLevel() + "</b></div>" +
    "<div class='stat'><span>Bâtiments reliés</span><b>" + S.buildings.length + "</b></div>" +
    "<div class='stat'><span>Extraction totale</span><b>+" + fmt(matRate() * 60) + " 💠/min</b></div>" +
    "<div class='stat'><span>Calcul total</span><b>+" + (eoRate() * 60).toFixed(1) + " Eo/min</b></div>" +
    "<div class='stat'><span>Énergie</span><b>" + fmt(enUse()) + " / " + fmt(enCap()) + " ⚡</b></div>" +
    "<div class='stat'><span>Territoire</span><b>" + side + " × " + side + "</b></div>" +
    "<div class='stat'><span>Technologies</span><b>" + (S.techs.length ? S.techs.map((t) => TECHS[t].nm).join(" · ") : "aucune") + "</b></div>";
  const act = $("#src-act");
  act.innerHTML = "";
  const oldSoute = document.querySelector("#src-soute");
  if (oldSoute) oldSoute.remove();
  if (soutePrete()) {
    const cb = document.createElement("button");
    cb.id = "src-soute";
    cb.className = "forge-asm";
    cb.style.borderColor = "#4a3a70";
    cb.style.color = "var(--violet)";
    cb.innerHTML = "📼 Compartiment scellé — <b>OUVRIR</b>" +
      "<div class='ds2'>Déverrouillé par ton Datacenter.</div>";
    cb.onclick = () => {
      S.archives.push({ id: 1, dec: false });
      sfx.tech();
      closeSheets();
      toast("📼 <b>Fragment d'Archive 001</b> récupéré dans la soute — format ancien, illisible… (onglet QUÊTES)", true);
      save();
    };
    act.parentElement.insertBefore(cb, act);
  }
  if (S.mi < 22) {
    act.innerHTML = "<div class='sub' style='margin:0'>L'Étincelle grandit avec ta colonie…</div>";
    $("#sh-source").hidden = false;
    return;
  }
  const btn = document.createElement("button");
  if (S.ext >= EXP_COSTS.length) {
    btn.textContent = "TERRITOIRE MAX (slice)";
    btn.disabled = true;
  } else {
    const cost = EXP_COSTS[S.ext];
    const ns = GRID + 2 * (S.ext + 1);
    btn.textContent = "ÉTENDRE LE TERRITOIRE → " + ns + "×" + ns + " · " + fmt(cost) + " 💠";
    btn.disabled = S.mat < cost;
    if (S.mi === 26 && !btn.disabled) btn.classList.add("guide");
    btn.onclick = () => {
      if (S.mat < cost) { sfx.deny(); return; }
      S.mat -= cost;
      S.ext++;
      sfx.tech();
      toast("🌍 Territoire étendu : <b>" + (GRID + 2 * S.ext) + "×" + (GRID + 2 * S.ext) + "</b> — de nouvelles terres émergent !", true);
      missionDone("extend");
      zoomAt(0.85);
      save();
      openSource();
    };
  }
  act.appendChild(btn);
  $("#sh-source").hidden = false;
}

function openRubble(tp) {
  closeSheets();
  selTile = tp;
  // Un éboulis n'est PAS un bâtiment : il n'a qu'un seul geste, déblayer.
  // Le panneau #sh-bld étant partagé avec openBld, sans cette remise à zéro le
  // bouton 🚚 DÉPLACER restait affiché AVEC le gestionnaire du dernier bâtiment
  // ouvert — on croyait déplacer le rocher, on déménageait un ouvrage.
  resetBldSheet();
  $("#bl-name").textContent = "🪨 Éboulis";
  $("#bl-desc").textContent = "Des débris bloquent la case.";
  $("#bl-stats").innerHTML = "";
  $("#bl-forge").innerHTML = "";
  const upBtn = $("#bl-up");
  upBtn.classList.remove("guide");
  upBtn.textContent = "🚜 DÉBLAYER · 30 💠";
  upBtn.disabled = S.mat < 30;
  upBtn.onclick = () => {
    if (S.mat < 30) { sfx.deny(); return; }
    S.mat -= 30;
    const k = tp.x + "," + tp.y;
    if (rubbleSet.has(k)) { rubbleSet.delete(k); S.rubble = [...rubbleSet]; }
    else { clearedSet.add(k); S.cleared = [...clearedSet]; }
    sfx.build();
    const ps = w2s(tp.x, tp.y);
    burst(ps.x, ps.y, "#c9a06a");
    toast("🚜 Case déblayée !");
    save();
    closeSheets();
  };
  $("#sh-bld").hidden = false;   // (turbo et déplacer déjà éteints par resetBldSheet)
}

let cave = null;
const PIT_W = 6, PIT_H = 8;
const PIECES = [
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [0, 1]],
  [[0, 0], [1, 0], [1, 1]],
];
function rotP(cells) {
  const r = cells.map(([x, y]) => [y, -x]);
  const mx = Math.min(...r.map((v) => v[0])), my = Math.min(...r.map((v) => v[1]));
  return r.map(([x, y]) => [x - mx, y - my]);
}
function openCrevasse(tp) {
  closeSheets();
  cave = { tp, mat: 0, eo: 0, running: false };
  $("#cave-sub").textContent = "La faille est instable. Comble-la bloc par bloc — et capture ce qui y brille.";
  $("#cave-zone").hidden = true;
  $("#cave-score").textContent = "";
  $("#cave-go").hidden = false;
  $("#sh-cave").hidden = false;
}
function pitRender() {
  for (const cell of $("#pit").children) {
    const x = +cell.dataset.x, y = +cell.dataset.y;
    const v = cave.grid[y][x];
    cell.className = "pcell" + (v === 1 ? " rock" : v === 2 ? " fill" : "");
    const g = cave.gems[y * PIT_W + x];
    if (g && v === 0) cell.classList.add(g === 2 ? "gemEo" : "gem");
  }
  const pn = $("#pn-grid");
  pn.innerHTML = "";
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) {
    const d = document.createElement("div");
    if (cave.piece.some(([px, py]) => px === x && py === y)) d.className = "pn-c";
    pn.appendChild(d);
  }
  $("#pn-left").textContent = cave.left + " blocs";
}
$("#cave-go").onclick = () => {
  if (!cave || cave.running) return;
  audioInit(); sfx.ui();
  cave.running = true;
  $("#cave-go").hidden = true;
  const r = mulberry32(hash2(cave.tp.x, cave.tp.y) ^ 77);
  cave.grid = Array.from({ length: PIT_H }, () => Array(PIT_W).fill(0));
  for (let x = 0; x < PIT_W; x++) {
    const fh = Math.floor(r() * 3);
    for (let y = 0; y < fh; y++) cave.grid[PIT_H - 1 - y][x] = 1;
  }
  cave.gems = {};
  let placed = 0, guard = 60;
  while (placed < 5 && guard--) {
    const x = Math.floor(r() * PIT_W), y = PIT_H - 1 - Math.floor(r() * 4);
    if (cave.grid[y][x] === 0 && !cave.gems[y * PIT_W + x]) {
      cave.gems[y * PIT_W + x] = r() < 0.2 ? 2 : 1;
      placed++;
    }
  }
  cave.left = 10;
  cave.rng = r;
  cave.piece = PIECES[Math.floor(r() * PIECES.length)].map((c) => [...c]);
  const pitEl = $("#pit");
  pitEl.innerHTML = "";
  for (let y = 0; y < PIT_H; y++) for (let x = 0; x < PIT_W; x++) {
    const d = document.createElement("div");
    d.className = "pcell";
    d.dataset.x = x; d.dataset.y = y;
    d.onclick = () => pitDrop(x);
    pitEl.appendChild(d);
  }
  $("#cave-zone").hidden = false;
  pitRender();
};
$("#pn-rot").onclick = () => {
  if (cave && cave.running) { cave.piece = rotP(cave.piece); sfx.ui(); pitRender(); }
};
function pitFits(c, y) {
  return cave.piece.every(([dx, dy]) => {
    const x = c + dx, yy = y + dy;
    return x >= 0 && x < PIT_W && yy >= 0 && yy < PIT_H && cave.grid[yy][x] === 0;
  });
}
function fitsAnywhere(piece) {
  const keep = cave.piece;
  cave.piece = piece;
  let ok = false;
  for (let c = 0; c < PIT_W && !ok; c++) for (let y = 0; y < PIT_H && !ok; y++) if (pitFits(c, y)) ok = true;
  cave.piece = keep;
  return ok;
}
function pitDrop(col) {
  if (!cave || !cave.running) return;
  const pw = Math.max(...cave.piece.map((c) => c[0])) + 1;
  const c = clamp(col, 0, PIT_W - pw);
  let land = -1;
  for (let y = 0; y < PIT_H; y++) if (pitFits(c, y)) land = y;
  if (land < 0) { sfx.deny(); return; }
  for (const [dx, dy] of cave.piece) {
    const x = c + dx, y = land + dy;
    cave.grid[y][x] = 2;
    const g = cave.gems[y * PIT_W + x];
    if (g) {
      delete cave.gems[y * PIT_W + x];
      if (g === 2) cave.eo += 2; else cave.mat += 10 + 2 * colonyLevel();
      sfx.collect();
    }
  }
  beep(280 + land * 20, 0.07, "square", 0.035);
  cave.left--;
  $("#cave-score").textContent = (cave.mat ? "+" + cave.mat + " 💠" : "") + (cave.eo ? " · +" + cave.eo + " Eo" : "");
  cave.piece = PIECES[Math.floor(cave.rng() * PIECES.length)].map((cc) => [...cc]);
  pitRender();
  let can = false, test = cave.piece;
  for (let rr = 0; rr < 4 && !can; rr++) { if (fitsAnywhere(test)) can = true; test = rotP(test); }
  if (cave.left <= 0 || !can) pitEnd();
}
function pitEnd() {
  const { tp } = cave;
  let holes = 0;
  for (let x = 0; x < PIT_W; x++) {
    let covered = false;
    for (let y = 0; y < PIT_H; y++) {
      const v = cave.grid[y][x];
      if (v === 2) covered = true;
      else if (v === 0 && covered) holes++;
    }
  }
  const bonus = Math.max(0, 40 + 10 * colonyLevel() - holes * 8);
  const mat = cave.mat + bonus, eo = cave.eo;
  cave = null;
  clearedSet.add(tp.x + "," + tp.y);
  S.cleared = [...clearedSet];
  S.mat = Math.min(matCap(), S.mat + mat);
  S.eo = Math.min(eoCap(), S.eo + eo);
  sfx.tech();
  closeSheets();
  toast("🕳 Crevasse comblée : <b>+" + mat + " 💠</b>" + (eo ? " et <b>+" + eo + " Eo</b>" : "") +
    (holes === 0 ? " · <b>colmatage parfait !</b>" : "") + " — case libre !", true);
  save();
}

