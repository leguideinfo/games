/* ---------- moteur d'occupation : empreintes au sol ----------
   Chaque chose posée occupe un carré monde centré sur sa case, de côté
   « empreinte » (mesuré sur la base de l'asset, pas sa bbox). Deux empreintes
   ne peuvent jamais se chevaucher : on exige un écart >= (s1+s2)/2 + MARGE.
   Valeurs mesurées : bâtiments 0,69-0,71 · balise 0,63 · hub 0,58 ·
   cristaux 0,42-0,46 · éboulis/relief 0,20-0,47 — l'adjacence reste donc
   toujours possible (0,71 + 0,12 < 1), la règle garantit sans restreindre. */
const FP_MARGE = 0.12;
const FP_BLD = { extracteur: 0.81, centrale: 0.69, entrepot: 0.71, coffret: 0.39,
  serveur: 0.41, ferme: 0.62, datacenter: 0.74, reseau: 0.44, console: 0.53, forge: 0.45, dhcpsrv: 0.67, switchhub: 0.38, miniere: 0.57, coffrefort: 0.67, citadelle: 0.46, bastion: 0.68, tour: 0.47, tourelle: 0.50, missiles: 0.48, bouclier: 0.49, sentinelle: 0.68, revocation: 0.59, chantier: 0.50, transport: 0.42, hangar: 0.44 };
const FP_DEF = 0.62, FP_SRC = 0.63, FP_UNIT = 0.30;
function fpOf(kind, x, y) {
  if (kind === "src") return FP_SRC;
  if (kind === "unit") return FP_UNIT;
  if (FP_BLD[kind] != null) return FP_BLD[kind];
  if (kind === "crystal") return [0.27, 0.40, 0.53][crysSize(x, y)];
  if (kind === "caillou") return 0.45;
  if (kind === "crevasse") return 0.50;
  return FP_DEF;
}
/* Liste des empreintes déjà occupées (hors objet ignoré : utile au déplacement).
   Chaque occupant porte son GENRE : c'est ce qui permet au fantôme de pose de
   dire pourquoi il refuse (« des cristaux », « un caillou »…) plutôt qu'un
   « trop près » indistinct.
   POSE LIBRE : les positions des bâtiments sont continues, et l'occupation les
   lit telles quelles — deux voisins décalés l'un vers l'autre ne peuvent donc
   pas se recouvrir. Les cailloux et les crevasses deviennent des occupants à
   part entière : jusqu'ici ils n'étaient refusés que sur la case d'ancrage, et
   un socle décalé pouvait recouvrir un rocher (qui, peint après, ressortait
   par-dessus la base). */
function occupants(ignore) {
  const out = [{ x: SRC.x, y: SRC.y, s: FP_SRC, k: "src" }];
  for (const b of S.buildings) {
    if (ignore && b === ignore) continue;
    out.push({ x: b.x, y: b.y, s: fpOf(b.t, b.x, b.y), k: "bld", b });
  }
  // les Chasseurs patrouillent : ils ne tiennent pas le sol (sinon celui ne sur la
  // Forge interdisait de la deplacer de moins d'une demi-case)
  for (const u of S.units) if (u.t !== "chasseur") out.push({ x: u.x, y: u.y, s: FP_UNIT, k: "unit" });
  for (let y = bmin(); y <= bmax(); y++) for (let x = bmin(); x <= bmax(); x++) {
    const kd = tileAt(x, y).kind;
    if (kd === "crystal") out.push({ x, y, s: [0.27, 0.40, 0.53][crysSize(x, y)], k: "crystal" });
    else if (kd === "caillou") out.push({ x, y, s: 0.45, k: "caillou" });
    else if (kd === "crevasse") out.push({ x, y, s: 0.50, k: "crevasse" });
  }
  return out;
}
// le premier occupant que recouvrirait une empreinte s posée en (x,y), ou null
function fpGene(x, y, s, ignore) {
  for (const o of occupants(ignore)) {
    const d = (s + o.s) / 2 + FP_MARGE;
    if (Math.abs(o.x - x) < d - 1e-9 && Math.abs(o.y - y) < d - 1e-9) return o;   // epsilon : a l'ecart EXACTEMENT legal, le bruit flottant ne doit pas refuser
  }
  return null;
}
function fpLibre(x, y, s, ignore) { return !fpGene(x, y, s, ignore); }
// pourquoi une place accepte (ou refuse) un objet — sert au fantôme de pose
const SOL_REFUS = {
  crystal: "Il y a des cristaux ici ✨",
  caillou: "Il faut d'abord déblayer les cailloux",
  crevasse: "C'est une crevasse — il faut la colmater",
  lac: "🌊 Le Grand Lac — on n'y bâtit rien",
  montagne: "⛰ La chaîne de montagnes — impossible d'y bâtir",
};
/* Le sol sous une empreinte : on interroge la case du CENTRE et celles des
   QUATRE COINS. Le lac et les montagnes ne sont pas des occupants (ce sont des
   zones entières, pas des objets) : sans les coins, un socle décalé pouvait
   mordre sur l'eau tout en ayant son centre sur le sable. */
function solSous(x, y, s) {
  const h = s / 2;
  for (const [px, py] of [[x, y], [x - h, y - h], [x + h, y - h], [x - h, y + h], [x + h, y + h]]) {
    const kd = tileAt(px, py).kind;
    if (kd === "lac" || kd === "montagne") return kd;
  }
  return "sand";
}
function posableWhy(t, x, y, ignore) {
  const s = fpOf(t, x, y), h = s / 2;
  /* l'EMPREINTE entière doit tenir sur le plateau (les cases vont de bmin−0,5 à
     bmax+0,5 en continu) : sinon le sprite pend au-dessus de la falaise */
  if (x - h < bmin() - 0.5 || y - h < bmin() - 0.5 || x + h > bmax() + 0.5 || y + h > bmax() + 0.5)
    return { ok: false, why: "C'est en dehors du terrain" };
  const sol = solSous(x, y, s);
  if (sol !== "sand") return { ok: false, why: SOL_REFUS[sol] };
  const g = fpGene(x, y, s, ignore);
  if (g) {
    if (g.k === "src") return { ok: false, why: "C'est la Source", bx: g.x, by: g.y };
    if (SOL_REFUS[g.k]) return { ok: false, why: SOL_REFUS[g.k], bx: g.x, by: g.y };
    if (g.k === "bld") return { ok: false, why: "Trop près de " + BT[g.b.t].nm + " — laisse un peu de bord", bx: g.x, by: g.y };
    return { ok: false, why: "Trop près — laisse un peu de bord", bx: g.x, by: g.y };
  }
  return { ok: true };
}
/* La place libre la plus proche d'un point, en continu : spirale de pas fins
   autour du point demandé, la première position posable gagne. Sert au miroir
   quand la place promise a été prise entre-temps, et à toute pose « au plus
   près » sans écraser un voisin. */
function placeLibreProche(t, x, y, ignore, rayonMax) {
  const R = rayonMax || 3, PAS = 0.25;
  if (posable(t, x, y, ignore)) return { x: quant(x), y: quant(y) };
  for (let r = PAS; r <= R; r += PAS) {
    const n = Math.max(8, Math.round(2 * Math.PI * r / PAS));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI;
      const px = quant(x + r * Math.cos(a)), py = quant(y + r * Math.sin(a));
      if (posable(t, px, py, ignore)) return { x: px, y: py };
    }
  }
  return null;
}
// une case peut-elle accueillir un objet de type t ?
function posable(t, x, y, ignore) { return posableWhy(t, x, y, ignore).ok; }
// une case peut-elle accueillir un drone ouvrier ? (cristaux libres)
function posableUnit(x, y) {
  if (!inB(x, y)) return { ok: false, why: "C'est en dehors du terrain" };
  if (tileAt(x, y).kind !== "crystal") return { ok: false, why: "Pose le drone sur des cristaux ✨" };
  if (S.units.some((u) => u.x === x && u.y === y)) return { ok: false, why: "Un drone y travaille déjà" };
  return { ok: true };
}
/* Une CASE est « constructible » si son sol est du sable et qu'aucun bâtiment
   n'y est ANCRÉ. Sert aux taps sur le terrain (ouvrir la palette), aux
   apparitions (éclats, cailloux). Test sur l'ancre : en pose libre, un bâtiment
   posé à cheval n'empêche pas de viser la case voisine — c'est l'empreinte, au
   moment de la pose, qui tranchera. */
const buildable = (x, y) =>
  inB(x, y) &&
  tileAt(x, y).kind === "sand" &&
  !(x === SRC.x && y === SRC.y) &&
  !bldAtTile(x, y);
/* Bonus de proximité aux gisements : lu sur la case d'ancrage (arrondi), donc
   déterministe et lisible — « adjacent à la case » — même pour une position
   continue. */
function crysAdj(x, y) {
  x = Math.round(x); y = Math.round(y);
  let n = 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
    if (inB(x + dx, y + dy) && tileAt(x + dx, y + dy).kind === "crystal") n++;
  return n;
}
const EXP_COSTS = [450, 1350, 4050, 12150]; // terrain infini : l'expansion respire
const CLEAR_COST = 50;

