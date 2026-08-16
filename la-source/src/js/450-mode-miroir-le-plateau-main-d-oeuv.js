/* ---------- MODE MIROIR : le plateau, main d'œuvre du jeu principal ----------
   Embarquée dans concept.html (onglet « La Source »), la slice reçoit l'état du
   Chantier par postMessage (awoui:chantier) : bâtiments détenus et leurs
   niveaux, file en cours, ressources vivantes, défenses, technologies.

   MODÈLE (arrêté avec l'utilisateur le 14/08) — le plateau n'est PAS un calque
   automatique, c'est le CHANTIER DE POSE du joueur :
   · le plateau démarre VIDE, même pour un joueur qui possède déjà tout au
     Chantier — et le TUTO SE REJOUE INTÉGRALEMENT pour tout le monde
     (gisement → Hub réseau → amorçage → câblage → Switch → …) ;
   · ce qu'il possède déjà au Chantier est « EN STOCK » : il le pose où il veut,
     GRATUITEMENT et DIRECTEMENT au niveau du registre — rien à reconstruire ;
   · ce qu'il ne possède pas se COMMANDE au Chantier (tarif réel, file, fantôme
     minuté sur la case choisie) ;
   · les modules propres au plateau (Hub, Switch, Hangar…) restent gratuits et
     cadencés par le tuto — c'est là que la pédagogie du câblage se joue ;
   · le terrain reste à lui : déblayer les rochers, colmater les failles et
     déplacer 🚚 ses bâtiments sont TOUJOURS possibles, et gratuits.
   La partie du plateau a sa propre sauvegarde (`ls-plateau-v1`) : elle survit
   au refresh sans jamais toucher celle du standalone (`ls-save-v4`). */
let MIRROR = false, MIRROR_RES = null, MIRROR_Q = [], MIRROR_COSTS = null, MIRROR_BLD = {};
const MIRROR_WISH = {};   // cases choisies par le joueur pour ses demandes de chantier
const MIRROR_INV = { datacenter: "baie", dhcpsrv: "dhcp", coffrefort: "coffre" };   // ids plateau → ids Chantier
// Disposition mémorisée (t -> {x,y}) : une pose ou un déplacement 🚚 retrouve sa
// case même si le bâtiment doit être reposé par le flux du Chantier.
const LS_LAYOUT_KEY = "ls-mirror-layout";
function loadLayout(){ try{ return JSON.parse(localStorage.getItem(LS_LAYOUT_KEY)) || {}; }catch(_){ return {}; } }
function saveLayout(){ try{ localStorage.setItem(LS_LAYOUT_KEY, JSON.stringify(MIRROR_LAYOUT)); }catch(_){} }
const MIRROR_LAYOUT = loadLayout();
const MIRROR_PROD = new Set(["extracteur","centrale","baie","ferme","serveur","reseau","forge","console","tour",
                             "citadelle","nexus","entrepot","dhcp","miniere","chantier","coffre","bastion"]);
const MIRROR_MAP = { baie: "datacenter", dhcp: "dhcpsrv", coffre: "coffrefort" };
/* Les trois questions que le plateau pose au registre du Chantier — déclarées
   APRÈS les tables qu'elles interrogent (même prudence que la régression
   `bcount` corrigée plus haut : une constante ne se lit pas avant sa ligne) :
   — ce plan y est-il connu ? (sinon : module propre au plateau)
   — le joueur le détient-il, et à quel niveau ? (pose gratuite à ce niveau)
   — sinon, combien coûte-t-il vraiment ? (tarif du Chantier, verrou compris) */
const mirrorKnown = (t) => MIRROR_PROD.has(MIRROR_INV[t] || t);
const mirrorStock = (t) => (MIRROR && MIRROR_BLD[MIRROR_INV[t] || t]) || 0;
const mirrorCost  = (t) => (MIRROR_COSTS && MIRROR_COSTS[MIRROR_INV[t] || t]) || null;
/* Plus de mirrorSpot/mirrorPose : le plateau ne se peuple plus jamais tout seul.
   C'est le joueur qui sort ses ouvrages des soutes, à l'endroit qu'il choisit. */
function drawMirrorTimer(q) {
  const p = w2s(q.x, q.y);
  const left = Math.max(0, Math.ceil((q.ends - Date.now()) / 1000));
  ctx.save();
  ctx.font = "600 12px system-ui"; ctx.textAlign = "center";
  ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(6,9,19,.85)";
  ctx.fillStyle = "#ffc857";
  const txt = q.ends ? "🏗 " + left + " s" : "🏗 en file";
  ctx.strokeText(txt, p.x, p.y - 46);
  ctx.fillText(txt, p.x, p.y - 46);
  ctx.restore();
}
window.addEventListener("message", (e) => {
  const d = e.data;
  if (!d || d.type !== "awoui:chantier") return;
  if (!MIRROR) {
    MIRROR = true;
    // Le plateau ne se fait PAS remplir : il reste tel que le joueur l'a laissé
    // (sa propre sauvegarde `ls-plateau-v1`) et, à la première ouverture, il est
    // vierge — le tuto se rejoue en entier, comme voulu. Rien n'est purgé, rien
    // n'est posé d'office : ce qui est au Chantier attend d'être SORTI DES SOUTES.
    // Trésorerie locale gonflée : sur le plateau, poser, câbler, déblayer un
    // rocher, colmater une faille et déplacer 🚚 sont GRATUITS — l'économie, la
    // vraie, vit au Chantier (et c'est lui qu'affiche le HUD).
    S.mat = 999999; S.eo = 999999;
    // Le HUD local double celui du jeu principal, juste au-dessus : on l'éteint
    // ENTIÈREMENT. Le compteur de CRISTAUX 💎 y échappait tant qu'il n'existait
    // nulle part ailleurs ; depuis qu'il remonte au HUD d'Universe (message
    // `awoui:cristaux`), le garder ici affichait deux fois la même monnaie, l'une
    // sous l'autre. Les missions, elles, RESTENT : c'est le tuto qui se rejoue.
    const st = document.createElement("style");
    st.textContent = "#hud{display:none!important}";
    document.head.appendChild(st);
  }
  /* Encombrement des bandes d'Universe, mesure par lui a chaque envoi : sa
     hauteur change avec la largeur de fenetre (le bandeau de ressources passe
     sur deux lignes). Le cadre et les commandes s'en ecartent. */
  if (d.chrome) {
    const r = document.documentElement.style;
    /* ZERO est une mesure valable, pas une absence : une bande masquee (le
       bandeau d'Awoui l'est dans cette vue) mesure 0, et `|| repli` nous faisait
       alors reserver de la place pour une barre qui n'existe pas. */
    const n = (v, repli) => (typeof v === "number" && isFinite(v)) ? Math.round(v) : repli;
    r.setProperty("--u-haut", n(d.chrome.haut, 46) + "px");
    r.setProperty("--u-gauche", n(d.chrome.gauche, 0) + "px");
    r.setProperty("--u-bas", n(d.chrome.bas, 0) + "px");
    drawHublot();
  }
  MIRROR_BLD = d.bld || {};
  // NIVEAUX : un bâtiment posé sur le plateau suit son niveau au Chantier — une
  // amélioration là-bas se voit ici (fin des bâtiments désynchronisés).
  for (const b of S.buildings) {
    const lv = MIRROR_BLD[MIRROR_INV[b.t] || b.t];
    if (lv) b.l = Math.max(1, lv);
  }
  // SYNC INVERSE : un ouvrage démoli au Chantier quitte le plateau, ses câbles
  // avec lui. Les modules propres au plateau (Hub, Switch…) ne sont pas
  // concernés : le registre du Chantier ne les connaît pas.
  {
    const gone = S.buildings.filter((b) => mirrorKnown(b.t) && !MIRROR_BLD[MIRROR_INV[b.t] || b.t]);
    if (gone.length) {
      const gk = new Set(gone.map(keyOf));
      S.links = S.links.filter((l) => !gk.has(l.a) && !gk.has(l.b));
      S.buildings = S.buildings.filter((b) => gone.indexOf(b) < 0);
      netDirty = true;
    }
  }
  // FILE DU CHANTIER : seuls les ouvrages COMMANDÉS DEPUIS LE PLATEAU s'y
  // montrent, en fantôme minuté sur la case choisie — le plateau ne se peuple
  // pas tout seul de ce qui se bâtit dans l'écran Chantier.
  const q = [];
  for (const it of (d.queue || [])) {
    const t = MIRROR_MAP[it.id] || it.id;
    if (!BT[t]) continue;
    const existing = S.buildings.find((x) => x.t === t);
    if (existing) { q.push({ t, x: existing.x, y: existing.y, ends: it.ends, up: true }); continue; }
    const prev = MIRROR_Q.find((x) => x.t === t && !x.up);
    const wish = MIRROR_WISH[t];
    // « libre » se juge sur l'EMPREINTE, pas sur l'égalité de case : en pose
    // libre, un voisin décalé peut recouvrir la place promise sans y être ancré
    const libre = (p) => p && posable(t, p.x, p.y);   // bornes + lac/montagne + empreinte, pas l'empreinte seule
    const sp = (libre(prev) ? prev : null) || (libre(wish) ? wish : null);
    if (sp) q.push({ t, x: sp.x, y: sp.y, ends: it.ends });
  }
  // un ouvrage commandé depuis le plateau vient d'être achevé ? il s'installe
  // sur SA place, au niveau du Chantier — la promesse du fantôme est tenue
  for (const t in MIRROR_WISH) {
    const lv = MIRROR_BLD[MIRROR_INV[t] || t];
    if (!lv || S.buildings.some((b) => b.t === t)) continue;
    if (q.some((x) => x.t === t)) continue;   // encore en file : on laisse le fantôme
    const sp = MIRROR_WISH[t];
    if (sp && posable(t, sp.x, sp.y)) {
      S.buildings.push(newBld(t, sp.x, sp.y, Math.max(1, lv)));
      MIRROR_LAYOUT[t] = { x: sp.x, y: sp.y };
      netDirty = true; sfx.build();
      toast("🏗 <b>" + BT[t].nm + "</b> livré par le Chantier — installé où vous l'aviez demandé.", true);
      delete MIRROR_WISH[t];
    } else if (sp) {
      /* la place promise a été prise entre-temps : on garde le vœu et on
         cherche la place libre la plus proche plutôt que d'écraser un voisin —
         un chevauchement livré serait SAUVEGARDÉ */
      const alt = placeLibreProche(t, sp.x, sp.y);
      if (alt) {
        S.buildings.push(newBld(t, alt.x, alt.y, Math.max(1, lv)));
        MIRROR_LAYOUT[t] = { x: alt.x, y: alt.y };
        netDirty = true; sfx.build();
        toast("🏗 <b>" + BT[t].nm + "</b> livré — sa place était prise, il s'est installé juste à côté.", true);
        delete MIRROR_WISH[t];
      }
    } else delete MIRROR_WISH[t];
  }
  MIRROR_Q = q;
  // la boussole du jeu principal (DNS redécouvert) ouvre la Carte du plateau
  const pt = (d.prog && d.prog.techs) || [];
  if ((pt.includes("cartographie") || pt.includes("socle-boussole") || pt.includes("sup-carto")) && !S.techs.includes("dns")) {
    S.techs.push("dns"); unlockMap();
  }
  MIRROR_RES = d.res || MIRROR_RES;
  MIRROR_COSTS = d.costs || MIRROR_COSTS;   // prix RÉELS du Chantier (prochain niveau, file comprise)
  saveLayout();   // la disposition (positions posées/déplacées) survit au refresh
  save();         // …et la partie du plateau avec elle (clé dédiée)
  if (typeof netDirty !== "undefined") netDirty = true;
  // le message du Chantier arrive à 1 Hz tant que la vue est ouverte : il sert
  // de POULS au plateau — canvas rétabli et manette rallumée même si le rAF
  // dort encore (montage caché, onglet en arrière-plan)
  healCanvas();
  refreshGates();
});
// l'hôte (concept.html) répond au ls-ready par l'état complet du registre
if (window.parent !== window) { try { window.parent.postMessage({ type: "awoui:ls-ready" }, "*"); } catch (e) {} }

