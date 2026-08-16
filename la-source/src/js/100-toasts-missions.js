/* ---------- toasts / missions ---------- */
function toast(html, gold) {
  const box = $("#toasts");
  while (box.children.length >= 3) box.firstChild.remove();
  const d = document.createElement("div");
  d.className = "toast" + (gold ? " gold" : "");
  d.innerHTML = html;
  $("#toasts").appendChild(d);
  setTimeout(() => d.remove(), 3500);
}
function missionUI() {
  const box = $("#missions");
  if (S.mi >= MISSIONS.length) { box.hidden = true; return; }
  box.hidden = false;
  const m = MISSIONS[S.mi];
  $("#m-text").innerHTML = m.t;   // récompenses masquées pour le moment (système EXP à venir — retour 16/08)
}
function missionTick() {
  if (S.mi >= MISSIONS.length) return;
  const m = MISSIONS[S.mi];
  if (m.c && m.c()) missionDone(m.k);
}
function missionDone(k) {
  if (S.mi >= MISSIONS.length) return;
  const m = MISSIONS[S.mi];
  if (m.k !== k) return;
  // récompenses retirées pour le moment (système EXP à venir — retour 16/08)
  S.mi++;
  skipSatisfied();
  sfx.mission();
  toast("Mission accomplie ✅", true);
  if (S.mi === 5) {
    setTimeout(() => toast("🧩 <b>L'Atelier de Mémoire</b> est ouvert — onglet QUÊTES."), 1500);
  }
  if (S.mi === 11) {
    setTimeout(() => toast("🔀 Le <b>Switch</b> se construit comme un bâtiment (tape une case libre) et offre <b>8 ports</b> pour tout brancher."), 1500);
  }
  if (S.mi === 6) {
    setTimeout(() => toast("🕳 Le sol tremble… des <b>crevasses</b> se sont ouvertes ! Tape-en une pour sonder."), 1500);
  }
  if (S.mi === 25) {
    spawnMob();
    setTimeout(() => toast("🕷 Un <b>parasite de données</b> rôde à la frontière ! Il ralentit ton extraction (−15 %)."), 1500);
  }
  const box = $("#missions");
  box.classList.remove("flash"); void box.offsetWidth; box.classList.add("flash");
  if (S.mi >= MISSIONS.length) {
    setTimeout(() => toast("🚀 <b>Slice terminée !</b> La suite : fédérations, PvP cyber, académie — en prod."), 1800);
  }
  missionUI(); save();
}

