/* ---------- archives de l'humanité ---------- */
const FRAG_TXT = {
  1: "<div class='hd'>Archive 001 · journal de bord — jour 4 812 de l'Exode</div>" +
     "« Nous avons scellé la mémoire de l'humanité dans un format que seules " +
     "nos machines d'époque savent lire. Pas par nostalgie — par prudence. " +
     "Si tu lis ceci, tu as reconstruit l'une d'elles. Alors écoute bien : " +
     "<span class='cy'>l'humanité n'a pas disparu. Elle a choisi de…</span> »" +
     "<br><br><span style='color:var(--dim)'>[suite chiffrée — d'autres Fragments dorment sous la surface]</span>",
};
const ASM = [
  { nm: "Carte mère", opts: [
    { l: "ATX · socket AM4 · 4 slots DDR4 · 2 × M.2 NVMe", ok: true },
    { l: "Mini-ITX · socket LGA775 · DDR2", why: "chipset d'une autre ère : rien de compatible ne s'y monte" },
    { l: "Carte serveur SP3 · ECC uniquement", why: "prévue pour des CPU 64 cœurs — hors budget ⚡" },
  ]},
  { nm: "Processeur", opts: [
    { l: "6 cœurs / 12 threads · 3,6 GHz · socket AM4", ok: true },
    { l: "2 cœurs · 1,6 GHz · basse consommation", why: "trop faible pour décoder les Archives" },
    { l: "64 cœurs · socket SP3", why: "socket SP3 ≠ AM4 : il n'entre pas dans la carte mère" },
  ]},
  { nm: "Mémoire", opts: [
    { l: "64 Go DDR4 (4 × 16 Go)", ok: true },
    { l: "8 Go DDR3", why: "la DDR3 n'entre physiquement pas dans un slot DDR4" },
    { l: "16 Go DDR4", why: "insuffisant : le décodage réclame 64 Go" },
  ]},
  { nm: "Stockage", opts: [
    { l: "2 × 512 Go NVMe · RAID 1 (miroir)", ok: true },
    { l: "1 disque 500 Go · 5 400 tr/min", why: "un seul disque : aucune tolérance de panne, et trop lent" },
    { l: "Lecteur de bandes magnétiques", why: "accès séquentiel : impossible d'y faire tourner un système" },
  ]},
  { nm: "Réseau", opts: [
    { l: "Ethernet 1 Gbit/s", ok: true },
    { l: "Modem 56k", why: "les Archives mettraient 40 ans à transiter" },
    { l: "Optique 100 Gbit/s", why: "consommation ⚡ au-delà de la Centrale" },
  ]},
];
const asmSel = [null, null, null, null, null];
const soutePrete = () => bcount("datacenter") > 0 && !S.archives.length;
const ASM_COST = { m: 200, e: 20 };

function openArch() {
  closeSheets();
  $("#arch-sub").textContent = "Les fils à tirer, à ton rythme.";
  const rd = $("#arch-reader");
  const qhead = "<div class='sl-nm' style='margin-bottom:6px'>📼 QUÊTE · LES ARCHIVES DE L'HUMANITÉ</div>";
  if (!S.archives.length) {
    rd.innerHTML = "";
  } else if (S.reader) {
    rd.innerHTML = qhead + "<div class='bcard'><div class='ic'>🖥</div><div class='grow'>" +
      "<div class='nm' style='color:var(--green)'>Lecteur d'Archives — EN LIGNE</div>" +
      "<div class='ds'>Système d'époque opérationnel.</div></div></div>";
  } else {
    rd.innerHTML = qhead + "<div class='bcard'><div class='ic'>🖥</div><div class='grow'>" +
      "<div class='nm' style='color:var(--red)'>Lecteur d'Archives — hors ligne</div>" +
      "<div class='ds'>Aucun système compatible avec ce format ancien.</div></div></div>";
    const b = document.createElement("button");
    b.className = "forge-asm guide";
    b.textContent = "🔩 ASSEMBLER LE SYSTÈME D'ÉPOQUE";
    b.onclick = openAsm;
    rd.appendChild(b);
  }
  const list = $("#arch-list");
  list.innerHTML = "";
  // archives visuelles (vrais puzzles d'image) — photos du module d'Aurore, sans Lecteur
  {
    const rh = document.createElement("div");
    rh.className = "sl-nm";
    rh.style.margin = "12px 0 6px";
    rh.textContent = "🖼 QUÊTE · LES IMAGES DU PASSÉ";
    list.appendChild(rh);
    const rids = Object.keys(REST).map(Number).sort((a, b) => a - b);
    let rguided = false;
    let rpending = 0; // 2 cartes non restaurées max : la jouable + un aperçu
    for (const rid of rids) {
      const rdef = REST[rid];
      const rdone = S.restored.includes(rid);
      if (!rdone && rpending >= 2) break;
      if (!rdone) rpending++;
      const chainOk = rid === rids[0] || S.restored.includes(rid - 1);
      const runlocked = chainOk; // photos du module d'Aurore : aucun Lecteur requis
      const card = document.createElement("div");
      card.className = "bcard" + (runlocked ? "" : " locked");
      card.innerHTML = "<div class='ic'>" + (runlocked || rdone ? "🖼" : "🔒") + "</div><div class='grow'>" +
        "<div class='nm'>Archive 00" + rid + (rdone ? " · " + rdef.nm : "") + "</div>" +
        "<div class='ds'>" + (rdone ? rdef.cap
          : runlocked ? "Image corrompue — à restaurer."
          : "Restaure l'Archive précédente.") + "</div></div>";
      const b = document.createElement("button");
      b.textContent = rdone ? "REVOIR" : "RESTAURER";
      b.disabled = !runlocked;
      if (runlocked && !rdone && !rguided) { b.classList.add("guide"); rguided = true; }
      b.onclick = () => openRestore(rid);
      card.appendChild(b);
      list.appendChild(card);
    }
  }
  for (const f of S.archives) {
    if (f.dec) {
      const d = document.createElement("div");
      d.className = "frag-txt";
      d.innerHTML = FRAG_TXT[f.id] || "…";
      list.appendChild(d);
    } else {
      const card = document.createElement("div");
      card.className = "bcard";
      card.innerHTML = "<div class='ic'>📼</div><div class='grow'>" +
        "<div class='nm'>Fragment 00" + f.id + "</div>" +
        "<div class='ds'>" + (S.reader ? "Prêt à décrypter." : "Chiffré — format ancien.") + "</div></div>";
      const b = document.createElement("button");
      b.textContent = "DÉCRYPTER";
      b.disabled = !S.reader;
      if (S.reader) b.classList.add("guide");
      b.onclick = () => {
        f.dec = true;
        sfx.tech();
        toast("📼 Premier fragment décrypté — <b>l'histoire commence</b>.", true);
        save();
        openArch();
      };
      card.appendChild(b);
      list.appendChild(card);
    }
  }
  // Atelier de Mémoire : séquence de Mémoires, chacune débloque la suivante
  {
    const ah = document.createElement("div");
    ah.className = "sl-nm";
    ah.style.margin = "12px 0 6px";
    ah.textContent = "🧩 QUÊTE · L'ATELIER DE MÉMOIRE";
    list.appendChild(ah);
    const ids = Object.keys(ATL).map(Number).sort((a, b) => a - b);
    let guided = false;
    for (const aid of ids) {
      const mm = ATL[aid];
      const done = S.memories.includes(aid);
      const unlocked = aid === 1 || S.memories.includes(aid - 1);
      const card = document.createElement("div");
      card.className = "bcard" + (unlocked ? "" : " locked");
      card.innerHTML = "<div class='ic'>" + (done ? mm.ic : unlocked ? "🧩" : "🔒") + "</div><div class='grow'>" +
        "<div class='nm'>Mémoire 00" + aid + (done ? " · " + mm.nm : "") + "</div>" +
        "<div class='ds'>" + (done ? mm.savoir : unlocked ? "Une image dort dans la mémoire du module." : "Termine la Mémoire précédente.") + "</div></div>";
      const b = document.createElement("button");
      b.textContent = done ? "REVOIR" : "RECONSTITUER";
      b.disabled = !unlocked;
      if (unlocked && !done && !guided) { b.classList.add("guide"); guided = true; }
      b.onclick = () => openAtelier(aid);
      card.appendChild(b);
      list.appendChild(card);
    }
  }
  $("#sh-arch").hidden = false;
}

