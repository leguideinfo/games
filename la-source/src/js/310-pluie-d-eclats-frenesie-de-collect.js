/* ---------- pluie d'éclats (frénésie de collecte) ---------- */
let frz = null, collectTimes = [], frzCooldownUntil = 0, frzRetryAt = 0;
/* Combien de batteries se remplissent avant que la pluie ne s'arrête d'elle-même.
   L'amorçage, lui, s'arrête quand HUB-01 démarre : un évènement, une fin. La
   recharge n'avait pas cette fin — elle attendait le garde-fou de 25 s, jauge
   pleine et figée. Deux batteries donnent le même arc : montée, éclat, reprise,
   éclat final. */
const FRZ_CYCLES = 2;
/* Fait pulser une diode en ambre puis la rend à son état. Indispensable ici :
   `.on` (vert) est declaré APRÈS `.amber` à specificité égale, donc poser
   « amber » sur une diode allumée ne se voyait pas — c'est pourquoi la recharge
   restait muette alors que l'amorçage clignotait. */
function pulseLed(leds, i, dur) {
  const l = leds[i];
  if (!l) return;
  const etait = l.classList.contains("on");
  if (etait) l.classList.remove("on");
  l.classList.add("amber");
  setTimeout(() => {
    l.classList.remove("amber");
    if (etait) l.classList.add("on");
  }, dur);
}
function startFrenzy() {
  cancelPlace(true);
  frzCooldownUntil = performance.now() + 90000;
  collectTimes = [];
  /* Deux visages pour un même geste (retour propriétaire 15/08) : la PREMIÈRE
     fois, ces éclats servent à mettre HUB-01 sous tension — c'est l'amorçage,
     un évènement unique. Ensuite le hub est en ligne : la même pluie remplit
     les BATTERIES de la colonie. Dans les deux cas on récolte de l'énergie, et
     c'est de l'énergie qu'on reçoit — plus jamais des matériaux. */
  const premiere = !S.hubBoot;
  frz = { pw: 0, fill: 0, booted: !premiere, cycles: 0 };
  const zone = $("#frz-zone");
  zone.innerHTML = "<div class='frz-dev' id='frz-dev'>" +
    "<div class='dev-leds' id='frz-leds'><span" + (premiere ? "" : " class='on'") + "></span><span" + (premiere ? "" : " class='on'") + "></span><span" + (premiere ? "" : " class='on'") + "></span><span" + (premiere ? "" : " class='on'") + "></span></div>" +
    "<div class='dev-label'>" + (premiere ? "HUB-01 · HORS TENSION" : "BATTERIES · EN CHARGE") + "</div></div>" +
    "<div class='frz-gauge' id='frz-gauge'>" + "<i></i>".repeat(8) + "</div>";
  $("#frz-title").textContent = premiere ? "⚡ Amorçage du hub !" : "🔋 Recharge des batteries !";
  $("#frz-score").textContent = premiere ? "Injecte l'énergie récoltée !" : "Capte les éclats d'énergie !";
  $("#frenzy").hidden = false;
  [660, 880, 1100].forEach((f, i) => beep(f, 0.1, "sine", 0.05, i * 0.09));
  const myFrz = frz;
  /* Le compteur dit où on en est : le hub s'allume une fois, les batteries se
     comptent. Appelé au clic ET à l'arrivée du paquet (290 ms plus tard), sans
     quoi le palier s'affichait avec un temps de retard. */
  function majScore() {
    if (frz !== myFrz) return;
    const suffixe = premiere
      ? (frz.booted ? " · HUB EN LIGNE ✓" : "")
      : (frz.cycles ? " · " + frz.cycles + "/" + FRZ_CYCLES + " 🔋 pleines" : "");
    $("#frz-score").textContent = "+" + frz.pw + " 🔋" + suffixe;
  }
  const spawn = setInterval(() => {
    if (frz !== myFrz) { clearInterval(spawn); return; }
    if (zone.querySelectorAll(".spark-btn").length >= 3) return;
    const b = document.createElement("button");
    b.className = "spark-btn";
    b.innerHTML = ORBIMG.ok
      ? "<img src='" + ORBIMG.img.src + "' alt=''>"
      : "<svg viewBox='0 0 24 24' fill='none' stroke='#ffc857' stroke-width='2' stroke-linejoin='round'><path d='M13 3L6 13h5l-1 8 7-10h-5z'/></svg>";
    // position : dans le cadre, hors du boîtier central et de la jauge
    const zw = zone.clientWidth, zh = zone.clientHeight;
    let lx = 10, ly = 10;
    for (let tries = 0; tries < 10; tries++) {
      lx = 10 + Math.random() * (zw - 66);
      ly = 10 + Math.random() * (zh - 92);
      const cxs = lx + 23, cys = ly + 23;
      if (Math.abs(cxs - zw / 2) < 92 && Math.abs(cys - zh * 0.4) < 66) continue; // boîtier
      break;
    }
    b.style.left = lx + "px";
    b.style.top = ly + "px";
    b.onclick = () => {
      if (frz !== myFrz) return;
      frz.pw += 5 + colonyLevel();
      sfx.collect();
      // l'éclat d'énergie file dans la prise du hub
      const pkt = document.createElement("div");
      pkt.className = "pkt";
      pkt.style.left = (parseFloat(b.style.left) + 19) + "px";
      pkt.style.top = (parseFloat(b.style.top) + 19) + "px";
      zone.appendChild(pkt);
      requestAnimationFrame(() => {
        pkt.style.left = (zone.clientWidth / 2 - 7) + "px";
        pkt.style.top = (zone.clientHeight * 0.4 - 7) + "px";
      });
      setTimeout(() => {
        if (frz !== myFrz) { pkt.remove(); return; }
        pkt.remove();
        const dev = $("#frz-dev");
        if (dev) { dev.classList.remove("rx"); void dev.offsetWidth; dev.classList.add("rx"); }
        frz.fill++;
        const cells = $("#frz-gauge").children;
        if (frz.fill <= 8) cells[frz.fill - 1].classList.add("f");
        const leds = $("#frz-leds").children;
        // une fois HUB-01 en ligne, ses diodes restent fixes : on ne rallume pas
        // un clignotement par-dessus le plan final de l'amorçage
        if (!(premiere && frz.booted)) pulseLed(leds, frz.fill % 4, 180);
        beep(500 + frz.fill * 55, 0.06, "square", 0.035);
        if (frz.fill >= 8 && frz.booted && !premiere) {
          /* Hub déjà en ligne : la jauge pleine est une BATTERIE pleine. Même
             récompense que l'amorçage (+25), même chorégraphie de diodes, puis
             la jauge se vide et une autre batterie se présente.
             `!premiere` est indispensable : pendant l'amorçage, `booted` passe à
             vrai des que le hub démarre, et les éclats tapés dans les 2,5 s qui
             suivent tombaient ici — « HUB-01 · DÉMARRAGE… » se faisait écraser
             par « BATTERIE 1 · PLEINE ✓ » en plein générique de fin. */
          frz.cycles++;
          frz.fill = 0;
          frz.pw += 25;
          const derniere = frz.cycles >= FRZ_CYCLES;
          const lab = dev && dev.querySelector(".dev-label");
          if (lab) lab.textContent = derniere ? "BATTERIES · PLEINES ✓" : "BATTERIE " + frz.cycles + " · PLEINE ✓";
          for (const c of cells) c.classList.add("full");
          setTimeout(() => {
            for (const c of cells) c.classList.remove("full", "f");
            if (lab && lab.isConnected && !derniere) lab.textContent = "BATTERIES · EN CHARGE";
          }, 420);
          // le balayage part après le pulse ci-dessus pour ne pas se marcher dessus
          for (let li2 = 0; li2 < 4; li2++) {
            setTimeout(() => {
              if (frz !== myFrz) return;
              pulseLed(leds, li2, 220);
              beep(660 + li2 * 140, 0.09, "sine", 0.05);
            }, 200 + li2 * 120);
          }
          if (derniere) {
            frz.bootAt = performance.now();   // même minuterie de sortie que l'amorçage
            $("#frz-title").textContent = "✓ Batteries pleines !";
          }
        } else if (frz.fill >= 8 && !frz.booted) {
          frz.booted = true;
          frz.bootAt = performance.now();
          frz.pw += 25;
          S.hubBoot = true; save();
          dev.querySelector(".dev-label").textContent = "HUB-01 · DÉMARRAGE…";
          for (let li2 = 0; li2 < 4; li2++) {
            setTimeout(() => {
              leds[li2].classList.remove("amber");
              leds[li2].classList.add("on");
              beep(660 + li2 * 140, 0.09, "sine", 0.05);
            }, 220 + li2 * 200);
          }
          setTimeout(() => {
            if (dev.isConnected) dev.querySelector(".dev-label").textContent = "HUB-01 · EN LIGNE ✓";
            $("#frz-title").textContent = "✓ Hub en ligne !";
          }, 1100);
        }
        majScore();   // le palier vient de tomber : l'affichage doit le refléter
      }, 290);
      b.remove();
      majScore();
    };
    zone.appendChild(b);
    setTimeout(() => b.remove(), 1700);
  }, 380);
  const t0f = performance.now();
  const endCheck = setInterval(() => {
    if (frz !== myFrz) { clearInterval(endCheck); return; }
    const el = performance.now() - t0f;
    // fermeture : évènement accompli (+2,5 s de rab), ou ignoré (8 s sans tap), ou garde-fou 25 s
    // `bootAt` marque cet évènement : HUB-01 qui démarre, ou la dernière batterie pleine
    const done = frz.bootAt && el > (frz.bootAt - t0f) + 2500;
    const ignored = frz.pw === 0 && el > 8000;
    if (!done && !ignored && el < 25000) return;
    clearInterval(endCheck);
    clearInterval(spawn);
    const m = frz.pw, cyc = frz.cycles;
    frz = null;
    $("#frenzy").hidden = true;
    if (m > 0) {
      S.pw = (S.pw || 0) + m;
      toast(premiere
        ? "⚡ HUB-01 sous tension : <b>+" + m + " 🔋</b> · <b>démarrage réussi ✓</b>"
        : "🔋 Batteries rechargées : <b>+" + m + " 🔋</b>" +
          (cyc ? " · <b>" + cyc + " pleine" + (cyc > 1 ? "s" : "") + " ✓</b>" : " de réserve."), true);
      if (!S.frzSeen) {
        S.frzSeen = true;
        setTimeout(() => toast("Règle n°1 du technicien : <b>vérifier l'alimentation</b>. Un équipement sans courant, c'est un réseau mort. Bientôt : le câblage (🔌)."), 1800);
      }
    }
    save();
  }, 500);
}

