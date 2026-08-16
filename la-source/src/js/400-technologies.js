/* ---------- technologies ---------- */
function openTech() {
  closeSheets();
  const list = $("#techlist");
  list.innerHTML = "";
  for (const [key, def] of Object.entries(TECHS)) {
    const done = S.techs.includes(key);
    const locked = def.needs && !S.techs.includes(def.needs);
    const card = document.createElement("div");
    card.className = "bcard" + (locked ? " locked" : "");
    card.innerHTML =
      "<div class='ic' style='color:" + def.col + "'>◆</div>" +
      "<div class='grow'><div class='nm' style='color:" + def.col + "'>" + def.nm + "</div>" +
      "<div class='ds'>" + (locked ? "Requiert " + TECHS[def.needs].nm + "." : def.ds) + "</div></div>";
    const btn = document.createElement("button");
    if (done) { btn.textContent = "ACQUISE"; btn.disabled = true; }
    else {
      btn.textContent = fmt(def.eo) + " Eo";
      btn.disabled = locked || S.eo < def.eo;
      if (!btn.disabled && S.mi === 18 && key === "dns")
        btn.classList.add("guide");
      btn.onclick = () => {
        if (MIRROR) { sfx.deny(); toast("🧠 Les technologies se recherchent dans le jeu principal — le plateau les reçoit."); return; }
        if (S.eo < def.eo) { sfx.deny(); return; }
        S.eo -= def.eo;
        S.techs.push(key);
        sfx.tech();
        toast("Technologie <b>" + def.nm + "</b> acquise !", true);
        missionDone("tech_" + key);
        if (key === "dns") unlockMap();
        save();
        openTech();
      };
    }
    card.appendChild(btn);
    list.appendChild(card);
  }
  $("#sh-tech").hidden = false;
}
function unlockMap() { refreshGates(); }
function refreshGates() {
  $("#hud-eo").style.display = (bcount("serveur") || bcount("ferme") || S.eo > 0.5) ? "" : "none";
  $("#hud-en").style.display = enUse() > 0 ? "" : "none";
  // les batteries n'existent pour le joueur qu'une fois la première charge captée
  $("#hud-pw").style.display = (S.pw || 0) > 0 ? "" : "none";
  $("#tab-tech").hidden = S.mi < 18;
  $("#tab-tech").classList.toggle("guide", S.mi === 18);
  $("#tab-net").hidden = S.mi < 10;
  $("#tab-net").classList.toggle("guide", S.mi === 13);
  $("#wirebtn").hidden = S.mi < 3;
  $("#wirebtn").classList.toggle("guide", (S.mi === 3 || S.mi === 10 || S.mi === 12) && !wire);
  const dns = S.techs.includes("dns");
  $("#tab-map").hidden = !dns;
  $("#tab-map").disabled = !dns;
  $("#tab-map").textContent = "CARTE";
  $("#tab-map").classList.toggle("guide", S.mi === 19);
  $("#tab-arch").hidden = !(S.archives.length || S.mi >= 5);
  $("#tab-arch").classList.toggle("guide", S.mi >= 5 && S.mi <= 7 && !S.memories.length);
  $("#buildbtn").hidden = S.mi < 1;   // le tuto ouvre la palette, miroir compris
  $("#buildbtn").classList.toggle("empty", paletteVide());
  $("#buildbtn").classList.toggle("on", !!place);
  $("#buildbtn").classList.toggle("guide", !!GUIDE_BUILD[S.mi] && !place && !paletteVide());
  syncPlaceUI();
  // un onglet vient peut-être d'apparaître : le logement du hublot se réajuste
  // (drawHublot ne retrace que si la mesure a réellement bougé)
  drawHublot();
}

