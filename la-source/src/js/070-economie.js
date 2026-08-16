/* ---------- économie ---------- */
const bcount = (t) => S.buildings.filter((b) => b.t === t).length;
const bsum = (t) => S.buildings.filter((b) => b.t === t).reduce((a, b) => a + b.l, 0);
function globalMult() { return (1 + 0.04 * bsum("console")) * S.buffMult; }
function matRate(sansDrones) {
  const ex = S.buildings.filter((b) => b.t === "extracteur")
    .reduce((a, b) => a + 0.7 * Math.pow(b.l, 1.4) * (1 + 0.15 * crysAdj(b.x, b.y)) * netFactor(b), 0);
  const net = 0.35 * S.buildings.filter((b) => b.t === "reseau").reduce((a, b) => a + b.l * netFactor(b), 0);
  // les drones ne produisent plus de matériaux : ils minent des cristaux 💎
  const malus = mobs.length ? 0.85 : 1;
  return (ex + net) * globalMult() * malus;
}
function eoRate() {
  const srv = S.buildings.reduce((a, b) => a + (b.t === "serveur"
    ? Math.pow(b.l, 1.3) * netFactor(b) : 0), 0);
  const parc = S.buildings.reduce((a, b) => a + (b.t === "ferme"
    ? 4 * Math.pow(b.l, 1.3) * netFactor(b) : 0), 0);
  return 0.05 * (srv + parc) * globalMult();
}
function matCap() { return 300 + S.buildings.filter((b) => b.t === "entrepot").reduce((a, b) => a + 250 * Math.pow(b.l, 1.2), 0); }
function eoCap() { return 20 + S.buildings.filter((b) => b.t === "datacenter").reduce((a, b) => a + 40 * Math.pow(b.l, 1.2), 0); }
function enCap() { return 100 + S.buildings.filter((b) => b.t === "centrale").reduce((a, b) => a + 80 * Math.pow(b.l, 1.15), 0); }
function enUse(extra) {
  let u = S.buildings.reduce((a, b) => a + BT[b.t].conso * b.l, 0) + (extra || 0);
  if (S.techs.includes("firewall")) u *= 0.85;
  return u;
}
function buildCost(t) { return Math.round(BT[t].base * Math.pow(1.6, bcount(t))); }
// Déplacer coûte cher : 60 % du prix courant du bâtiment, plancher 60 💠.
// On ne rembourse rien, on paie la grue — mais on ne perd pas ses niveaux.
function moveCost(b) { return Math.max(60, Math.round(buildCost(b.t) * 0.6)); }
function buildCostEo(t) { return BT[t].eo ? Math.round(BT[t].eo * Math.pow(1.6, bcount(t))) : 0; }
function upCost(b) { return Math.round(BT[b.t].base * 0.8 * Math.pow(1.6, b.l)); }
