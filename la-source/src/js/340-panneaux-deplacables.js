/* ---------- PANNEAUX DEPLACABLES ----------
   Meme geste que les fenetres de la console : on saisit la BARRE DU HAUT — ou
   le BORD BAS (retour 16/08) —, le panneau suit, il s'aimante doucement aux
   bords et ne peut jamais sortir de l'ecran : sa zone de saisie reste toujours
   rattrapable, sinon un panneau lache trop loin deviendrait irrecuperable.
   En mode embarque, le plancher vertical est le chrome de la console
   (--u-haut) : un panneau glisse a top 0 passait SOUS le bandeau d'Universe
   (z-index superieur), sa barre devenait incliquable — bloque en haut
   (retour 16/08). Une fois saisi, les fleches le deplacent au
   clavier (Maj = pas large) ; un double-clic sur la barre le remet a sa place.
   La position est retenue par panneau d'une partie a l'autre.
   Souris seulement, et au-dessus de 760 px : au doigt et sur mobile, une feuille
   se lit en bas de l'ecran, pleine largeur — la deplacer n'aurait aucun sens. */
const SH_POS = "ls-fenetres-v1";
let shPos = {};
try { shPos = JSON.parse(localStorage.getItem(SH_POS) || "{}") || {}; } catch (e) { shPos = {}; }
const shSave = () => { try { localStorage.setItem(SH_POS, JSON.stringify(shPos)); } catch (e) {} };
const shMobile = () => window.innerWidth < 760;

function shPose(el, x, y) {
  const p = el.offsetParent || document.getElementById("app");
  const lp = p ? p.clientWidth : window.innerWidth;
  const hp = p ? p.clientHeight : window.innerHeight;
  const ATTRAPE = 56;   // ce qui doit rester visible pour pouvoir le reprendre
  // plancher vertical : sous le chrome de la console en mode embarque, sinon la
  // barre de saisie glisse sous le bandeau (z-index superieur) et devient incliquable
  let mn = 0;
  if (typeof EMBED !== "undefined" && EMBED) {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--u-haut"));
    mn = (isNaN(v) ? 46 : v) + 2;
  }
  const bx = Math.round(Math.max(ATTRAPE - el.offsetWidth, Math.min(x, lp - ATTRAPE)));
  const by = Math.round(Math.max(mn, Math.min(y, hp - 44)));
  el.style.left = bx + "px"; el.style.top = by + "px";
  el.style.right = "auto"; el.style.bottom = "auto"; el.style.marginInline = "0";
  el.classList.add("pose");
  return { x: bx, y: by };
}
function shReset(el) {
  el.classList.remove("pose");
  el.style.left = el.style.top = el.style.right = el.style.bottom = el.style.marginInline = "";
  if (el.id) { delete shPos[el.id]; shSave(); }
}
function shDansLaBarre(el, e) {
  const r = el.getBoundingClientRect();
  // barre du haut (46) OU bord bas (28) : les deux prises menent au meme geste
  // (les elements interactifs restent proteges par le garde `closest` en amont)
  return (e.clientY - r.top) <= 46 || (r.bottom - e.clientY) <= 28;
}
function rendreDeplacable(el) {
  let g = null;
  el.addEventListener("pointerdown", (e) => {
    if (shMobile() || e.pointerType !== "mouse" || e.button !== 0) return;
    if (e.target.closest("button, input, select, textarea, a, .bcard")) return;
    if (!shDansLaBarre(el, e)) return;
    g = { px: e.clientX, py: e.clientY, x: el.offsetLeft, y: el.offsetTop, id: e.pointerId, bouge: false };
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });
  el.addEventListener("pointermove", (e) => {
    if (!g || e.pointerId !== g.id) return;
    if ((e.buttons & 1) === 0) { g = null; document.body.classList.remove("sh-drag"); return; }
    const dx = e.clientX - g.px, dy = e.clientY - g.py;
    if (!g.bouge) {
      if (Math.abs(dx) + Math.abs(dy) < 5) return;   // un clic n'est pas un glissement
      g.bouge = true; document.body.classList.add("sh-drag"); el.focus({ preventScroll: true });
    }
    const p = el.offsetParent || document.getElementById("app");
    const lp = p ? p.clientWidth : window.innerWidth, hp = p ? p.clientHeight : window.innerHeight;
    let x = g.x + dx, y = g.y + dy;
    const A = 14, M = 16;                            // aimantation douce aux bords
    if (Math.abs(x - M) < A) x = M;
    if (Math.abs(y - M) < A) y = M;
    if (Math.abs(x + el.offsetWidth - (lp - M)) < A) x = lp - M - el.offsetWidth;
    if (Math.abs(y + el.offsetHeight - (hp - M)) < A) y = hp - M - el.offsetHeight;
    const b = shPose(el, x, y);
    if (el.id) shPos[el.id] = b;
  });
  const fin = () => { if (!g) return; if (g.bouge) shSave(); g = null; document.body.classList.remove("sh-drag"); };
  el.addEventListener("pointerup", fin);
  el.addEventListener("pointercancel", fin);
  el.addEventListener("lostpointercapture", fin);
  el.addEventListener("dblclick", (e) => {
    if (shMobile() || !shDansLaBarre(el, e)) return;
    if (e.target.closest("button, a")) return;
    shReset(el);
  });
  el.tabIndex = -1;
  el.addEventListener("keydown", (e) => {
    if (shMobile() || !el.classList.contains("pose")) return;
    const pas = e.shiftKey ? 24 : 6;
    const d = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] }[e.key];
    if (!d) return;
    const b = shPose(el, el.offsetLeft + d[0], el.offsetTop + d[1]);
    if (el.id) { shPos[el.id] = b; shSave(); }
    e.preventDefault();
  });
}
/* Le panneau de pose se deplace aussi : c'est une fenetre comme les autres. */
for (const el of document.querySelectorAll(".sheet, #placebar")) {
  rendreDeplacable(el);
  const m = el.id && shPos[el.id];
  if (m && !shMobile()) shPose(el, m.x, m.y);
}
/* Fenetre retrecie : un panneau pose au large se retrouverait hors champ. */
window.addEventListener("resize", () => {
  for (const el of document.querySelectorAll(".sheet.pose, #placebar.pose")) {
    if (shMobile()) { shReset(el); continue; }
    const b = shPose(el, el.offsetLeft, el.offsetTop);
    if (el.id) shPos[el.id] = b;
  }
});

function closeSheets() {
  for (const s of document.querySelectorAll(".sheet")) s.hidden = true;
  selTile = null;
  cave = null;
  atl = null;
  rest = null;
  sim = null;
}
for (const b of document.querySelectorAll(".sheet .close")) b.onclick = closeSheets;

