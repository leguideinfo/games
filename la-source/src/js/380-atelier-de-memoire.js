/* ---------- atelier de mémoire ---------- */
const ATL = {
  1: {
    nm: "Le feu", ic: "🔥",
    savoir: "Première énergie maîtrisée par l'humanité.",
    pic: [
      "..1...",
      ".11.1.",
      ".1121.",
      "112211",
      "12221.",
      ".111..",
    ],
    col: { "1": "#ff7a1a", "2": "#ffc857" },
  },
  2: {
    nm: "La roue", ic: "🛞",
    savoir: "Porter plus loin que ses bras — le mouvement démultiplié.",
    pic: [
      ".11111.",
      "1..2..1",
      "1..2..1",
      "1223221",
      "1..2..1",
      "1..2..1",
      ".11111.",
    ],
    col: { "1": "#8a6844", "2": "#c9a06a", "3": "#ffc857" },
  },
  3: {
    nm: "L'arbre", ic: "🌳",
    savoir: "La vie qui grandit, nourrit et abrite.",
    pic: [
      "..222..",
      ".22222.",
      "2222222",
      ".22222.",
      "...1...",
      "...1...",
      "..111..",
    ],
    col: { "1": "#8a5a2b", "2": "#57e389" },
  },
  4: {
    nm: "L'abri", ic: "🏠",
    savoir: "Le premier endroit à soi.",
    pic: [
      "...11...",
      "..1111..",
      ".111111.",
      "11111111",
      ".222222.",
      ".223322.",
      ".223322.",
      ".222222.",
    ],
    col: { "1": "#ff7a1a", "2": "#e8e6e0", "3": "#38a9ff" },
  },
};
let atl = null;
function openAtelier(id) {
  closeSheets();
  const m = ATL[id];
  const H = m.pic.length, W = m.pic[0].length;
  // découpe l'image en pièces de puzzle (2-4 cases, déterministe)
  const r = mulberry32(id * 991 + 7);
  const owner = {};
  const pieces = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (m.pic[y][x] === "." || owner[y * W + x] != null) continue;
    const cells = [[x, y]];
    owner[y * W + x] = pieces.length;
    const target = 2 + Math.floor(r() * 3);
    let cur = [x, y];
    while (cells.length < target) {
      const nbrs = [[cur[0] + 1, cur[1]], [cur[0], cur[1] + 1], [cur[0] - 1, cur[1]], [cur[0], cur[1] - 1]]
        .filter(([nx, ny]) => nx >= 0 && nx < W && ny >= 0 && ny < H && m.pic[ny][nx] !== "." && owner[ny * W + nx] == null);
      if (!nbrs.length) break;
      const n = nbrs[Math.floor(r() * nbrs.length)];
      owner[n[1] * W + n[0]] = pieces.length;
      cells.push(n);
      cur = n;
    }
    pieces.push({ cells, placed: false });
  }
  const order = pieces.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  atl = { id, m, W, H, pieces, order, owner, sel: null, placed: 0 };
  const g = $("#at-grid");
  g.innerHTML = "";
  g.style.gridTemplateColumns = "repeat(" + W + ", 1fr)";
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = document.createElement("div");
    const need = m.pic[y][x] !== ".";
    d.className = "acell" + (need ? " need" : " void");
    d.dataset.x = x; d.dataset.y = y;
    if (need) { d.dataset.need = "1"; d.onclick = () => atlTry(x, y); }
    g.appendChild(d);
  }
  atlTray();
  $("#at-score").textContent = "Choisis une pièce, puis tape sa place dans la forme.";
  $("#sh-atelier").hidden = false;
}
function atlTray() {
  const tr = $("#at-tray");
  tr.innerHTML = "";
  // toujours une pièce sélectionnée : la première libre si besoin
  if (atl.sel == null || atl.pieces[atl.sel].placed) {
    atl.sel = null;
    for (const i of atl.order) if (!atl.pieces[i].placed) { atl.sel = i; break; }
  }
  for (const i of atl.order) {
    const pc = atl.pieces[i];
    if (pc.placed) continue;
    const b = document.createElement("button");
    b.className = "at-piece" + (atl.sel === i ? " sel" : "");
    const minx = Math.min(...pc.cells.map((c) => c[0]));
    const miny = Math.min(...pc.cells.map((c) => c[1]));
    const bw = Math.max(...pc.cells.map((c) => c[0])) - minx + 1;
    const bh = Math.max(...pc.cells.map((c) => c[1])) - miny + 1;
    const mini = document.createElement("div");
    mini.className = "at-mini";
    mini.style.gridTemplateColumns = "repeat(" + bw + ", 9px)";
    mini.style.gridAutoRows = "9px";
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const c = document.createElement("div");
      const cell = pc.cells.find(([px, py]) => px - minx === x && py - miny === y);
      if (cell) {
        c.className = "at-mini-c";
        c.style.background = atl.m.col[atl.m.pic[cell[1]][cell[0]]];
      }
      mini.appendChild(c);
    }
    b.appendChild(mini);
    b.onclick = () => { atl.sel = i; sfx.ui(); atlTray(); };
    tr.appendChild(b);
  }
}
function atlTry(x, y) {
  if (!atl || atl.sel == null) return;
  const pc = atl.pieces[atl.sel];
  if (pc.placed) return;
  // la pièce s'emboîte si on tape une case de SON emplacement
  if (atl.owner[y * atl.W + x] !== atl.sel) {
    sfx.deny();
    $("#at-grid").classList.remove("shake");
    void $("#at-grid").offsetWidth;
    $("#at-grid").classList.add("shake");
    return;
  }
  pc.placed = true;
  atl.placed++;
  for (const [cx, cy] of pc.cells) {
    const cell = $("#at-grid").children[cy * atl.W + cx];
    cell.classList.add("fill", "glow");
    cell.style.background = atl.m.col[atl.m.pic[cy][cx]];
    cell.style.borderColor = atl.m.col[atl.m.pic[cy][cx]];
    cell.style.borderStyle = "solid";
  }
  beep(420 + atl.placed * 30, 0.08, "square", 0.035);
  $("#at-score").textContent = atl.placed + " / " + atl.pieces.length + " pièces";
  atlTray();
  if (atl.placed >= atl.pieces.length) atlReveal();
}
function atlReveal() {
  const m = atl.m, id = atl.id, H = m.pic.length, W = m.pic[0].length;
  const g = $("#at-grid");
  let i = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (m.pic[y][x] === ".") continue;
    const cell = g.children[y * W + x];
    setTimeout(() => { cell.classList.remove("glow"); void cell.offsetWidth; cell.classList.add("glow"); }, 40 * i++);
  }
  sfx.tech();
  $("#at-score").textContent = m.ic + " " + m.nm + " — " + m.savoir;
  if (!S.memories.includes(id)) {
    S.memories.push(id);
    const rw = 40 + 20 * id;
    S.mat = Math.min(matCap(), S.mat + rw);
    setTimeout(() => toast("🧩 Mémoire reconstituée : <b>" + m.nm + "</b> +" + rw + " 💠 — la Fresque s'agrandit.", true), 1400);
  }
  save();
  setTimeout(() => { if (!$("#sh-atelier").hidden) openArch(); }, 3400);
}

