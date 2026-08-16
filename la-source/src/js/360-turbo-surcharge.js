/* ---------- turbo / surcharge ---------- */
let tz = null;
function openTurbo(b) {
  closeSheets();
  const def = BT[b.t];
  $("#tz-title").textContent = "⚡ SURCHARGE — " + def.nm;
  $("#tz-sub").innerHTML = "Synchronise 3 impulsions dans la zone verte pour surcharger la production.";
  $("#tz-stars").textContent = "";
  tz = { round: 0, stars: 0, t0: performance.now(), speed: 1.6 + Math.random() * 0.6, gpos: 0.3 + Math.random() * 0.4 };
  layoutTz();
  $("#sh-turbo").hidden = false;
  tzLoop();
}
function layoutTz() {
  const gw = 0.16;
  $("#tz-green").style.left = (tz.gpos - gw / 2) * 100 + "%";
  $("#tz-green").style.width = gw * 100 + "%";
}
function tzLoop() {
  if (!tz) return;
  const el = (performance.now() - tz.t0) / 1000;
  const pos = 0.5 + 0.48 * Math.sin(el * tz.speed * Math.PI);
  $("#tz-cursor").style.left = (pos * 100) + "%";
  tz.pos = pos;
  requestAnimationFrame(tzLoop);
}
$("#tz-tap").onclick = () => {
  if (!tz) return;
  audioInit();
  const gw = 0.16;
  const hit = Math.abs(tz.pos - tz.gpos) < gw / 2;
  if (hit) { tz.stars++; sfx.star(); } else sfx.deny();
  tz.round++;
  $("#tz-stars").textContent = "★".repeat(tz.stars) + "☆".repeat(tz.round - tz.stars);
  tz.gpos = 0.2 + Math.random() * 0.6;
  tz.speed += 0.5;
  layoutTz();
  if (tz.round >= 3) {
    const stars = tz.stars;
    tz = null;
    setTimeout(() => {
      closeSheets();
      if (stars > 0) {
        S.buffMult = 1 + 0.25 * stars;
        S.buffLeft = 120;
        toast("⚡ Surcharge <b>×" + S.buffMult.toFixed(2) + "</b> pendant 2 min !", true);
        missionDone("turbo");
      } else {
        toast("Synchronisation ratée — réessaie !");
      }
      save();
    }, 600);
  }
};

