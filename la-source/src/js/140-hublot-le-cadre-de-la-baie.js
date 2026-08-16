/* ---------- hublot : le cadre de la baie ----------
   Trace en pixels reels plutot qu'en viewBox etiree : un viewBox mis a l'echelle
   ecraserait les angles coupes des que la fenetre n'est pas au ratio d'origine,
   et l'epaisseur du cadre varierait avec la largeur. Ici chaque segment est
   calcule pour la taille courante, donc les angles restent nets partout.
   Le renflement du bas est mesure sur la barre d'onglets : elle s'y loge, et il
   suit toute seule quand un onglet apparait (TECHNOS, RESEAU…). */
const HB = { cote: 18, haut: 20, bas: 18, chanf: 26 };
let hbSign = "";
/* Declare AVANT drawHublot, pas apres : un `const` lu avant sa ligne leve une
   TDZ qui tue tout le script — c'est exactement ce qui avait casse le jeu en
   amont (skipSatisfied appele trop tot). */
const VERRE_OK = !!(window.CSS && CSS.supports && CSS.supports("clip-path", 'path("M0 0Z")'));
/* Le masque alpha est prefere au clip pour les bords lisses (voir drawHublot). */
const MASQUE_OK = !!(window.CSS && CSS.supports &&
  (CSS.supports("mask-image", "linear-gradient(#000,#000)") ||
   CSS.supports("-webkit-mask-image", "linear-gradient(#000,#000)")));
function drawHublot() {
  const svg = $("#hublot");
  if (!svg) return;
  const w = Math.round(svg.clientWidth), h = Math.round(svg.clientHeight);
  if (!w || !h) return;
  /* Mobile : aucun cadre (le CSS le masque deja, on evite ici de tracer pour
     rien — et surtout de laisser un ancien trace se rafficher au retour en
     grand ecran avec des coordonnees perimees). */
  if (w < 760) { hbSign = "mobile"; return; }
  const tabs = $("#tabs");
  const tr = tabs && !tabs.hidden ? tabs.getBoundingClientRect() : null;
  const tw = tr ? Math.round(tr.width) : 0, th = tr ? Math.round(tr.height) : 0;
  /* CE QUE LES BANDES D'UNIVERSE OCCUPENT. Embarque, le rail et le bandeau de
     ressources flottent AU-DESSUS du plateau : un cadre trace depuis les bords
     de l'iframe disparait purement et simplement dessous (retour proprietaire :
     « en haut et cote droit le hud disparait sous les bandes »). Universe mesure
     donc son encombrement et nous l'envoie ; on s'en ecarte, et LARGEMENT — 18 px
     de marge en plus des barres, pour que le contour respire au lieu de les
     fraler. En autonome, ces valeurs sont nulles et rien ne change. */
  const px = (nom, repli) => {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(nom));
    return isFinite(v) ? v : repli;
  };
  const AIR = EMBED ? 18 : 0;                     // la « marge genereuse » demandee
  /* Le bandeau de ressources d'Universe n'a plus ni fond ni bordure dans cette
     vue : le cadre n'a donc plus a se tenir SOUS une bande, seulement a l'ecart
     de ses textes. On le remonte d'autant (demande du proprietaire : « remonte
     en haut de 40 px »). Jamais au-dessus de zero : le cadre resterait hors ecran. */
  const REMONTE = EMBED ? 40 : 0;
  /* A gauche, le rail n'a plus de fond : ses icones tiennent dans 56 px mais le
     cadre n'a pas a leur ceder toute la marge. On en reprend une dizaine de
     pixels (demande du proprietaire), sans jamais empieter sur les icones. */
  const REPRIS_G = EMBED ? 36 : 0;   // le cadre affleure le rail, au niveau des icones
  const oG = EMBED ? Math.max(0, px("--u-gauche", 56) + AIR - REPRIS_G) : 0;
  const oH = EMBED ? Math.max(0, px("--u-haut", 46) + AIR - REMONTE) : 0;
  const oB = EMBED ? px("--u-bas", 0) + AIR : 0;
  const sign = w + "x" + h + "/" + tw + "x" + th + "@" + (tr ? Math.round(tr.top) : -1) +
               "/" + Math.round(oG) + "," + Math.round(oH) + "," + Math.round(oB);
  if (sign === hbSign) return;          // rien n'a bouge : on ne retrace pas
  hbSign = sign;
  svg.setAttribute("viewBox", "0 0 " + w + " " + h);

  const c = Math.round(Math.min(HB.chanf, w / 8, h / 8));
  const L = Math.round(oG + HB.cote), R = w - HB.cote,
        B = Math.round(h - oB - HB.bas);
  /* Le montant du haut doit TOUJOURS couvrir le bandeau de ressources. La
     remontee demandee plus haut le placait a 53 px ; le bandeau est ensuite passe
     de 46 a 55 px et son texte est ressorti dessous — on croyait voir « le fond
     qui n'a pas grandi » alors que c'est ce montant, et non le bandeau, qui fait
     la bande sombre (le bandeau, lui, est transparent dans cette vue). On borne
     donc le bord interieur sous le bandeau, remontee ou pas. */
  const uHaut = EMBED ? px("--u-haut", 46) : 0;
  let T = Math.round(oH + HB.haut);
  if (EMBED) T = Math.max(T, Math.round(uHaut + 6));
  /* Tout se centre sur l'OUVERTURE, pas sur la largeur brute : le rail mange
     56 px a gauche, donc l'axe optique est a (L+R)/2 — sinon le cadre penche. */
  const uW = Math.round(Math.min((R - L) * 0.26, 300)), uD = 16, uS = 20;
  const ux1 = Math.round(L + (R - L - uW) / 2), ux2 = ux1 + uW;
  /* Logement des onglets, borne sur l'ouverture : ses pieds evases doivent rester
     DANS le bord bas, sinon le trace se croise et la regle even-odd creuse deux
     coins TRANSPARENTS juste au-dessus des onglets (fenetre etroite). */
  /* Logement affine : pente plus longue (38 au lieu de 24) et moins haute, pour
     un raccord glissant plutot qu'un ressaut. C'est la barre d'onglets qui doit
     se remarquer, pas son socle. */
  const dS = 38;
  const dW = Math.round(Math.min(Math.max(tw + 26, 240), (R - c) - (L + c) - 2 * dS));
  const dx1 = Math.round(L + (R - L - dW) / 2), dx2 = dx1 + dW;
  /* Le bord du logement se pose a la MEME distance du bouton que le bas de
     l'ecran : on mesure la marge sous les onglets et on la reporte au-dessus,
     au lieu d'un ecart devine — celui-ci laissait le haut plus aere que le bas. */
  const bouton = tabs ? tabs.querySelector("button:not([hidden])") : null;
  const br = bouton ? bouton.getBoundingClientRect() : null;
  const dY = br ? Math.round(br.top - Math.max(0, h - br.bottom))
                : (tr ? Math.round(tr.top - 7) : B - 26);

  const trou =
    "M" + (L + c) + " " + T +
    "L" + (ux1 - uS) + " " + T + "L" + ux1 + " " + (T + uD) +
    "L" + ux2 + " " + (T + uD) + "L" + (ux2 + uS) + " " + T +
    "L" + (R - c) + " " + T + "L" + R + " " + (T + c) +
    "L" + R + " " + (B - c) + "L" + (R - c) + " " + B +
    "L" + (dx2 + dS) + " " + B + "L" + dx2 + " " + dY +
    "L" + dx1 + " " + dY + "L" + (dx1 - dS) + " " + B +
    "L" + (L + c) + " " + B + "L" + L + " " + (B - c) +
    "L" + L + " " + (T + c) + "Z";
  /* Le fond du cadre va JUSQU'AUX BORDS. Une version precedente le faisait
     demarrer au bord interieur des bandes d'Universe, pour eviter d'empiler deux
     verres translucides (.97 d'opacite et deux flous au lieu de .82 et un seul).
     Ces bandes n'ont plus ni fond ni flou dans cette vue : il n'y a plus rien a
     empiler, et s'en ecarter laissait au contraire une lisiere NON PEINTE le
     long du haut et de la gauche — le fond « n'allait pas jusqu'en haut ».
     Si le chrome d'Universe reprenait un jour un fond ici, il faudrait revenir
     a un rectangle borne par oG/oH/oB. */
  const plaque = "M0 0H" + w + "V" + h + "H0Z" + trou;
  $("#hb-plaque").setAttribute("d", plaque);
  $("#hb-ombre").setAttribute("d", trou);
  $("#hb-arete").setAttribute("d", trou);
  $("#hb-liseret").setAttribute("d", trou);
  /* LE VERRE, DECOUPE AU MASQUE ET NON AU CLIP.
     `clip-path: path()` sur un calque qui porte un backdrop-filter est applique
     par le moteur en geometrie brute, SANS lissage : les diagonales du cadre —
     angles coupes et pentes du logement — sortaient en marches d'escalier,
     d'autant plus visibles que le liseret SVG juste au-dessus, lui, est
     antialiase. Un masque alpha (mask-image) est compose avec lissage : meme
     forme, meme resultat, bords nets. Repli sur clip-path la ou le masque
     manque, et sur la plaque SVG (opaque, sans flou) en dernier recours. */
  const verre = $("#hb-verre");
  if (verre && VERRE_OK) {
    if (MASQUE_OK) {
      const svgM = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h +
                   "' viewBox='0 0 " + w + " " + h + "'><path fill='#fff' fill-rule='evenodd' d='" +
                   plaque + "'/></svg>";
      const uri = 'url("data:image/svg+xml,' + encodeURIComponent(svgM).replace(/'/g, "%27") + '")';
      verre.style.clipPath = "none";
      verre.style.webkitMaskImage = uri;
      verre.style.maskImage = uri;
      verre.style.webkitMaskSize = verre.style.maskSize = "100% 100%";
      verre.style.webkitMaskRepeat = verre.style.maskRepeat = "no-repeat";
    } else {
      verre.style.clipPath = 'path(evenodd, "' + plaque + '")';
    }
    verre.style.display = "block";
    $("#hb-plaque").style.display = "none";
  }
}
/* Le cadre ne peut pas dependre de la boucle d'animation : elle est gelee tant
   que l'onglet est cache (meme cause que l'ecran noir au retour, voir plus bas).
   Un ResizeObserver le retrace des que la boite change, layout initial compris. */
if (window.ResizeObserver) {
  try { new ResizeObserver(() => drawHublot()).observe($("#app")); } catch (e) {}
}
window.addEventListener("resize", () => { resize(); clampCam(); });
/* ÉCRAN NOIR AU RETOUR SUR L'ONGLET — cause et remède (retour user 14/08).
   Montée derrière un display:none (onglet du rail pas encore ouvert), le canvas
   mesure 0×0 : resize() fige width/height à 0 et le plateau dessine dans le vide.
   Au retour, l'iframe ne change pas de taille pour le navigateur : AUCUN
   événement resize ne part, et le canvas reste noir à jamais.
   Le remède ne doit dépendre ni du resize de l'hôte NI du rAF (gelé tant que la
   page est cachée) : healCanvas() est appelé par frame(), par le message du
   Chantier (1 Hz quand la vue est ouverte) et au retour de visibilité. */
function healCanvas() {
  if (cv.clientWidth === W && cv.clientHeight === H) return false;
  const naissance = !W;   // le plateau n'a jamais eu de vraies dimensions
  resize(); clampCam();
  if (naissance) fitCam();
  return true;
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) healCanvas(); });
window.addEventListener("pageshow", healCanvas);

const UI_FONT = getComputedStyle(document.body).fontFamily;
const cam = { x: 0, y: 0, z: 1 };
function w2s(x, y) {
  return {
    x: ((x - y) * TW / 2) * cam.z + cam.x,
    y: ((x + y) * TH / 2) * cam.z + cam.y,
  };
}
/* Écran → monde CONTINU : la position réelle sous le pointeur, en cases
   fractionnaires. C'est elle que lit la pose libre. */
function s2wF(sx, sy) {
  const ix = (sx - cam.x) / cam.z, iy = (sy - cam.y) / cam.z;
  return { x: (ix / (TW / 2) + iy / (TH / 2)) / 2, y: (iy / (TH / 2) - ix / (TW / 2)) / 2 };
}
/* Écran → CASE : la version arrondie, gardée pour tout ce qui vise le terrain
   (cristaux, crevasses, lac, Source, ouvrir la palette sur une case). */
function s2w(sx, sy) {
  const f = s2wF(sx, sy);
  return { x: Math.round(f.x), y: Math.round(f.y) };
}
/* AIMANTATION. Le seuil est en PIXELS ÉCRAN, pas en fraction de case : au zoom
   fort il faut vraiment approcher le centre de la case pour s'y coller — c'est
   le « vraiment près » demandé —, au zoom faible l'aimant attrape de plus loin,
   ce qui est confortable. Au doigt, un peu plus large qu'à la souris. */
const SNAP_PX = { mouse: 12, touch: 18 };
function aimante(f, tactile) {
  const cx = Math.round(f.x), cy = Math.round(f.y);
  const p = w2s(f.x, f.y), c = w2s(cx, cy);
  const seuil = tactile ? SNAP_PX.touch : SNAP_PX.mouse;
  if (Math.hypot(p.x - c.x, p.y - c.y) <= seuil) return { x: cx, y: cy, snap: true };
  return { x: quant(f.x), y: quant(f.y), snap: false };
}
function centerCam(tx, ty) {
  const gx = tx == null ? SRC.x : tx, gy = ty == null ? SRC.y : ty;
  const c = { x: ((gx - gy) * TW / 2), y: ((gx + gy) * TH / 2) };
  cam.x = W / 2 - c.x * cam.z;
  cam.y = H / 2 - c.y * cam.z - 20;
}
function fitCam() {
  const zb = zBounds();
  // arrivée très rapprochée : on découvre la balise et ses environs (~5 cases)
  cam.z = Math.min(zb.hi, Math.max(zb.lo, (W * 0.95) / ((W <= 760 ? 3.2 : 5) * TW)));
  centerCam();
  clampCam();
}

