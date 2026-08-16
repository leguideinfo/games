/* ---------- terrain (procédural infini, stable par coordonnée) ---------- */
const tcache = new Map();
let clearedSet = new Set(S.cleared || []);
let rubbleSet = new Set(S.rubble || []);
function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
function tileAt(x, y) {
  /* Le terrain est indexé par CASE ENTIÈRE. Depuis la pose libre, les positions
     des bâtiments sont continues : un appelant qui passerait 4,437 créerait une
     tuile fantôme dans le cache et lirait un sol qui n'existe pas. On arrondit
     ici même — c'est la case d'ancrage qui est interrogée, jamais une fraction. */
  x = Math.round(x); y = Math.round(y);
  const k = x + "," + y;
  let t = tcache.get(k);
  if (!t) {
    const r = mulberry32(hash2(x, y) ^ 1337);
    const v = r();
    let kind = "sand";
    if (!(x === SRC.x && y === SRC.y)) {
      if (v > 0.87) kind = "crystal";
      else if (v > 0.825) kind = "crevasse";
      else if (v > 0.78) kind = "caillou";
      // map de départ : 2 crevasses max, en positions intérieures (jamais en bordure)
      if (kind === "crevasse" && x >= 0 && x <= 8 && y >= 0 && y <= 8 &&
          !((x === 4 && y === 1) || (x === 2 && y === 5))) kind = "sand";
      // la case en diagonale derrière la balise reste dégagée (retour propriétaire)
      if (x === SRC.x - 1 && y === SRC.y - 1) kind = "sand";
      // le grand lac prime sur tout : ni décor, ni objet (retour propriétaire)
      if (lacSet.has(k)) kind = "lac";
      if (montSet.has(k)) kind = "montagne"; // relief : on n'y bâtit pas
      // les gisements évitent les zones : lac, montagnes, dunes, zone fertile
      if (kind === "crystal" && (duneSet.has(k) || fertSet.has(k))) kind = "sand";
      // sur le plateau de départ, les gisements sont EXACTEMENT aux
      // emplacements choisis (le tirage procédural en collait aux zones)
      if (x >= 0 && x < GRID && y >= 0 && y < GRID)
        kind = crxSpots.has(k) ? "crystal" : (kind === "crystal" ? "sand" : kind);
    }
    t = { kind, j: r() };
    tcache.set(k, t);
  }
  if ((t.kind === "crevasse" || t.kind === "caillou") && clearedSet.has(k)) return { kind: "sand", j: t.j };
  if (t.kind === "crystal" && S.crxDead[k]) return { kind: "sand", j: t.j }; // gisement épuisé (respawn à venir)
  if (t.kind === "sand" && rubbleSet.has(k)) return { kind: "caillou", j: t.j };
  return t;
}
const bmin = () => -S.ext;
const bmax = () => GRID - 1 + S.ext;
const inB = (x, y) => x >= bmin() && y >= bmin() && x <= bmax() && y <= bmax();
