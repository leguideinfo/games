/* ---------- onglets ---------- */
$("#tab-col").onclick = () => {
  const wasCol = view === "col";
  view = "col"; setTab("col");
  if (!wasCol || place) return;
  // déjà sur la colonie : ouvre directement l'action de la mission en cours
  const gt = guideWorldTarget();
  if (!gt || gt.x == null) return;
  if (gt.kind === "tile" && GUIDE_BUILD[S.mi]) openBuild({ x: gt.x, y: gt.y });
  else if (gt.kind === "bld") {
    const b = gt.b || bldAtTile(Math.round(gt.x), Math.round(gt.y));
    if (b) openBld(b);
  } else if (gt.kind === "src") openSource();
};
$("#tab-map").onclick = () => {
  if ($("#tab-map").disabled) return;
  view = "map"; setTab("map");
  missionDone("map");
};
$("#tab-tech").onclick = () => { setTab("col"); view = "col"; openTech(); };
$("#tab-net").onclick = () => { setTab("col"); view = "col"; openNet(); };
const NET_LAYERS = [
  { id: "app", nm: "Application", osi: "OSI 7 · les services", ds: "Ce que font les machines : distribuer des adresses (DHCP), nommer (DNS)…" },
  { id: "tra", nm: "Transport", osi: "OSI 4 · TCP / UDP", ds: "Découpe et fiabilise les échanges — bientôt dans la colonie." },
  { id: "res", nm: "Réseau", osi: "OSI 3 · IP, routage", ds: "Les adresses IP et le chemin d'un réseau à l'autre." },
  { id: "lia", nm: "Liaison", osi: "OSI 2 · trames, MAC, switch", ds: "Les trames vont de machine à machine, commutées par les switchs." },
  { id: "phy", nm: "Physique", osi: "OSI 1 · câbles, bits", ds: "Les câbles portent des bits. Sans lien physique, rien ne passe." },
];
function openNet() {
  closeSheets();
  const acts = $("#net-actions");
  acts.innerHTML = "";
  const bw = document.createElement("button");
  bw.textContent = (wire ? "🔌 Câblage en cours…" : "🔌 Câbler sur la carte");
  bw.onclick = () => { closeSheets(); if (!wire) $("#wirebtn").onclick(); };
  if (S.mi === 10 || S.mi === 12) bw.classList.add("guide");
  acts.appendChild(bw);
  const bs = document.createElement("button");
  bs.textContent = "▶ SIMULATION : suivre une trame";
  bs.disabled = !S.links.length;
  bs.onclick = () => openSim();
  if (S.mi === 13 && !bs.disabled) bs.classList.add("guide");
  acts.appendChild(bs);
  for (const tt of ["switchhub", "dhcpsrv"]) {
    if ((BT[tt].mAt || 0) > S.mi) continue;
    const b = document.createElement("button");
    b.textContent = "+ " + BT[tt].nm + " · " + fmt(buildCost(tt)) + " 💠" + (BT[tt].eo ? " + " + buildCostEo(tt) + " Eo" : "");
    b.onclick = () => { closeSheets(); armPlace("bld", tt); };
    acts.appendChild(b);
  }
  const bands = $("#net-bands");
  bands.innerHTML = "";
  const dhcp = dhcpOnline();
  for (const L of NET_LAYERS) {
    const d = document.createElement("div");
    d.className = "net-band";
    d.innerHTML = "<div class='bn'><b>" + L.nm + "</b> · " + L.osi + "</div>";
    const chips = document.createElement("div");
    chips.className = "net-chips";
    const chip = (html, on, info) => {
      const c = document.createElement("button");
      c.className = "net-chip" + (on ? "" : " off");
      c.innerHTML = html;
      c.onclick = () => { sfx.ui(); toast(info, true); };
      chips.appendChild(c);
    };
    if (L.id === "phy") {
      chip(SRC_IC + " La Source · " + portUsed("src") + "/" + portMax("src"), true, "Le cœur du réseau. " + portUsed("src") + "/" + portMax("src") + " ports utilisés — un Switch en offre 8 de plus.");
      for (const b of S.buildings) {
        const k = keyOf(b);
        const on = netConnected(k);
        chip(BT[b.t].ic + " " + BT[b.t].nm, on, on ? BT[b.t].nm + " : raccordé · " + portUsed(k) + "/" + portMax(k) + " ports." : "Non raccordé : −30 % de production. Tire un câble avec 🔌.");
      }
      chip("〰 " + S.links.length + " câble" + (S.links.length > 1 ? "s" : ""), S.links.length > 0, L.ds);
    } else if (L.id === "lia") {
      const sws = S.buildings.filter((b) => b.t === "switchhub");
      if (!sws.length) chip("Aucun switch — les trames se partagent les mêmes fils", false, L.ds);
      for (const sw of sws) {
        const k = keyOf(sw);
        chip("🔀 Switch · " + portUsed(k) + "/8 ports", netConnected(k), "Le switch tient une table MAC : il apprend qui est branché sur quel port et n'envoie chaque trame qu'au bon endroit.");
      }
      chip("MAC Source : " + macOf("src"), true, "Chaque interface réseau a une adresse MAC unique, en couche Liaison.");
    } else if (L.id === "res") {
      if (!dhcp) chip("Pas d'adresses IP — il faut un Serveur DHCP", false, "Sans adresse de couche 3, pas de vrai ping : les machines n'ont pas de nom logique.");
      else {
        chip("🪪 DHCP en ligne", true, "Le Serveur DHCP attribue automatiquement une adresse IP à chaque machine raccordée.");
        chip(SRC_IC + " " + ipOf("src"), true, "L'adresse IP de la Source, attribuée par le DHCP.");
        for (const b of S.buildings) {
          const k = keyOf(b);
          if (netConnected(k) && b.t !== "switchhub") chip(BT[b.t].ic + " " + ipOf(k), true, "Adresse IP de " + BT[b.t].nm + " (un switch, lui, n'a pas besoin d'IP pour commuter).");
        }
      }
    } else if (L.id === "tra") {
      chip("À venir : TCP / UDP", false, L.ds);
    } else {
      chip(dhcp ? "🪪 Service DHCP" : "Aucun service en ligne", dhcp, L.ds);
    }
    d.appendChild(chips);
    bands.appendChild(d);
  }
  $("#sh-net").hidden = false;
}
function simPath() {
  if (netDirty) netRecalc();
  const keys = S.buildings.map(keyOf).filter((k) => netSet.has(k));
  const target = keys.find((k) => { const n = nodeAt(k); return n.t !== "switchhub" && n.t !== "dhcpsrv"; }) || keys[0];
  if (!target) return null;
  const prev = { src: null }, q = ["src"];
  while (q.length) {
    const cur = q.shift();
    if (cur === target) break;
    for (const l of S.links) {
      const nx = l.a === cur ? l.b : l.b === cur ? l.a : null;
      if (nx && !(nx in prev)) { prev[nx] = cur; q.push(nx); }
    }
  }
  if (!(target in prev)) return null;
  const path = [];
  for (let k = target; k !== null; k = prev[k]) path.unshift(k);
  return path;
}
function openSim() {
  const path = simPath();
  if (!path || path.length < 2) { toast("Câble d'abord un bâtiment à la Source (🔌)."); return; }
  closeSheets();
  const dhcp = dhcpOnline();
  const last = path[path.length - 1];
  const steps = [];
  const nmOf = (k) => nodeAt(k).nm;
  steps.push({ at: 0, msg: "⚡ La Source prépare des <b>données</b> pour " + nmOf(last) + ".", stack: ["data"] });
  if (dhcp) steps.push({ at: 0, msg: "Couche <b>Réseau</b> : le paquet reçoit ses adresses IP — <b>" + ipOf("src") + " → " + ipOf(last) + "</b>.", stack: ["ip", "data"] });
  else steps.push({ at: 0, msg: "Pas de Serveur DHCP : <b>aucune adresse IP</b>. Ce sera une trame de test, couche Liaison uniquement.", stack: ["data"] });
  steps.push({ at: 0, msg: "Couche <b>Liaison</b> : encapsulation dans une <b>trame</b> — MAC " + macOf("src") + " → " + macOf(last) + ".", stack: dhcp ? ["mac", "ip", "data"] : ["mac", "data"] });
  for (let i = 1; i < path.length; i++) {
    steps.push({ at: i, msg: "Couche <b>Physique</b> : les bits filent dans le câble ⚡", stack: null });
    if (i < path.length - 1 && nodeAt(path[i]).t === "switchhub")
      steps.push({ at: i, msg: "🔀 Le <b>Switch</b> lit la MAC de destination dans sa table et commute la trame vers le bon port.", stack: null });
  }
  steps.push({ at: path.length - 1, msg: "📬 " + nmOf(last) + " <b>désencapsule</b> : trame" + (dhcp ? " ➜ paquet IP" : "") + " ➜ données. <b>Livraison réussie ✓</b>", stack: ["done"] });
  sim = { path, steps, i: 0 };
  renderSim();
  $("#sh-sim").hidden = false;
}
function renderSim() {
  const st = sim.steps[sim.i];
  $("#sim-title").textContent = "▶ Simulation · étape " + (sim.i + 1) + " / " + sim.steps.length;
  $("#sim-msg").innerHTML = st.msg;
  const pd = $("#sim-path");
  pd.innerHTML = "";
  sim.path.forEach((k, idx) => {
    if (idx) { const a = document.createElement("span"); a.className = "sim-arrow"; a.textContent = "──"; pd.appendChild(a); }
    const nd = nodeAt(k);
    const n = document.createElement("span");
    n.className = "sim-node" + (idx === st.at ? " cur" : "");
    n.innerHTML = (k === "src" ? SRC_IC : BT[nd.t].ic) + " " + nd.nm;
    pd.appendChild(n);
  });
  if (st.stack) {
    const enc = { data: ["#a06bff", "DONNÉES"], ip: ["#38a9ff", "PAQUET IP"], mac: ["#57e389", "TRAME · MAC"], done: ["#57e389", "✓ DONNÉES LIVRÉES"] };
    const build = (list) => !list.length ? "" :
      "<div class='enc' style='border-color:" + enc[list[0]][0] + "'><span style='color:" + enc[list[0]][0] + "'>" + enc[list[0]][1] + "</span>" + build(list.slice(1)) + "</div>";
    $("#sim-stack").innerHTML = build(st.stack);
  }
  $("#sim-next").textContent = sim.i >= sim.steps.length - 1 ? "TERMINER ✓" : "SUIVANT ▶";
}
$("#sim-next").onclick = () => {
  if (!sim) return;
  if (sim.i >= sim.steps.length - 1) {
    $("#sh-sim").hidden = true;
    sim = null;
    sfx.tech();
    missionDone("sim1");
    save();
    return;
  }
  sim.i++;
  sfx.ui();
  renderSim();
};
$("#tab-arch").onclick = () => { setTab("col"); view = "col"; openArch(); };
function setTab(v) {
  $("#tab-col").classList.toggle("on", v === "col");
  $("#tab-map").classList.toggle("on", v === "map");
  $("#mapnote").hidden = v !== "map";
  if (v === "map") closeSheets();
  sfx.ui();
}

