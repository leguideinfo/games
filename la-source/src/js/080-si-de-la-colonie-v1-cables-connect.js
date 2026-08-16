/* ---------- SI de la colonie (v1) : câbles, connectivité, équipements ---------- */
/* IDENTITÉ RÉSEAU PAR IDENTIFIANT (pose libre, 15/08).
   Jusqu'ici l'identité d'une machine sur le réseau ETAIT sa case : les câbles
   pointaient sur « x,y », et déplacer un bâtiment obligeait à réécrire ses
   câbles. Avec la pose libre, deux petits modules peuvent partager une case et
   une position vaut « 4,437,3,2 » : la case ne peut plus servir de nom. Chaque
   bâtiment reçoit donc un identifiant stable (b.id, compteur S.nid) et les
   câbles pointent dessus — un déplacement ne touche plus aux câbles.
   Les clés « x,y » restent COMPRISES en lecture (nodeAt, nkey) : elles resolvent
   vers le bâtiment ancré sur cette case. C'est ce qui garde vivants les appels
   de l'API de test (link/build par coordonnées entières) et les vieux liens le
   temps de la migration v14. */
const keyOf = (b) => "b" + b.id;
/* Positions continues quantifiées au millième de case : c'est moins d'un pixel
   au zoom le plus fort, et cela évite qu'un 4,4996 dérive vers une autre case
   d'ancrage au fil des arrondis. Déclaré AVANT newBld qui s'en sert (TDZ). */
const quant = (v) => Math.round(v * 1000) / 1000;
const anc = (v) => Math.round(v);                        // la case d'ancrage d'une position continue
/* Toute création passe ici : c'est le seul endroit qui distribue les
   identifiants, donc le seul à pouvoir garantir qu'ils sont uniques. */
function newBld(t, x, y, l) {
  if (S.nid == null) S.nid = 1 + S.buildings.reduce((m, b) => Math.max(m, b.id || 0), 0);
  return { id: S.nid++, t, x: quant(x), y: quant(y), l: l || 1 };
}
const bldAtTile = (x, y, ignore) => { const ax = anc(x), ay = anc(y); return S.buildings.find((b) => b !== ignore && anc(b.x) === ax && anc(b.y) === ay) || null; };
const nkey = (x, y) => { const b = bldAtTile(x, y); return b ? keyOf(b) : anc(x) + "," + anc(y); };
const PORTS = { src: 3, coffret: 4, switchhub: 8, dhcpsrv: 1, bld: 2 };
function nodeAt(k) {
  if (k === "src") return { k, t: "src", x: SRC.x, y: SRC.y, nm: "La Source" };
  let b = null;
  if (typeof k === "string" && k[0] === "b") b = S.buildings.find((b2) => "b" + b2.id === k) || null;
  else { const [x, y] = String(k).split(",").map(Number); b = bldAtTile(x, y); }
  return b ? { k: keyOf(b), t: b.t, x: b.x, y: b.y, nm: BT[b.t].nm, b } : null;
}
function portMax(k) { const n = nodeAt(k); return n ? (PORTS[n.t] || PORTS.bld) : 0; }
function portUsed(k) { return S.links.filter((l) => l.a === k || l.b === k).length; }
let netDirty = true, netSet = new Set(["src"]);
function netRecalc() {
  netSet = new Set(["src"]);
  let moved = true;
  while (moved) {
    moved = false;
    for (const l of S.links) {
      if (netSet.has(l.a) && !netSet.has(l.b)) { netSet.add(l.b); moved = true; }
      if (netSet.has(l.b) && !netSet.has(l.a)) { netSet.add(l.a); moved = true; }
    }
  }
  netDirty = false;
}
function netConnected(k) { if (netDirty) netRecalc(); return netSet.has(k); }
function netFactor(b) { // malus doux une fois le réseau éveillé (mission 11+)
  if (S.mi < 12) return 1;
  return netConnected(keyOf(b)) ? 1 : 0.7;
}
function allLinked() {
  return S.buildings.length > 0 && S.buildings.every((b) => netConnected(keyOf(b)));
}
function dhcpOnline() {
  return S.buildings.some((b) => b.t === "dhcpsrv" && netConnected(keyOf(b)));
}
/* Adresses dérivées de l'IDENTIFIANT, plus de la case : deux machines dans la
   même case auraient partagé une IP — le contraire de ce qu'enseigne le DHCP. */
function ipOf(k) {
  const n = nodeAt(k);
  if (!n) return "?";
  if (n.t === "src") return "10.7.0.1";
  return "10.7." + (10 + Math.floor(n.b.id / 200)) + "." + (10 + (n.b.id % 200));
}
function macOf(k) {
  const n = nodeAt(k);
  if (!n) return "?";
  const seed = n.t === "src" ? 1 : n.b.id + 1;
  const h = hash2(seed * 7 + 101, seed * 13 + 47).toString(16).padStart(8, "0");
  return ("aw:07:" + h.slice(0, 2) + ":" + h.slice(2, 4) + ":" + h.slice(4, 6) + ":" + h.slice(6, 8)).toUpperCase();
}
function addLink(ka, kb) {
  // les clés se NORMALISENT sur l'identifiant : « x,y » d'un appel de test et
  // « b12 » d'un clic désignent la même machine et le même câble
  const na = nodeAt(ka), nb = nodeAt(kb);
  if (na) ka = na.k; if (nb) kb = nb.k;
  if (ka === kb) return "une machine ne se câble pas à elle-même.";
  if (!na || !nb) return "câble un bâtiment ou la Source.";
  if (S.links.some((l) => (l.a === ka && l.b === kb) || (l.a === kb && l.b === ka))) return "déjà câblés.";
  if (portUsed(ka) >= portMax(ka)) return "plus de ports libres sur " + nodeAt(ka).nm + ".";
  if (portUsed(kb) >= portMax(kb)) return "plus de ports libres sur " + nodeAt(kb).nm + ".";
  if (S.mat < 10) return "il faut 10 💠 pour un câble.";
  S.mat -= 10;
  S.links.push({ a: ka, b: kb });
  netDirty = true;
  sfx.build();
  save();
  return null;
}

function colonyLevel() { return 1 + Math.floor(bsum("extracteur") / 2 + S.buildings.length / 2 + S.techs.length); }
function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e4) return Math.round(n / 1e3) + "k";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(Math.floor(n));
}

