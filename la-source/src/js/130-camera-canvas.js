/* ---------- caméra / canvas ---------- */
const cv = $("#cv");
let ctx = cv.getContext("2d");   // `let` : temporairement redirigé vers le canvas de FOND pendant son (re)dessin
// Canvas de FOND empilé DERRIÈRE #cv (porte le terrain statique). Le compositeur GPU
// le superpose gratuitement, même sur Firefox — on ne le redessine qu'au changement
// de caméra/état, JAMAIS de copie par image (retour profil Firefox 16/08 : le blit
// drawImage plein écran coûtait 33 %). #cv, dessus, ne porte plus que les sprites,
// sur fond transparent. `sKey` = signature de l'état du fond actuellement peint.
const cvbg = $("#cv-bg");
const bgctx = cvbg.getContext("2d");
let sKey = "";
// TROISIÈME couche, tout au fond : le WALLPAPER (nébuleuse + voile). Il ne dépend
// que de la taille de la fenêtre — jamais de la caméra — mais il était repeint à
// chaque pan avec le terrain (22 % du temps de pan, profil 17/08). Il vit ici,
// peint UNE fois par resize, transparent sous le plateau (#cv-bg est CLIPPÉ au
// losange du territoire, donc la nébuleuse apparaît tout autour naturellement).
const cvwall = $("#cv-wall");
const wallctx = cvwall.getContext("2d");
let wallKey = "";
let W = 0, H = 0, DPR = 1;
function resize() {
  // DPR plafonné à 1.5 (retour profil perf 16/08) : au-delà, le canvas rempli en
  // pixels réels coûte ×(DPR²) — DPR 2 = 4× de remplissage pour un gain de netteté
  // imperceptible sur ce rendu isométrique. 1.5 = compromis net/coût.
  DPR = Math.min(1.5, window.devicePixelRatio || 1);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  cvbg.width = W * DPR; cvbg.height = H * DPR;   // le canvas de fond suit la même taille
  cvwall.width = W * DPR; cvwall.height = H * DPR;
  sKey = ""; wallKey = "";                       // et doivent être redessinés
  drawHublot();
}
// peint le wallpaper sur sa couche, seulement si sa clé (taille + asset + vue) a changé
function drawWallLayer() {
  const key = W + "|" + H + "|" + DPR.toFixed(2) + "|" + (WALL.ok ? 1 : 0) + "|" + view;
  if (key === wallKey) return;
  wallKey = key;
  const real = ctx;
  ctx = wallctx;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  if (view === "col") drawWallpaper();
  ctx = real;
}

