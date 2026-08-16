/* ---------- état ---------- */
let S = null;
function newSave() {
  return {
    v: 14, nid: 1, mat: 50, eo: 0, cry: 0, pw: 0, crx: {}, crxDead: {}, buildings: [], techs: [], links: [], seenIntro: false,
    mi: 0, orbsCollected: 0, lastSeen: Date.now(), buffLeft: 0, buffMult: 1,
    ext: 0, cleared: [], units: [], archives: [], reader: false,
    rubble: [], lastRubble: Date.now(), memories: [], restored: [], dr: 2, fr: 0, hubBoot: false,
  };
}
/* DEUX PARTIES, DEUX CLÉS (retour user 14/08 : « la progression est cassée »).
   Embarquée dans la console, la slice est le PLATEAU du jeu principal et rejoue
   son propre tuto : elle a sa sauvegarde à elle. En écrivant dans la même clé
   que le standalone, la partie du joueur (Hub posé, missions faites) se faisait
   écraser par l'état vierge de l'embarquée — et inversement. */
const EMBED = window.parent !== window;
/* Marque le document DES LE DEMARRAGE. Le HUD local etait bien eteint en mode
   miroir, mais seulement a la reception du premier message du Chantier — qui
   arrive jusqu'a une seconde plus tard. Pendant ce delai, un second bandeau de
   ressources s'affichait sous celui d'Universe (« … · reserve »), d'autant plus
   visible depuis que la scene occupe tout le cadre. Le CSS n'a pas a attendre
   qu'on lui parle pour savoir ou il vit. */
if (EMBED) document.documentElement.classList.add("embed");
const SAVE_KEY = EMBED ? "ls-plateau-v1" : "ls-save-v4";
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const sv = Object.assign(newSave(), JSON.parse(raw));
      if ((sv.v || 2) < 3) { // v3 : missions re-séquencées (17 → 21)
        const remap = [0, 1, 2, 4, 6, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
        sv.mi = remap[Math.min(sv.mi, 17)];
        sv.v = 3;
      }
      if (sv.v < 4) { // v4 : chapitre 🔌 Réseau inséré aux missions 8-11
        if (sv.mi >= 9) sv.mi += 4;
        sv.v = 4;
      }
      if (sv.v < 5) { // v5 : mission tuto « drone de soute » insérée en 1
        if (sv.mi >= 1) sv.mi += 1;
        sv.fr = (sv.units || []).filter((u) => u.t === "recolteur").length;
        sv.v = 5;
      }
      if (sv.v < 6) { // v6 : « 2e Extracteur » retirée, Switch avant le raccordement
        if (sv.mi >= 8) sv.mi -= 1;
        sv.v = 6;
      }
      if (sv.v < 7) { // v7 : Hub réseau (HUB-01) posé en mission 1
        if (sv.mi >= 1) sv.mi += 1;
        sv.hubBoot = (sv.mi || 0) >= 2;
        sv.v = 7;
      }
      if (sv.v < 8) { // v8 : gisements de cristaux à stock (compteur + tailles)
        sv.crx = {};
        sv.v = 8;
      }
      if (sv.v < 9) { // v9 : les gisements épuisés respawnent (plus de « cleared »)
        sv.crxDead = {};
        sv.v = 9;
      }
      if (sv.v < 10) { // v10 : ouverture ré-ordonnée (drone → Hub → éclats → câble)
        sv.mi = (sv.mi || 0) <= 2 ? 0 : sv.mi + 1;
        sv.v = 10;
      }
      if (sv.v < 11) { // v11 : les cristaux 💎 deviennent une monnaie à part
        sv.cry = sv.cry || 0;
        sv.v = 11;
      }
      /* v12 : le Serveur prend la place de la Ferme au chapitre 💾 Données.
         Jusqu'ici, la Ferme de serveurs ÉTAIT la machine à Données du milieu de
         partie ; elle est désormais mise de côté (mAt 999) et partage l'asset
         du Serveur, dessiné 52 % plus grand (0,76 contre 0,50 case).
         Sans conversion, la Ferme héritée d'une partie en cours s'affichait donc
         comme un « gros serveur » là où le joueur attend la petite machine —
         c'est le retour du propriétaire. Toutes les Fermes déjà posées tenaient
         le rôle qui est désormais celui du Serveur : on les convertit, case et
         niveau conservés. Le parc de serveurs se rebâtira plus tard, à sa
         nouvelle place dans la chaîne. */
      if (sv.v < 12) {
        for (const b of (sv.buildings || [])) if (b.t === "ferme") b.t = "serveur";
        sv.v = 12;
      }
      /* v13 : les éclats d'énergie ne paient plus en matériaux. Récolter des
         étincelles pour recevoir des cailloux ne voulait rien dire — elles
         alimentent le HUB, puis remplissent les BATTERIES de la colonie. */
      if (sv.v < 13) { sv.pw = sv.pw || 0; sv.v = 13; }
      /* v14 : POSE LIBRE. Les bâtiments reçoivent un identifiant, et les câbles
         — qui pointaient sur des cases « x,y » — sont réécrits sur ces
         identifiants. Un câble dont une extrémité ne trouve plus sa machine est
         abandonné plutôt que laissé orphelin : un lien fantôme comptait dans les
         ports et pouvait valider une mission de câblage à vide. Les positions,
         entières jusqu'ici, restent telles quelles : elles sont déjà des réels. */
      if (sv.v < 14) {
        let nid = 1;
        for (const b of (sv.buildings || [])) b.id = nid++;
        sv.nid = nid;
        const parKey = new Map();
        for (const b of sv.buildings || []) parKey.set(Math.round(b.x) + "," + Math.round(b.y), "b" + b.id);
        const conv = (k) => k === "src" ? "src" : (parKey.get(k) || null);
        sv.links = (sv.links || []).map((l) => ({ a: conv(l.a), b: conv(l.b) })).filter((l) => l.a && l.b);
        sv.v = 14;
      }
      /* garde-fou : un identifiant manquant (partie touchée à la main, import) est
         attribué au chargement, sans attendre une migration */
      /* Le compteur se RECALCULE toujours à partir des ids présents : se fier à sa
         seule présence laissait passer une sauvegarde importée (nid absent, donc
         remis à 1 par newSave) dont les bâtiments portaient déjà les ids 1, 2, 3 —
         le prochain posé aurait été un second « b1 », partageant câbles, ports et
         IP avec le premier. Un doublon d'id déjà présent est renuméroté ; les
         câbles restent au premier porteur (c'est lui que nodeAt trouvait déjà),
         on ne peut pas deviner à qui ils appartenaient. */
      {
        const vus = new Set();
        let maxId = 0;
        for (const b of (sv.buildings || [])) if (Number.isFinite(b.id)) maxId = Math.max(maxId, b.id);
        if (!Number.isFinite(sv.nid) || sv.nid <= maxId) sv.nid = maxId + 1;
        for (const b of (sv.buildings || [])) {
          if (!Number.isFinite(b.id) || vus.has(b.id)) b.id = sv.nid++;
          vus.add(b.id);
        }
      }
      return sv;
    }
  } catch (e) {}
  return newSave();
}
function save() {
  // le plateau embarqué SAUVEGARDE (dans SA clé) : le tuto rejoué, les poses et
  // les câblages survivent au refresh — sans jamais toucher `ls-save-v4`
  S.lastSeen = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
}
S = load();
if (!S.cleared) S.cleared = [];
if (!S.crx) S.crx = {};
if (!S.crxDead) S.crxDead = {};
/* PAS de skipSatisfied() ici (régression corrigée) : les conditions de mission
   appellent bcount/matCap, déclarés PLUS BAS en `const` — les évaluer si tôt
   lève « Cannot access 'bcount' before initialization » et tue le script au
   chargement. Le symptôme : toute reprise de partie assez avancée pour que la
   mission courante interroge les bâtiments s'ouvrait sur un écran mort.
   Le rattrapage se fait au démarrage, une fois tout déclaré (voir plus bas). */
if (!S.ext) S.ext = 0;
if (!S.units) S.units = [];
if (!S.archives) S.archives = [];
if (!S.rubble) S.rubble = [];
if (!S.lastRubble) S.lastRubble = Date.now();
if (!S.memories) S.memories = [];
if (!S.restored) S.restored = [];
if (S.reader == null) S.reader = false;
if (S.dr == null) S.dr = 2;
if (S.fr == null) S.fr = 0;
if (S.hubBoot == null) S.hubBoot = false;
if (!S.links) S.links = [];
S.units.forEach((u) => { delete u.busy; delete u.fly; });
window.__LS = () => S;
setTimeout(initDragPose, 0);

