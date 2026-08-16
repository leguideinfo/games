/* ---------- intro ---------- */
const icv = $("#icv"), ictx = icv.getContext("2d");
const SCENES = [
  "An 2847. Vaisseau-colonie <span class='y'>AWOUI-7</span>.<br>Sortie de cryogénisation… Bonjour, <span class='y'>Aurore</span>.",
  "Sous toi : une planète <span class='y'>vierge</span>.<br>Dans la soute : ta base.",
  "Au cœur du module : <span class='y'>l'Étincelle</span>.<br>La <span class='y'>Source</span> de ton nouveau monde.",
];
// Embarqué (plateau MIROIR dans concept.html) : JAMAIS l'intro standalone — le joueur
// a déjà eu son réveil dans le jeu principal, et en miroir save() est coupée donc
// seenIntro ne se persisterait pas → l'intro se rejouait à chaque montage. On la réserve
// au mode autonome (window.parent === window). Le bouton « ↺ Revoir l'intro » reste, lui.
let scene = 0, introOn = (window.parent === window) && !S.seenIntro;

/* — helpers cinématique — */
const FROST = [];
{ const r = mulberry32(11); for (let i = 0; i < 26; i++) FROST.push({ x: r(), y: r(), s: r() * 2 + 1, v: r() * 14 + 6, tw: r() * 6 }); }
const IGLINT = [];
{ const r = mulberry32(23); for (let i = 0; i < 8; i++) IGLINT.push({ a: r() * Math.PI * 2, d: r() * 0.75, tw: r() * 6 }); }
const ICRYS = [];
{ const r = mulberry32(31); for (let i = 0; i < 7; i++) ICRYS.push({ x: r(), h: 10 + r() * 22, tw: r() * 6 }); }
function capsulePath(c, x, y, w2, h2) {
  const r = w2 / 2;
  c.beginPath();
  c.moveTo(x, y + r);
  c.arc(x + r, y + r, r, Math.PI, 0);
  c.lineTo(x + w2, y + h2 - r);
  c.arc(x + r, y + h2 - r, r, 0, Math.PI);
  c.closePath();
}
function starsPar(t, w, h, dim) {
  for (const s of STARS) {
    const layer = s.s > 1.4 ? 2 : s.s > 0.9 ? 1 : 0.5;
    const x = ((s.x * w - t * 0.006 * layer) % w + w) % w;
    ictx.globalAlpha = (0.3 + 0.4 * Math.sin(t / 900 + s.tw)) * (dim || 1);
    ictx.fillStyle = "#cfe6ff";
    ictx.fillRect(x, s.y * h, s.s, s.s);
  }
  ictx.globalAlpha = 1;
}
function drawShip(x, y, t) {
  ictx.save();
  ictx.translate(x, y);
  // flamme moteur
  const fl = 22 + Math.sin(t / 70) * 6 + Math.sin(t / 31) * 4;
  const fg = ictx.createLinearGradient(-70 - fl, 0, -70, 0);
  fg.addColorStop(0, "rgba(111,216,242,0)");
  fg.addColorStop(1, "rgba(140,220,255,.85)");
  ictx.beginPath();
  ictx.moveTo(-70, -5); ictx.lineTo(-70 - fl, 0); ictx.lineTo(-70, 5);
  ictx.closePath(); ictx.fillStyle = fg; ictx.fill();
  // coque principale
  const hull = ictx.createLinearGradient(0, -14, 0, 14);
  hull.addColorStop(0, "#f2f0ea"); hull.addColorStop(0.6, "#c3c7cd"); hull.addColorStop(1, "#82878f");
  ictx.beginPath();
  ictx.moveTo(-70, -9);
  ictx.lineTo(46, -12);
  ictx.quadraticCurveTo(78, 0, 46, 12);
  ictx.lineTo(-70, 9);
  ictx.closePath();
  ictx.fillStyle = hull; ictx.fill();
  ictx.strokeStyle = "rgba(20,25,35,.4)"; ictx.lineWidth = 1; ictx.stroke();
  // aileron dorsal + soute ventrale
  ictx.beginPath();
  ictx.moveTo(-30, -9); ictx.lineTo(-14, -22); ictx.lineTo(2, -9);
  ictx.closePath(); ictx.fillStyle = "#b9bec6"; ictx.fill(); ictx.stroke();
  ictx.fillStyle = "#9aa0a8";
  ictx.fillRect(-44, 9, 52, 7);
  ictx.strokeRect(-44, 9, 52, 7);
  // hublots
  ictx.fillStyle = "#38a9ff";
  for (let i = 0; i < 7; i++) ictx.fillRect(-52 + i * 15, -4, 7, 3);
  // cockpit
  ictx.beginPath();
  ictx.ellipse(52, -2, 10, 5, 0, 0, Math.PI * 2);
  ictx.fillStyle = "#0c2233"; ictx.fill();
  ictx.strokeStyle = "#6fd8f2"; ictx.stroke();
  // feux de navigation clignotants
  if (Math.sin(t / 260) > 0) {
    ictx.beginPath(); ictx.arc(-68, -9, 2, 0, Math.PI * 2);
    ictx.fillStyle = "#ff5c5c"; ictx.shadowColor = "#ff5c5c"; ictx.shadowBlur = 8;
    ictx.fill(); ictx.shadowBlur = 0;
  } else {
    ictx.beginPath(); ictx.arc(70, 4, 2, 0, Math.PI * 2);
    ictx.fillStyle = "#57e389"; ictx.shadowColor = "#57e389"; ictx.shadowBlur = 8;
    ictx.fill(); ictx.shadowBlur = 0;
  }
  ictx.restore();
}
function drawPlanet(x, y, r, t) {
  const g = ictx.createRadialGradient(x - r / 3, y - r / 3, r / 5, x, y, r);
  g.addColorStop(0, "#e8b070"); g.addColorStop(0.65, "#b3743c"); g.addColorStop(1, "#4a2c14");
  ictx.beginPath(); ictx.arc(x, y, r, 0, Math.PI * 2);
  ictx.fillStyle = g; ictx.fill();
  // terminateur (ombre)
  const sh = ictx.createLinearGradient(x - r, y, x + r, y);
  sh.addColorStop(0, "rgba(4,6,15,0)"); sh.addColorStop(0.75, "rgba(4,6,15,0)"); sh.addColorStop(1, "rgba(4,6,15,.7)");
  ictx.beginPath(); ictx.arc(x, y, r, 0, Math.PI * 2);
  ictx.fillStyle = sh; ictx.fill();
  // atmosphère
  ictx.beginPath(); ictx.arc(x, y, r + 5, 0, Math.PI * 2);
  ictx.strokeStyle = "rgba(111,216,242,.45)"; ictx.lineWidth = 2;
  ictx.shadowColor = "#6fd8f2"; ictx.shadowBlur = 12;
  ictx.stroke(); ictx.shadowBlur = 0;
  // scintillements de cristaux
  for (const gl of IGLINT) {
    ictx.globalAlpha = 0.4 + 0.6 * Math.max(0, Math.sin(t / 500 + gl.tw));
    ictx.fillStyle = "#9fe8ff";
    ictx.fillRect(x + Math.cos(gl.a) * r * gl.d, y + Math.sin(gl.a) * r * gl.d, 2.5, 2.5);
  }
  ictx.globalAlpha = 1;
}
function drawModule(x, y, t, thrusting) {
  ictx.save();
  ictx.translate(x, y);
  if (thrusting) {
    const fl = 16 + Math.sin(t / 60) * 5;
    for (const ox of [-16, 16]) {
      const fg = ictx.createLinearGradient(0, 16, 0, 16 + fl);
      fg.addColorStop(0, "rgba(255,214,140,.9)"); fg.addColorStop(1, "rgba(255,150,60,0)");
      ictx.beginPath();
      ictx.moveTo(ox - 5, 16); ictx.lineTo(ox, 16 + fl); ictx.lineTo(ox + 5, 16);
      ictx.closePath(); ictx.fillStyle = fg; ictx.fill();
    }
  }
  // caisson de soute
  const bg = ictx.createLinearGradient(0, -18, 0, 16);
  bg.addColorStop(0, "#f2f0ea"); bg.addColorStop(1, "#9aa0a8");
  ictx.fillStyle = bg;
  ictx.fillRect(-30, -18, 60, 34);
  ictx.strokeStyle = "rgba(20,25,35,.45)"; ictx.lineWidth = 1;
  ictx.strokeRect(-30, -18, 60, 34);
  ictx.fillStyle = "#82878f";
  ictx.fillRect(-30, -4, 60, 3);
  ictx.fillStyle = "#38a9ff";
  ictx.fillRect(-22, -13, 10, 4); ictx.fillRect(12, -13, 10, 4);
  // pieds
  ictx.strokeStyle = "#6c7178"; ictx.lineWidth = 3;
  ictx.beginPath(); ictx.moveTo(-24, 16); ictx.lineTo(-30, 26); ictx.moveTo(24, 16); ictx.lineTo(30, 26);
  ictx.stroke();
  ictx.restore();
}
function drawSpark(x, y, p, t) {
  const g = ictx.createLinearGradient(x, y - 90, x, y);
  g.addColorStop(0, "rgba(111,216,242,0)"); g.addColorStop(1, "rgba(111,216,242,.85)");
  ictx.fillStyle = g; ictx.fillRect(x - 2, y - 90, 4, 90);
  ictx.beginPath();
  ictx.arc(x, y, 7 + Math.sin(t / 120) * 2, 0, Math.PI * 2);
  ictx.fillStyle = "#eaffff";
  ictx.shadowColor = "#6fd8f2"; ictx.shadowBlur = 26;
  ictx.fill(); ictx.shadowBlur = 0;
  if (p >= 1) {
    const ring = ((t / 900) % 1);
    ictx.beginPath();
    ictx.arc(x, y, 14 + ring * 30, 0, Math.PI * 2);
    ictx.strokeStyle = "rgba(111,216,242," + (0.6 * (1 - ring)).toFixed(2) + ")";
    ictx.lineWidth = 2; ictx.stroke();
  }
}
function drawIntro(t) {
  if (!introOn) return;
  const w = icv.clientWidth, h = icv.clientHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (icv.width !== w * dpr) { icv.width = w * dpr; icv.height = h * dpr; }
  ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ictx.fillStyle = "#04060f"; ictx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const sc = (t - sceneT0) / 1000;

  if (scene === 0) {
    /* — CRYO : caisson givré, scan, battement — */
    const breath = 0.5 + 0.5 * Math.sin(t / 900);
    const g0 = ictx.createRadialGradient(cx, cy, 10, cx, cy, h * 0.55);
    g0.addColorStop(0, "rgba(78,180,255," + (0.10 + 0.07 * breath).toFixed(2) + ")");
    g0.addColorStop(1, "rgba(0,0,0,0)");
    ictx.fillStyle = g0; ictx.fillRect(0, 0, w, h);
    const pw = Math.min(w * 0.44, 190), ph = Math.min(h * 0.6, 330);
    // la vitre principale : l'espace défile derrière la baie
    const capX = cx - pw / 2, capY = cy - ph / 2;
    capsulePath(ictx, capX, capY, pw, ph);
    ictx.save(); ictx.clip();
    ictx.fillStyle = "#030510"; ictx.fillRect(capX, capY, pw, ph);
    for (const st of STARS) {
      const layer = st.s > 1.4 ? 2 : st.s > 0.9 ? 1 : 0.5;
      const sx2 = capX + (((st.x * 3 * pw - t * 0.006 * layer) % pw) + pw) % pw;
      ictx.globalAlpha = 0.35 + 0.4 * Math.sin(t / 900 + st.tw);
      ictx.fillStyle = "#cfe6ff";
      ictx.fillRect(sx2, capY + st.y * ph, st.s, st.s);
    }
    ictx.globalAlpha = 1;
    // la planète-destination : un point qui dérive au rythme de la couche du fond
    const dotY = capY + ph * 0.16;
    const dotX = capX + (((pw * 0.62 - sc * 3) % pw) + pw) % pw;
    ictx.beginPath(); ictx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ictx.fillStyle = "#e8b26a"; ictx.shadowColor = "#e8b26a"; ictx.shadowBlur = 9; ictx.fill(); ictx.shadowBlur = 0;
    // réticule sur le point + ligne d'appel vers la loupe
    const zr = Math.min(pw * 0.36, ph * 0.22), zy = cy + ph * 0.1;
    ictx.strokeStyle = "rgba(78,242,224,.6)"; ictx.lineWidth = 1.2;
    ictx.setLineDash([3, 3]);
    ictx.beginPath(); ictx.arc(dotX, dotY, 8 + Math.sin(t / 400), 0, Math.PI * 2); ictx.stroke();
    const ang = Math.atan2(zy - dotY, cx - dotX);
    ictx.beginPath();
    ictx.moveTo(dotX + Math.cos(ang) * 11, dotY + Math.sin(ang) * 11);
    ictx.lineTo(cx - Math.cos(ang) * (zr + 7), zy - Math.sin(ang) * (zr + 7));
    ictx.stroke();
    ictx.setLineDash([]);
    // hublot-loupe : zoom sur la planète, au centre de la vitre
    ictx.save();
    ictx.beginPath(); ictx.arc(cx, zy, zr, 0, Math.PI * 2); ictx.clip();
    ictx.fillStyle = "#020409"; ictx.fillRect(cx - zr, zy - zr, zr * 2, zr * 2);
    drawPlanet(cx, zy, zr * 0.62, t);
    ictx.restore();
    ictx.beginPath(); ictx.arc(cx, zy, zr, 0, Math.PI * 2);
    ictx.strokeStyle = "rgba(140,210,255,.8)"; ictx.lineWidth = 2; ictx.stroke();
    ictx.setLineDash([6, 8]); ictx.lineDashOffset = -t / 60;
    ictx.beginPath(); ictx.arc(cx, zy, zr + 5, 0, Math.PI * 2);
    ictx.strokeStyle = "rgba(78,242,224,.45)"; ictx.lineWidth = 1.4; ictx.stroke();
    ictx.setLineDash([]);
    // teinte de la vitre
    ictx.fillStyle = "rgba(22,48,74,.16)"; ictx.fillRect(capX, capY, pw, ph);
    ictx.restore();
    // cadre de la baie vitrée
    capsulePath(ictx, cx - pw / 2, cy - ph / 2, pw, ph);
    ictx.strokeStyle = "rgba(140,210,255,.85)"; ictx.lineWidth = 2.5;
    ictx.shadowColor = "#4ef2e0"; ictx.shadowBlur = 10 + 12 * breath;
    ictx.stroke(); ictx.shadowBlur = 0;
    capsulePath(ictx, cx - pw / 2 + 9, cy - ph / 2 + 9, pw - 18, ph - 18);
    ictx.strokeStyle = "rgba(140,210,255,.25)"; ictx.lineWidth = 1; ictx.stroke();
    // scan vertical (par-dessus la vitre, clippé au cadre)
    const scanY = cy - ph / 2 + ((t / 2400) % 1) * ph;
    ictx.save();
    capsulePath(ictx, capX, capY, pw, ph);
    ictx.clip();
    ictx.fillStyle = "rgba(78,242,224,.16)";
    ictx.fillRect(cx - pw / 2 + 6, scanY, pw - 12, 3);
    ictx.restore();
    // givre qui remonte
    for (const f of FROST) {
      const fy = (f.y * h - (t / 1000) * f.v) % h;
      ictx.globalAlpha = 0.25 + 0.3 * Math.sin(t / 700 + f.tw);
      ictx.fillStyle = "#cfe9ff";
      ictx.fillRect(f.x * w, ((fy % h) + h) % h, f.s, f.s);
    }
    ictx.globalAlpha = 1;
    // coins d'interface
    ictx.strokeStyle = "rgba(78,242,224,.5)"; ictx.lineWidth = 2;
    const m = 14, L = 20;
    for (const [px, py, dx, dy] of [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]]) {
      ictx.beginPath();
      ictx.moveTo(px + dx * L, py); ictx.lineTo(px, py); ictx.lineTo(px, py + dy * L);
      ictx.stroke();
    }
  } else if (scene === 1) {
    /* — VOYAGE : parallaxe, planète qui grossit, vaisseau — */
    starsPar(t, w, h);
    const pr = Math.min(w, h) * (0.17 + Math.min(0.2, sc * 0.018));
    drawPlanet(w * 0.74, h * 0.44, pr, t);
    drawShip(w * 0.2 + Math.min(w * 0.14, sc * 8), h * 0.52 + Math.sin(t / 900) * 6, t);
  } else {
    /* — ATTERRISSAGE : module, poussière, Étincelle — */
    starsPar(t, w, h, 0.4);
    const gy = h * 0.76;
    const sg = ictx.createLinearGradient(0, gy, 0, h);
    sg.addColorStop(0, "hsl(28 50% 34%)"); sg.addColorStop(1, "hsl(24 45% 16%)");
    ictx.fillStyle = sg; ictx.fillRect(0, gy, w, h - gy);
    ictx.beginPath(); ictx.ellipse(cx, gy, w * 0.36, 11, 0, 0, Math.PI * 2);
    ictx.fillStyle = "hsl(30 52% 40%)"; ictx.fill();
    const p1 = Math.min(1, sc / 2.4);
    // cristaux lointains qui s'éveillent
    for (const c of ICRYS) {
      const bx = c.x * w, glow = p1 * (0.4 + 0.6 * Math.max(0, Math.sin(t / 600 + c.tw)));
      ictx.beginPath();
      ictx.moveTo(bx, gy - c.h * p1); ictx.lineTo(bx + 4, gy + 2); ictx.lineTo(bx - 4, gy + 2);
      ictx.closePath();
      ictx.fillStyle = "rgba(120,215,255," + (0.35 + 0.5 * glow).toFixed(2) + ")";
      ictx.shadowColor = "#6fd8f2"; ictx.shadowBlur = 10 * glow;
      ictx.fill(); ictx.shadowBlur = 0;
    }
    const my = h * 0.1 + (1 - Math.pow(1 - p1, 2)) * (gy - h * 0.1 - 40);
    drawModule(cx, my, t, p1 < 1);
    // poussière à l'impact
    const dustP = sc - 2.4;
    if (dustP > 0 && dustP < 1) {
      ictx.beginPath();
      ictx.ellipse(cx, gy - 4, 40 + dustP * 130, 8 + dustP * 14, 0, 0, Math.PI * 2);
      ictx.strokeStyle = "rgba(220,180,130," + (0.5 * (1 - dustP)).toFixed(2) + ")";
      ictx.lineWidth = 5 * (1 - dustP) + 1;
      ictx.stroke();
    }
    // l'Étincelle descend puis irradie
    if (sc > 2.9) {
      const p2 = Math.min(1, (sc - 2.9) / 1.8);
      const sy2 = h * 0.04 + Math.pow(p2, 1.6) * (my - 34 - h * 0.04);
      drawSpark(cx, sy2, p2, t);
      if (p2 >= 1) {
        // lignes d'énergie qui parcourent le sol
        ictx.setLineDash([5, 9]);
        ictx.lineDashOffset = -t / 30;
        ictx.strokeStyle = "rgba(78,242,224,.5)";
        ictx.lineWidth = 1.6;
        for (const dx of [-0.3, -0.15, 0.15, 0.3]) {
          ictx.beginPath();
          ictx.moveTo(cx, gy - 2);
          ictx.quadraticCurveTo(cx + dx * w * 0.5, gy + 8, cx + dx * w, gy + 14);
          ictx.stroke();
        }
        ictx.setLineDash([]);
      }
    }
  }
  requestAnimationFrame(drawIntro);
}
let sceneT0 = performance.now();
function setScene(i) {
  scene = i;
  sceneT0 = performance.now();
  $("#itext").innerHTML = SCENES[i];
  $("#inext").textContent = i >= SCENES.length - 1 ? "ATTERRIR" : "SUITE";
}
function endIntro() {
  introOn = false;
  S.seenIntro = true;
  $("#intro").hidden = true;
  save();
  toast("Bienvenue, Aurore. Des <b>✨ éclats de matériaux</b> scintillent sur le sol — tape-les pour les récolter.");
}
$("#inext").onclick = () => { audioInit(); sfx.ui(); scene >= SCENES.length - 1 ? endIntro() : setScene(scene + 1); };
$("#src-intro").onclick = () => {
  closeSheets();
  introOn = true;
  $("#intro").hidden = false;
  setScene(0);
  requestAnimationFrame(drawIntro);
};
$("#iskip").onclick = () => { audioInit(); endIntro(); };
icv.addEventListener("pointerup", () => {
  if (!introOn) return;
  if ((performance.now() - sceneT0) / 1000 < 1.2) return; // laisse la scène se jouer
  audioInit(); sfx.ui();
  scene >= SCENES.length - 1 ? endIntro() : setScene(scene + 1);
});

