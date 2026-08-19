// Test E2E de La Source — parcours complet des 26 missions par interactions réelles.
// Usage : node test/e2e.mjs   (depuis la-source/ ; nécessite playwright + Chromium)
// Chromium : CHROMIUM_PATH sinon /opt/pw-browsers/chromium-1194/chrome-linux/chrome
import { chromium } from "playwright";
import { fileURLToPath } from "url";
import path from "path";

const here = path.dirname(fileURLToPath(import.meta.url));
const gameUrl = process.env.GAME_URL || "file://" + path.resolve(here, "..", "index.html");
const shots = process.env.SHOTS_DIR || here;
const exe = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const browser = await chromium.launch({ executablePath: exe });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

await page.goto(gameUrl);
await page.waitForTimeout(300);
await page.click("#inext"); await page.click("#inext"); await page.waitForTimeout(200);
await page.click("#inext");
await page.waitForTimeout(400);

// M0 — HUD minimal au départ
const gates0 = await page.evaluate(() => ({
  eoHidden: document.querySelector("#hud-eo").style.display === "none",
  enHidden: document.querySelector("#hud-en").style.display === "none",
  techHidden: document.querySelector("#tab-tech").hidden,
  mapHidden: document.querySelector("#tab-map").hidden,
}));
console.log("gates au départ (tout masqué):", JSON.stringify(gates0));

// M0 : envoyer un drone ouvrier sur un gisement (première action du jeu).
// Coordonnées recalculées avant chaque tap : le guide fait glisser la caméra.
for (let tries = 0; tries < 8; tries++) {
  const cpos0 = await page.evaluate(() =>
    window.__api.crystalsAll().find((c) => c.x > 40 && c.x < 350 && c.y > 140 && c.y < 530) || null);
  if (!cpos0) {
    await page.evaluate(() => { const c = window.__api.crystalsAll()[0]; if (c) window.__api.center(c.tx, c.ty); });
    await page.waitForTimeout(250); continue;
  }
  await page.mouse.click(cpos0.x, cpos0.y);
  await page.waitForTimeout(350);
  if (await page.evaluate(() => window.__LS().units.length > 0)) break;
}
console.log("drone envoyé sur un gisement (attendu mi 1, dr 1):", await page.evaluate(() =>
  ({ mi: window.__LS().mi, dr: window.__LS().dr, units: window.__LS().units.length })));

// gisements : au moins un de chaque taille au spawn, stock qui décroît,
// épuisement => drone de retour en soute et case rendue au sable
const szs = await page.evaluate(() => window.__api.crysSizes());
console.log("tailles de gisements au spawn (chacune >= 1):", szs, szs.every((n) => n >= 1) ? "OK" : "ERREUR");
const u0 = await page.evaluate(() => { const u = window.__LS().units[0]; return { x: u.x, y: u.y }; });
const st0 = await page.evaluate((u) => window.__api.crysAt(u.x, u.y).stock, u0);
await page.waitForTimeout(900);
const st1 = await page.evaluate((u) => window.__api.crysAt(u.x, u.y).stock, u0);
console.log("extraction en cours (stock décroît):", st1 < st0 ? "OK" : "ERREUR", { st0, st1 });

// M1 : poser le Hub réseau — il n'est PAS relié d'office
await page.evaluate(() => {
  for (let y = 3; y <= 6; y++) for (let x = 2; x <= 6; x++)
    if (window.__api.buildableAt(x, y)) { window.__api.build("coffret", x, y); return; }
});
await page.waitForTimeout(500);
console.log("hub posé (attendu mi 2, aucun lien):", await page.evaluate(() =>
  ({ mi: window.__LS().mi, links: window.__LS().links.length })));

// M2 : récolter des éclats pour alimenter HUB-01 (l'Amorçage boote le hub)
let collected = 0;
for (let tries = 0; tries < 12 && collected < 3; tries++) {
  await page.waitForFunction(() => window.__api.orbsPos().length > 0, null, { timeout: 15000 });
  const o = await page.evaluate(() =>
    window.__api.orbsPos().find((p) => p.sx > 20 && p.sx < 340 && p.sy > 145 && p.sy < 690) || null);
  if (!o) {
    await page.evaluate(() => { const f = window.__api.orbsPos()[0]; if (f) window.__api.center(f.tx, f.ty); });
    await page.waitForTimeout(1000); continue;
  }
  await page.mouse.click(o.sx, o.sy);
  await page.waitForTimeout(250);
  collected = await page.evaluate(() => window.__LS().orbsCollected);
}
await page.waitForTimeout(700);
await page.waitForFunction(() => document.querySelector("#frenzy").hidden, null, { timeout: 30000 });
await page.evaluate(() => window.__api.bootHub()); // l'Amorçage réussi, sans jouer le mini-jeu
await page.waitForTimeout(500);
console.log("HUB-01 alimenté (attendu mi 3 + bouton câblage):", await page.evaluate(() =>
  ({ mi: window.__LS().mi, wire: !document.querySelector("#wirebtn").hidden })));

// M3 : câbler HUB-01 à la Source
await page.evaluate(() => {
  const h = window.__LS().buildings.find((b) => b.t === "coffret");
  window.__LS().mat = 500;
  window.__api.link("src", 0, h.x, h.y);
});
await page.waitForTimeout(500);
console.log("HUB-01 câblé (attendu mi 4):", await page.evaluate(() =>
  ({ mi: window.__LS().mi, links: window.__LS().links.length })));

// épuisement d'un gisement : le drone rentre en soute, la case redevient sable.
// (on redescend le stock 💠 : entrepôt plein = drones en pause, par conception)
await page.evaluate((u) => { window.__LS().mat = 40; window.__api.crysSet(u.x, u.y, 0.4); }, u0);
await page.waitForTimeout(1200);
console.log("gisement épuisé (drone en soute, case sable):", await page.evaluate((u) => ({
  dr: window.__LS().dr, units: window.__LS().units.length,
  kind: window.__api.tileKind(u.x, u.y),
}), u0));
// respawn : on force l'expiration -> le gisement se reforme, plein
await page.evaluate((u) => { window.__LS().crxDead[u.x + "," + u.y] = Date.now() - 9e6; }, u0);
await page.waitForTimeout(1600);
console.log("gisement reformé (kind crystal, stock plein):", await page.evaluate((u) => ({
  kind: window.__api.tileKind(u.x, u.y), ...window.__api.crysAt(u.x, u.y),
}), u0));

// drone de liaison : une patrouille complète du périmètre, une seule pose (au spawn)
await page.evaluate(() => window.__api.droneRun());
const patrouille = await page.evaluate(() => window.__api.droneInfo()[0]);
console.log("patrouille lancée (6 segments attendus):", JSON.stringify(patrouille));
await page.waitForFunction(() => {
  const d = window.__api.droneInfo()[0];
  return !d || d.phase === "LANDING" || d.leg >= 4;
}, null, { timeout: 45000 });
console.log("patrouille en fin de circuit:", await page.evaluate(() => JSON.stringify(window.__api.droneInfo())));
// posé au spawn = pool vide, OU nouvelle patrouille repartie (leg 0-1) : dans
// les deux cas le circuit précédent s'est bouclé par une pose unique
await page.waitForFunction(() => {
  const l = window.__api.droneInfo();
  return l.length === 0 || l.every((d) => d.leg <= 1);
}, null, { timeout: 30000 });
console.log("drone posé au spawn, circuit bouclé OK");

// M2 : menu construire = extracteur seul, construction par tap réel.
// La cible est recalculée juste avant chaque clic : la caméra peut glisser
// (guide de mission) entre l'évaluation et le tap.
await page.evaluate(() => window.__api.center(4, 4));
await page.waitForTimeout(200);
let menu1 = [];
for (let tries = 0; tries < 5 && !menu1.length; tries++) {
  const target = await page.evaluate(() => {
    for (let y = 2; y <= 6; y++) for (let x = 2; x <= 6; x++) {
      if (window.__api.buildableAt(x, y)) {
        const p = window.__api.screenOf(x, y);
        if (p.x > 30 && p.x < 360 && p.y > 120 && p.y < 540) return { sx: p.x, sy: p.y };
      }
    }
    return null;
  });
  if (!target) { await page.evaluate(() => window.__api.center(4, 4)); await page.waitForTimeout(300); continue; }
  await page.mouse.click(target.sx, target.sy);
  await page.waitForTimeout(350);
  menu1 = await page.evaluate(() => [...document.querySelectorAll("#buildlist .bcard .nm")].map((n) => n.textContent));
}
console.log("menu à M1:", JSON.stringify(menu1));
await page.locator("#buildlist .bcard button").first().click();
await page.waitForTimeout(300);

// M2 : amélioration via UI — position recalculée avant chaque tap (la
// caméra du guide peut glisser), retry tant que la fiche n'est pas ouverte
for (let tries = 0; tries < 5; tries++) {
  const bpos = await page.evaluate(() => {
    const b = window.__LS().buildings[0];
    return window.__api.screenOf(b.x, b.y);
  });
  await page.mouse.click(bpos.x, bpos.y - 20);
  await page.waitForTimeout(350);
  if (await page.evaluate(() => !document.querySelector("#sh-bld").hidden)) break;
  await page.evaluate(() => { const b = window.__LS().buildings[0]; window.__api.center(b.x, b.y); });
  await page.waitForTimeout(250);
}
await page.click("#bl-up");
await page.waitForTimeout(300);
console.log("mission après amélioration:", await page.evaluate(() => window.__LS().mi));

// M3 : palier « ressens le stock » (250/300 💠)
await page.evaluate(() => { window.__LS().mat = 260; });
await page.waitForTimeout(500);
// M4-M10 : entrepôt → 2e extracteur → centrale (puis NIV 2) → serveur → 12 Eo → datacenter
const buildFirst = (t) => page.evaluate((tt) => {
  window.__LS().mat = 300;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (window.__api.buildableAt(x, y)) { window.__api.build(tt, x, y); return; }
  }
}, t);
for (const t of ["entrepot", "extracteur", "centrale"]) { await buildFirst(t); await page.waitForTimeout(350); }
await page.evaluate(() => { window.__LS().buildings.find((b) => b.t === "centrale").l = 2; });
await page.waitForTimeout(500);

// M8-M11 : chapitre 🔌 — câbles, switch, simulation de trame
await page.evaluate(() => { window.__LS().mat = 500; window.__api.autolink(); });
await page.waitForTimeout(600);
console.log("réseau câblé (attendu mi 11):", await page.evaluate(() => ({ mi: window.__LS().mi, ...window.__api.netInfo() })));
await buildFirst("switchhub");
await page.waitForTimeout(400);
// le Switch posé doit être câblé pour terminer « raccorde tout »
await page.evaluate(() => { window.__LS().mat = 500; window.__api.autolink(); });
await page.waitForTimeout(500);
await page.evaluate(() => window.__api.simDone());
await page.waitForTimeout(400);

// M12-M14 : serveur → 12 Eo → datacenter
await buildFirst("serveur");
await page.waitForTimeout(350);
await page.evaluate(() => window.__api.giveEo(15));
await page.waitForTimeout(500);
await buildFirst("datacenter");
await page.waitForTimeout(400);
console.log("après la séquence ressources (attendu mi 17):", await page.evaluate(() => ({ mi: window.__LS().mi })));

// M15 : serveur DHCP posé et câblé ; M16 : DNS
await page.evaluate(() => window.__api.giveEo(20));
await buildFirst("dhcpsrv");
await page.waitForTimeout(350);
await page.evaluate(() => { window.__LS().mat = 500; window.__api.autolink(); });
await page.evaluate(() => { window.__api.giveEo(60); window.__api.research("dns"); });
await page.waitForTimeout(300);
console.log("DHCP en ligne + techVisible:", await page.evaluate(() => ({ mi: window.__LS().mi, techVisible: !document.querySelector("#tab-tech").hidden })));

// M13 : carte
await page.evaluate(() => { for (const s of document.querySelectorAll(".sheet")) s.hidden = true; });
await page.click("#tab-map");
await page.waitForTimeout(300);
await page.click("#tab-col");

// M14-M17 : baie réseau, surcharge, console, forge
await page.evaluate(() => {
  window.__LS().mat = 300; window.__api.giveEo(60);
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (window.__api.buildableAt(x, y)) { window.__api.build("reseau", x, y); y = 99; break; }
  }
});
await page.evaluate(() => window.__api.turboWin());
for (const t of ["console", "forge"]) {
  await page.evaluate((tt) => {
    window.__LS().mat = 300; window.__api.giveEo(60);
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (window.__api.buildableAt(x, y)) { window.__api.build(tt, x, y); y = 99; break; }
    }
  }, t);
}
await page.waitForTimeout(300);
console.log("après forge (attendu 24):", await page.evaluate(() => window.__LS().mi));

// M18 : drone récolteur posé sur cristaux par tap réel (dézoome si hors vue)
await page.evaluate(() => { window.__LS().mat = 300; window.__api.assemble("recolteur"); });
let cpos = null;
for (let tries = 0; tries < 6 && !cpos; tries++) {
  cpos = await page.evaluate(() =>
    window.__api.crystalsAll().find((c) => c.x > 40 && c.x < 350 && c.y > 130 && c.y < 530) || null);
  if (!cpos) await page.evaluate(() => { const c = window.__api.crystalsAll()[0]; if (c) window.__api.center(c.tx, c.ty); });
  await page.waitForTimeout(200);
}
// nouvelle règle : 1er tap = viser, 2e tap = poser (aperçu fantôme entre les deux)
await page.mouse.click(cpos.x, cpos.y);
await page.waitForTimeout(320);
const vise = await page.evaluate(() => window.__api.placeState());
if (!vise || !vise.valid) throw new Error("le fantôme du drone n'est pas valide: " + JSON.stringify(vise));
await page.mouse.click(cpos.x, cpos.y);
await page.waitForTimeout(300);
console.log("drone posé (viser+confirmer):", await page.evaluate(() => ({ mi: window.__LS().mi, units: window.__LS().units.length })));

// M19 : chasseur contre le parasite (dézoome si hors vue)
await page.evaluate(() => { window.__LS().mat = 300; window.__api.giveEo(30); window.__api.assemble("chasseur"); });
await page.waitForFunction(() => window.__api.mobsPos().length > 0, null, { timeout: 10000 });
let mpos = null;
for (let tries = 0; tries < 6 && !mpos; tries++) {
  mpos = await page.evaluate(() =>
    window.__api.mobsPos().find((m) => m.sx > 20 && m.sx < 350 && m.sy > 145 && m.sy < 640) || null);
  if (!mpos) {
    await page.evaluate(() => { const m = window.__api.mobsPos()[0]; if (m) window.__api.center(m.tx, m.ty); });
    await page.waitForTimeout(250);
  }
}
await page.mouse.click(mpos.sx, mpos.sy);
await page.waitForFunction(() => window.__LS().mi >= 25, null, { timeout: 15000 });
console.log("parasite éliminé:", await page.evaluate(() => ({ mi: window.__LS().mi, mobs: window.__api.mobsPos().length })));

// M20 : expansion via UI (réessaie le tap Source si besoin)
await page.evaluate(() => { window.__LS().mat = 500; });
for (let tries = 0; tries < 4; tries++) {
  await page.evaluate(() => window.__api.center(4, 4));
  await page.waitForTimeout(150);
  const sp = await page.evaluate(() => window.__api.screenOf(4, 4));
  await page.mouse.click(sp.x, sp.y);
  await page.waitForTimeout(350);
  const open = await page.evaluate(() => !document.querySelector("#sh-source").hidden && !!document.querySelector("#src-act button"));
  if (open) break;
  await page.evaluate(() => { for (const sh of document.querySelectorAll(".sheet")) sh.hidden = true; });
  await page.click("#z-in").catch(() => {});
  await page.waitForTimeout(200);
}
await page.click("#src-act button");
await page.waitForTimeout(400);
const done = await page.evaluate(() => ({ mi: window.__LS().mi, ext: window.__LS().ext, missionBoxHidden: document.querySelector("#missions").hidden }));
console.log("fin de chaîne:", JSON.stringify(done));

// ---- QUÊTE ANNEXE ARCHIVES (v5.1 : compartiment de la soute) ----
// le Datacenter existe → le compartiment scellé est ouvrable depuis la Source
const srcPos2 = await page.evaluate(() => window.__api.screenOf(4, 4));
await page.mouse.click(srcPos2.x, srcPos2.y);
await page.waitForTimeout(300);
await page.click("#sh-source .forge-asm"); // 📼 OUVRIR
await page.waitForTimeout(400);
const arch1 = await page.evaluate(() => ({ frags: window.__LS().archives.length, tab: !document.querySelector("#tab-arch").hidden }));
console.log("fragment récupéré dans la soute:", JSON.stringify(arch1));

// assembler le système d'époque
await page.evaluate(() => { window.__LS().mat = 500; window.__api.giveEo(60); });
await page.click("#tab-arch");
await page.waitForTimeout(300);
await page.click("#arch-reader .forge-asm");
await page.waitForTimeout(300);
const okIdx = await page.evaluate(() => window.__api.asmOk());
for (let si = 0; si < okIdx.length; si++) {
  await page.click('.asm-opt[data-slot="' + si + '"][data-opt="' + okIdx[si] + '"]');
  await page.waitForTimeout(120);
}
await page.click("#asm-boot");
await page.waitForTimeout(3600);
const arch2 = await page.evaluate(() => ({ reader: window.__LS().reader }));
console.log("système d'époque en ligne:", JSON.stringify(arch2));

// décrypter le Fragment 001
await page.waitForTimeout(1200);
await page.locator("#arch-list button", { hasText: "DÉCRYPTER" }).click();
await page.waitForTimeout(400);
const arch3 = await page.evaluate(() => ({ dec: window.__LS().archives[0].dec, missionsDone: document.querySelector("#missions").hidden }));
console.log("fragment décrypté (quête annexe finie):", JSON.stringify(arch3));

// Archive visuelle 002 : restauration de l'image de la Terre (vrai puzzle)
await page.waitForTimeout(300);
await page.locator("#arch-list button:not([disabled])", { hasText: "RESTAURER" }).first().click();
await page.waitForTimeout(400);
for (let i = 0; i < 12; i++) {
  const more = await page.evaluate(() => window.__api.rePlaceHint());
  if (!more) break;
  await page.waitForTimeout(70);
}
await page.waitForTimeout(600);
console.log("archive de la Terre restaurée:", await page.evaluate(() => JSON.stringify(window.__LS().restored)));
await page.screenshot({ path: shots + "/re-terre.png" });
await page.waitForTimeout(3600); // retour auto aux quêtes

// Archives 003→008 en chaîne (forêt, ville, fusée, océan, montagne, Lune)
for (const step of [12, 20, 30, 40, 40, 55]) {
  await page.locator("#arch-list button:not([disabled])", { hasText: "RESTAURER" }).first().click();
  await page.waitForTimeout(400);
  for (let i = 0; i < step; i++) {
    const more = await page.evaluate(() => window.__api.rePlaceHint());
    if (!more) break;
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(4200); // révélation + retour aux quêtes
}
console.log("galerie restaurée:", await page.evaluate(() => JSON.stringify(window.__LS().restored)));
// affichage progressif : 2 cartes non restaurées max dans la liste
await page.evaluate(() => { window.__LS().restored.length = 0; openArch(); });
await page.waitForTimeout(200);
console.log("cartes images visibles (attendu 2):", await page.evaluate(() =>
  [...document.querySelectorAll("#arch-list .bcard .nm")].filter((n) => n.textContent.startsWith("Archive 00")).length));
await page.evaluate(() => { window.__LS().restored.push(2, 3, 4, 5, 6, 7, 8); openArch(); });
await page.waitForTimeout(200);

// Atelier de Mémoire : reconstitution du Feu (pièces guidées par l'api)
await page.waitForTimeout(400);
await page.locator("#arch-list button", { hasText: "RECONSTITUER" }).first().click();
await page.waitForTimeout(300);
for (let i = 0; i < 25; i++) {
  const more = await page.evaluate(() => window.__api.atlPlaceHint());
  if (!more) break;
  await page.waitForTimeout(70);
}
await page.waitForTimeout(600);
const atlRes = await page.evaluate(() => ({ memories: window.__LS().memories, mat: Math.round(window.__LS().mat) }));
console.log("mémoire du Feu reconstituée:", JSON.stringify(atlRes));
await page.screenshot({ path: shots + "/atl-reveal.png" });
// Mémoire 002 (la Roue) débloquée en séquence : on la complète aussi
await page.waitForTimeout(3800); // retour auto à la liste des quêtes
await page.locator("#arch-list button", { hasText: "RECONSTITUER" }).first().click();
await page.waitForTimeout(300);
for (let i = 0; i < 25; i++) {
  const more = await page.evaluate(() => window.__api.atlPlaceHint());
  if (!more) break;
  await page.waitForTimeout(70);
}
await page.waitForTimeout(600);
console.log("mémoire de la Roue:", await page.evaluate(() => JSON.stringify(window.__LS().memories)));
await page.screenshot({ path: shots + "/atl-roue.png" });
await page.evaluate(() => { for (const s of document.querySelectorAll(".sheet")) s.hidden = true; });

// persistance
await page.reload();
await page.waitForTimeout(800);
console.log("après reload:", await page.evaluate(() => ({
  introHidden: document.querySelector("#intro").hidden,
  n: window.__LS().buildings.length, units: window.__LS().units.length,
  ext: window.__LS().ext, mi: window.__LS().mi,
  reader: window.__LS().reader, frags: window.__LS().archives.length,
})));
await page.screenshot({ path: shots + "/e2e-final.png" });

// ---- REFONTE DE LA POSE : fantôme, refus, annulation sans perte, déplacement ----
await page.evaluate(() => { for (const s of document.querySelectorAll(".sheet")) s.hidden = true; window.__LS().mat = 3000; });
await page.waitForTimeout(200);
// 1. armer par le bouton 🔨 puis le corps d'une carte
await page.click("#buildbtn"); await page.waitForTimeout(300);
await page.locator("#buildlist .bcard .nm").first().click(); await page.waitForTimeout(350);
const arme = await page.evaluate(() => window.__api.placeState());
console.log("pose armée par 🔨 :", JSON.stringify(arme));
if (!arme) throw new Error("le bouton CONSTRUIRE n'a pas armé la pose");
// 2. viser la Source : refus explicite
console.log("refus sur la Source :", await page.evaluate(() => window.__api.placeAt(4, 4)));
// 3. annuler ne coûte rien
const matAv = await page.evaluate(() => Math.round(window.__LS().mat));
await page.click("#placebar .cancel"); await page.waitForTimeout(250);
const matAp = await page.evaluate(() => Math.round(window.__LS().mat));
console.log("annulation sans perte :", { avant: matAv, apres: matAp, place: await page.evaluate(() => window.__api.placeState()) });
if (matAp < matAv) throw new Error("l'annulation a coûté des matériaux");
// 4. anti-superposition : la case d'un bâtiment existant est refusée
const occupe = await page.evaluate(() => {
  const b = window.__LS().buildings[0];
  return window.__api.posableAt("extracteur", b.x, b.y);
});
console.log("case occupée refusée :", JSON.stringify(occupe));
if (occupe.ok) throw new Error("une case occupée a été acceptée");
// 5. déplacement d'un bâtiment : coût débité, câbles remappés
const dep = await page.evaluate(() => {
  const b = window.__LS().buildings.find((x) => x.t === "extracteur");
  const bx0 = b.x, by0 = b.y; // copie : b est une référence vivante, mutée par la pose
  // pose libre (v14) : les câbles pointent sur l'IDENTIFIANT du bâtiment, plus sur sa case
  const cle = "b" + b.id;
  const liens = window.__LS().links.filter((l) => l.a === cle || l.b === cle).length;
  const cout = window.__api.moveCostOf("extracteur");
  const mat0 = window.__LS().mat;
  window.__api.placeArm("move", "extracteur", "extracteur");
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (window.__api.posableAt("extracteur", x, y).ok) { window.__api.placeAt(x, y); y = 99; break; }
  }
  const ok = window.__api.placeCommit();
  const nb = window.__LS().buildings.find((x) => x.t === "extracteur");
  const ncle = "b" + nb.id;
  return { ok, cout, depense: Math.round(mat0 - window.__LS().mat),
           liensAvant: liens, liensApres: window.__LS().links.filter((l) => l.a === ncle || l.b === ncle).length,
           deplace: nb.x !== bx0 || nb.y !== by0, memeId: nb.id === b.id };
});
console.log("déplacement :", JSON.stringify(dep));
if (!dep.ok || !dep.deplace) throw new Error("le déplacement a échoué");
if (dep.depense !== dep.cout) throw new Error("coût de déplacement non débité");
if (dep.liensApres !== dep.liensAvant) throw new Error("câbles perdus au déplacement");
if (dep.liensAvant < 1) throw new Error("le test de déplacement n'a aucun câble à préserver : il ne prouve rien");

// ---- POSE LIBRE (v14) : positions continues, aimant, empreintes, identifiants ----
const libre = await page.evaluate(() => {
  const S = window.__LS(), api = window.__api, out = {};
  S.mat = 5000;
  // 1. viser à 30 px du centre d'une case : le fantôme flotte ; à 5 px : il s'aimante
  api.placeArm("bld", "switchhub");
  const c = api.screenOfPos(2, 5);
  out.loin = api.placeAtScreen(c.x + 30, c.y + 12, false);
  out.pres = api.placeAtScreen(c.x + 5, c.y + 2, false);
  api.placeCancel();
  // 2. deux petits modules dans la MÊME case ; un troisième entre eux est refusé
  const pose = (x, y) => { api.placeArm("bld", "switchhub"); api.placeAt(x, y); const s = api.placeState(); const ok = s.valid ? api.placeCommit() : false; if (!ok) api.placeCancel(); return { ok, why: s.why }; };
  // on cherche une case libre où trois positions tiennent
  let cell = null;
  for (let y = 0; y < 9 && !cell; y++) for (let x = 0; x < 9; x++)
    if (api.posableAt("switchhub", x - 0.25, y).ok && api.posableAt("switchhub", x + 0.25, y).ok) { cell = { x, y }; break; }
  out.cellule = cell;
  if (cell) {
    out.premier = pose(cell.x - 0.25, cell.y);
    out.second = pose(cell.x + 0.25, cell.y);
    out.entre = api.posableAt("switchhub", cell.x, cell.y);
  }
  // 3. les deux ont des identifiants distincts et des positions continues sauvegardées
  const sw = S.buildings.filter((b) => b.t === "switchhub").slice(-2);
  out.ids = sw.map((b) => b.id);
  out.positions = sw.map((b) => [b.x, b.y]);
  const brut = JSON.parse(localStorage.getItem("ls-save-v4") || "{}");
  out.sauve = { v: brut.v, continues: (brut.buildings || []).some((b) => b.x !== Math.round(b.x)) };
  // 4. le clic sur le bord d'un sprite en position libre ouvre le bon bâtiment
  if (sw[0]) { const p = api.screenOfPos(sw[0].x, sw[0].y); const hit = api.bldAtScreen(p.x + 6, p.y - 4); out.clic = hit && hit.id === sw[0].id; }
  return out;
});
console.log("pose libre :", JSON.stringify(libre));
if (!libre.loin || libre.loin.snap || libre.loin.x === Math.round(libre.loin.x)) throw new Error("à 30 px du centre, la pose devrait être libre (non aimantée)");
if (!libre.pres || !libre.pres.snap) throw new Error("à 5 px du centre, la pose devrait s'aimanter");
if (!libre.cellule) throw new Error("aucune case libre pour le test des deux modules");
if (!libre.premier.ok || !libre.second.ok) throw new Error("deux petits modules devraient tenir dans une même case");
if (libre.entre.ok) throw new Error("un troisième module entre les deux devrait être refusé (chevauchement)");
if (libre.ids.length !== 2 || libre.ids[0] === libre.ids[1]) throw new Error("identifiants de bâtiments non distincts");
if (libre.sauve.v < 14 || !libre.sauve.continues) throw new Error("positions continues absentes de la sauvegarde v14");
if (!libre.clic) throw new Error("le clic sur le bord d'un module en pose libre n'ouvre pas le bon bâtiment");
// 6. la palette doit être atteignable au doigt (touch-action)
console.log("palette défilable :", await page.evaluate(() => getComputedStyle(document.querySelector("#buildlist")).touchAction));

// 7. flotte en orbite : déployer, rappeler, persistance portée par l'unité
const orb = await page.evaluate(() => {
  window.__LS().units.push({ t: "chasseur", x: 4, y: 5, test: 1 }, { t: "chasseur", x: 5, y: 5, test: 1 });
  window.__api.orbOpen();
  const d1 = window.__api.orbDeploy(0, 2), d2 = window.__api.orbDeploy(2, 5);
  const plein = JSON.parse(JSON.stringify(window.__api.orbInfo()));
  const r1 = window.__api.orbRecall(0, 2);
  const apres = JSON.parse(JSON.stringify(window.__api.orbInfo()));
  // nettoyage : les chasseurs de test disparaissent, la vue revient à la colonie
  window.__LS().units = window.__LS().units.filter((u) => !u.test);
  document.querySelector("#tab-col").click();
  return { d1, d2, plein, r1, apres };
});
console.log("flotte en orbite (déploi x2, rappel x1):", JSON.stringify(orb));
if (!orb.d1 || !orb.d2 || !orb.r1 || orb.plein.enOrbite.length !== 2 || orb.apres.enOrbite.length !== 1)
  errors.push("flotte en orbite : déploiement/rappel incohérent " + JSON.stringify(orb));

console.log("ERREURS:", errors.length ? errors : "aucune");
await browser.close();
process.exit(errors.length ? 1 : 0);
