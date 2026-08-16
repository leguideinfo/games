/* ================= LA SOURCE — vertical slice ================= */

const $ = (s) => document.querySelector(s);
// N'écrit dans le DOM que si la valeur a CHANGÉ. Le HUD (~15 compteurs) était
// réécrit à chaque image (60/s) → recalcul de style/layout permanent, gros poste
// « Scripting/Rendering » du profil perf (16/08). Les valeurs bougent lentement :
// on cache le nœud + la dernière valeur, on ne touche au DOM que sur changement.
const _hudEl = {}, _hudV = {};
function setTxt(id, v) {
  if (_hudV[id] === v) return;
  _hudV[id] = v;
  const el = _hudEl[id] || (_hudEl[id] = document.getElementById(id));
  if (el) el.textContent = v;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (n) => Math.floor(Math.random() * n);

