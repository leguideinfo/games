/* ---------- rendu colonie ---------- */
let lastGatesT = 0;
let view = "col"; // col | map
let selTile = null;
// Pose armée (aperçu fantôme). Jamais sérialisée.
// { kind:"bld"|"unit"|"move", t, mv, hx, hy, valid, why, bx, by,
//   drag, ptrId, psx, psy, lift, aimed, lastTap }
let place = null;
let wire = null; // mode câblage : { a: clé du premier nœud ou null }
let sim = null; // simulation de trame en cours
let orbs = []; // {x,y,val,born}
let mobs = []; // {x,y,born,atk:{u,t0}|null,sx,sy}
let mobT = 0;
let fx = [];
function burst(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, sp = 30 + Math.random() * 60;
    fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: 0.6, color });
  }
}
function spawnMob() {
  if (mobs.length >= 2) return;
  for (let i = 0; i < 40; i++) {
    const side = rnd(4);
    const a = bmin() + rnd(bmax() - bmin() + 1);
    const x = side === 0 ? bmin() : side === 1 ? bmax() : a;
    const y = side === 2 ? bmin() : side === 3 ? bmax() : a;
    if (!buildable(x, y) || !fpLibre(x, y, FP_UNIT) || mobs.some((m) => m.x === x && m.y === y)) continue;
    mobs.push({ x, y, born: performance.now(), atk: null });
    return;
  }
}

function diamond(c, sx, sy, w, h) {
  c.beginPath();
  c.moveTo(sx, sy - h / 2);
  c.lineTo(sx + w / 2, sy);
  c.lineTo(sx, sy + h / 2);
  c.lineTo(sx - w / 2, sy);
  c.closePath();
}
// Falaise de bordure : paroi de terre CONTINUE sous le plateau (le monde flotte
// dans le vide). La profondeur suit une ondulation DOUCE indexée sur les SOMMETS
// partagés (cOut/cIn) : le voisin partage cIn -> le bas forme une seule ligne
// continue d'une tuile a l'autre, jamais des marches. Dégradé LISSE (pas de
// strates dures) -> les faces voisines se fondent sans couture visible. On
// naturalise la surface sans jamais toucher a la silhouette du plateau.
// lit = face SW (bas-gauche, éclairée) / SE (bas-droite, ombre). cOut/cIn = index
// entiers des deux sommets hauts le long du bord (le voisin partage cIn).
function cliffFace(p, z, info, lit, cOut, cIn) {
  const hw = TW / 2 * z, hh = TH / 2 * z, sgn = lit ? -1 : 1;
  const wave = (c) => (Math.sin(c * 0.7) * 0.55 + Math.sin(c * 1.9 + 2.1) * 0.45) * 3 * z;
  const xo = p.x + sgn * hw, yo = p.y;           // coin extérieur haut
  const xi = p.x, yi = p.y + hh;                 // coin intérieur haut (bas du losange)
  const D = 23 * z;                              // profondeur de base (quasi uniforme)
  const yBo = yo + D + wave(cOut), yBi = yi + D + wave(cIn);   // bas continu (sommets partagés)
  // 1) PATH : arête haute nette, arêtes verticales droites, bas ondulé mais CONTINU
  ctx.beginPath();
  ctx.moveTo(xo, yo); ctx.lineTo(xi, yi);
  ctx.lineTo(xi, yBi); ctx.lineTo(xo, yBo);
  ctx.closePath();
  // 2) DÉGRADÉ terreux DOUX (faible contraste -> les coutures entre faces de tuiles
  // s'effacent, la paroi se lit comme UNE masse et non des panneaux juxtaposés)
  const o = lit ? 0 : -5;                        // SE un peu plus sombre (volume), jamais de noir
  const g = ctx.createLinearGradient(p.x, yo, p.x, yo + D + hh);
  g.addColorStop(0.00, "hsl(28 39% " + (27 + o) + "%)");   // haut de paroi (chaud)
  g.addColorStop(0.55, "hsl(25 33% " + (22 + o) + "%)");   // corps de terre
  g.addColorStop(1.00, "hsl(22 28% " + (17 + o) + "%)");   // pied (terreux)
  ctx.fillStyle = g; ctx.fill();
  // 3) LISERÉ topsoil : très fine bande claire sous l'herbe (arête haute continue)
  ctx.beginPath(); ctx.moveTo(xo, yo); ctx.lineTo(xi, yi);
  ctx.strokeStyle = lit ? "rgba(206,150,98,.20)" : "rgba(150,108,70,.15)";
  ctx.lineWidth = 1.6 * z; ctx.stroke();
}
function drawTile(x, y, t) {
  const p = w2s(x, y), z = cam.z;
  const info = tileAt(x, y);
  const jitter = info.j * 14 - 7;
  const onTex = TILE.ok; // sol = pattern infini : découpe seule sur le débloqué
  // décor : LA fissure et LES fissures — 2 emplacements fixes max par asset,
  // angle d'origine, à l'intérieur du plateau de départ
  if (VART.ok && onTex && info.kind === "sand") {
    for (let w2 = 0; w2 < VART_SPOTS.length; w2++) {
      if (VART_SPOTS[w2][0] !== x || VART_SPOTS[w2][1] !== y) continue;
      const vi = vartImg(w2);
      if (!vi) continue;
      const dw = (0.36 + 0.06 * w2) * TW * z;
      ctx.drawImage(vi, p.x - dw / 2, p.y - dw / 2, dw, dw);
    }
  }
  // sol : plateau-asset (découpe légère seulement) ou procédural
  diamond(ctx, p.x, p.y, TW * z, TH * z);
  if (onTex) {
    const kz = x + "," + y; // pas de grille sous les zones ni les bâtiments
    if (info.kind !== "lac" && info.kind !== "montagne" && !duneSet.has(kz) && !fertSet.has(kz) &&
        !S.buildings.some((b2) => { const h = 0.5 + fpOf(b2.t, b2.x, b2.y) / 2; return Math.abs(b2.x - x) < h && Math.abs(b2.y - y) < h; })) {   // pas de grille sous une EMPREINTE, meme a cheval sur deux cases
      ctx.strokeStyle = "rgba(45,22,8,.22)"; ctx.lineWidth = 1; ctx.stroke();
    }
  } else {
    const g = ctx.createLinearGradient(p.x, p.y - TH / 2 * z, p.x, p.y + TH / 2 * z);
    g.addColorStop(0, "hsl(" + (28 + jitter * 0.4) + " 52% " + (46 + jitter * 0.5) + "%)");
    g.addColorStop(1, "hsl(" + (26 + jitter * 0.4) + " 50% " + (36 + jitter * 0.5) + "%)");
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = "rgba(60,35,15,.25)"; ctx.lineWidth = 1; ctx.stroke();
  }
  // falaises de bordure du plateau (le monde flotte dans le vide)
  if (y === bmax()) cliffFace(p, z, info, true, x, x + 1);   // SW : sommets indexés sur x
  if (x === bmax()) cliffFace(p, z, info, false, y, y + 1);  // SE : sommets indexés sur y
  // décor
  if (info.kind === "crystal") {
    if (CRX.ok) return; // dessiné dans la passe triée en profondeur (avec les bâtiments)
    const n = 2 + Math.floor(info.j * 3);
    for (let i = 0; i < n; i++) {
      const ox = (info.j * 37 % 1 - 0.5 + i * 0.25 - n * 0.1) * TW * 0.5 * z;
      const hgt = (14 + (info.j * 53 % 1) * 16 + i * 4) * z;
      const wd = 5 * z;
      const bx = p.x + ox, by = p.y + 4 * z;
      const cg = ctx.createLinearGradient(bx, by - hgt, bx, by);
      cg.addColorStop(0, "#bdf3ff"); cg.addColorStop(1, "#3a9cc9");
      ctx.beginPath();
      ctx.moveTo(bx, by - hgt);
      ctx.lineTo(bx + wd, by);
      ctx.lineTo(bx - wd, by);
      ctx.closePath();
      ctx.fillStyle = cg;
      ctx.shadowColor = "#6fd8f2"; ctx.shadowBlur = 8 * z;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  } else if (info.kind === "crevasse" || info.kind === "caillou") {
    if (info.kind === "caillou") {
      if (ROCK.ok) { /* dessiné dans la passe triée en profondeur */ }
      else for (const [ox, oy, rr] of [[-8, 2, 8], [7, 0, 6.5], [0, -4, 5.5]]) {
        // éboulis : petit tas de galets (secours)
        ctx.beginPath();
        ctx.ellipse(p.x + ox * z, p.y + oy * z, rr * z, rr * 0.62 * z, 0, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(24 22% " + (30 + rr) + "%)";
        ctx.fill();
        ctx.strokeStyle = "rgba(40,25,10,.5)"; ctx.lineWidth = 1; ctx.stroke();
      }
    } else {
      // crevasse : la faille du propriétaire, lueur des profondeurs
      const cxp = p.x, cyp = p.y + 2 * z;
      if (CREV.ok) {
        const dw2 = TW * 0.55 * z;
        ctx.drawImage(CREV.img, cxp - dw2 / 2, cyp - dw2 / 2, dw2, dw2);
      } else {
        ctx.beginPath();
        ctx.ellipse(cxp, cyp, 17 * z, 7 * z, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#100608"; ctx.fill();
        ctx.strokeStyle = "rgba(90,55,25,.8)"; ctx.lineWidth = 1.2 * z; ctx.stroke();
      }
      const gg = ctx.createRadialGradient(cxp, cyp, 1, cxp, cyp, 13 * z);
      gg.addColorStop(0, "rgba(255,170,80," + (0.28 + 0.16 * Math.sin(t / 480 + info.j * 9)).toFixed(2) + ")");
      gg.addColorStop(1, "rgba(255,170,80,0)");
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.ellipse(cxp, cyp, 13 * z, 5.5 * z, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  // sélection
  if (selTile && selTile.x === x && selTile.y === y) {
    diamond(ctx, p.x, p.y, TW * z, TH * z);
    ctx.strokeStyle = "#38a9ff"; ctx.lineWidth = 2;
    ctx.shadowColor = "#38a9ff"; ctx.shadowBlur = 10;
    ctx.stroke(); ctx.shadowBlur = 0;
  }
}
function isoBox(sx, sy, w, h, hgt, col) {
  // top
  const topY = sy - hgt;
  const g = ctx.createLinearGradient(sx - w / 2, topY, sx + w / 2, topY);
  g.addColorStop(0, "#f2f0ea"); g.addColorStop(1, "#cfd2d6");
  diamond(ctx, sx, topY, w, h);
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "rgba(20,25,35,.35)"; ctx.lineWidth = 1; ctx.stroke();
  // faces
  ctx.beginPath();
  ctx.moveTo(sx - w / 2, topY); ctx.lineTo(sx, topY + h / 2);
  ctx.lineTo(sx, sy + h / 2); ctx.lineTo(sx - w / 2, sy);
  ctx.closePath();
  ctx.fillStyle = "#b9bec6"; ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + w / 2, topY); ctx.lineTo(sx, topY + h / 2);
  ctx.lineTo(sx, sy + h / 2); ctx.lineTo(sx + w / 2, sy);
  ctx.closePath();
  ctx.fillStyle = "#82878f"; ctx.fill(); ctx.stroke();
  // fenêtres énergie
  ctx.fillStyle = col;
  const ga0 = ctx.globalAlpha;
  ctx.globalAlpha = ga0 * 0.9;
  const rows = Math.max(1, Math.floor(hgt / 14));
  for (let r = 0; r < rows; r++) {
    ctx.fillRect(sx - w * 0.32, topY + h / 2 + 4 + r * 12, w * 0.2, 3);
    ctx.fillRect(sx + w * 0.12, topY + h / 2 + 4 + r * 12, w * 0.2, 3);
  }
  ctx.globalAlpha = ga0;
}
