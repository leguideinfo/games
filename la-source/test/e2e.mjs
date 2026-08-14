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

// M0 : récolter 3 éclats par taps réels (zone sûre, hors HUD/onglets)
let collected = 0;
for (let tries = 0; tries < 20 && collected < 3; tries++) {
  await page.waitForFunction(() => window.__api.orbsPos().length > 0, null, { timeout: 15000 });
  const o = await page.evaluate(() =>
    window.__api.orbsPos().find((p) => p.sx > 20 && p.sx < 340 && p.sy > 145 && p.sy < 690) || null);
  if (!o) {
    await page.evaluate(() => { const f = window.__api.orbsPos()[0]; if (f) window.__api.center(f.tx, f.ty); });
    await page.waitForTimeout(1200); continue;
  }
  await page.mouse.click(o.sx, o.sy);
  await page.waitForTimeout(250);
  collected = await page.evaluate(() => window.__LS().orbsCollected);
}
console.log("après 3 éclats, mission:", await page.evaluate(() => window.__LS().mi));
// si la Pluie d'éclats s'est déclenchée (3 récoltes rapides), on la laisse passer
await page.waitForTimeout(700);
await page.waitForFunction(() => document.querySelector("#frenzy").hidden, null, { timeout: 15000 });

// M1 : poser le Coffret réseau (HUB-01) — via api (le menu exige le hub amorcé)
await page.evaluate(() => {
  for (let y = 3; y <= 6; y++) for (let x = 3; x <= 6; x++)
    if (window.__api.buildableAt(x, y)) { window.__api.build("coffret", x, y); return; }
});
await page.waitForTimeout(500);
console.log("coffret posé (attendu mi 2 + lien src):", await page.evaluate(() =>
  ({ mi: window.__LS().mi, links: window.__LS().links.length })));
// l'Amorçage non réussi peut se relancer : on le laisse se refermer
await page.waitForTimeout(1000);
await page.waitForFunction(() => document.querySelector("#frenzy").hidden, null, { timeout: 30000 });

// M2 : envoyer un drone ouvrier de la soute sur un amas de cristaux (tap réel)
let cpos0 = null;
for (let tries = 0; tries < 6 && !cpos0; tries++) {
  cpos0 = await page.evaluate(() =>
    window.__api.crystalsAll().find((c) => c.x > 40 && c.x < 350 && c.y > 140 && c.y < 530) || null);
  if (!cpos0) await page.evaluate(() => { const c = window.__api.crystalsAll()[0]; if (c) window.__api.center(c.tx, c.ty); });
  await page.waitForTimeout(200);
}
await page.mouse.click(cpos0.x, cpos0.y);
await page.waitForTimeout(400);
console.log("drone de soute envoyé (attendu mi 3, dr 1):", await page.evaluate(() =>
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
await page.evaluate((u) => window.__api.crysSet(u.x, u.y, 0.4), u0);
await page.waitForTimeout(1200);
console.log("gisement épuisé (drone en soute, case sable):", await page.evaluate((u) => ({
  dr: window.__LS().dr, units: window.__LS().units.length,
  kind: window.__api.tileKind(u.x, u.y),
}), u0));
// on renvoie le second drone de soute sur un autre gisement (tap réel).
// Coordonnées recalculées juste avant chaque tap : la caméra peut glisser.
for (let tries = 0; tries < 6; tries++) {
  const cpos1 = await page.evaluate(() =>
    window.__api.crystalsAll().find((c) => c.x > 40 && c.x < 350 && c.y > 140 && c.y < 530) || null);
  if (!cpos1) {
    await page.evaluate(() => { const c = window.__api.crystalsAll()[0]; if (c) window.__api.center(c.tx, c.ty); });
    await page.waitForTimeout(250); continue;
  }
  await page.mouse.click(cpos1.x, cpos1.y);
  await page.waitForTimeout(350);
  if (await page.evaluate(() => window.__LS().units.length > 0)) break;
}
console.log("2e drone envoyé (dr 1, 1 unité):", await page.evaluate(() =>
  ({ dr: window.__LS().dr, units: window.__LS().units.length })));

// respawn : on force l'expiration du gisement épuisé -> il se reforme, plein
await page.evaluate((u) => { window.__LS().crxDead[u.x + "," + u.y] = Date.now() - 9e6; }, u0);
await page.waitForTimeout(1600);
console.log("gisement reformé (kind crystal, stock plein):", await page.evaluate((u) => ({
  kind: window.__api.tileKind(u.x, u.y),
  ...window.__api.crysAt(u.x, u.y),
}), u0));

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
// M4-M10 : entrepôt → 2e extracteur → centrale (puis NIV 2) → ferme → 12 Eo → datacenter
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
console.log("réseau câblé (attendu mi 10):", await page.evaluate(() => ({ mi: window.__LS().mi, ...window.__api.netInfo() })));
await buildFirst("switchhub");
await page.waitForTimeout(400);
// le Switch posé doit être câblé pour terminer « raccorde tout »
await page.evaluate(() => { window.__LS().mat = 500; window.__api.autolink(); });
await page.waitForTimeout(500);
await page.evaluate(() => window.__api.simDone());
await page.waitForTimeout(400);

// M12-M14 : ferme → 12 Eo → datacenter
await buildFirst("ferme");
await page.waitForTimeout(350);
await page.evaluate(() => window.__api.giveEo(15));
await page.waitForTimeout(500);
await buildFirst("datacenter");
await page.waitForTimeout(400);
console.log("après la séquence ressources (attendu mi 16):", await page.evaluate(() => ({ mi: window.__LS().mi })));

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
console.log("après forge (attendu 23):", await page.evaluate(() => window.__LS().mi));

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
  const cle = b.x + "," + b.y;
  const liens = window.__LS().links.filter((l) => l.a === cle || l.b === cle).length;
  const cout = window.__api.moveCostOf("extracteur");
  const mat0 = window.__LS().mat;
  window.__api.placeArm("move", "extracteur", "extracteur");
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (window.__api.posableAt("extracteur", x, y).ok) { window.__api.placeAt(x, y); y = 99; break; }
  }
  const ok = window.__api.placeCommit();
  const nb = window.__LS().buildings.find((x) => x.t === "extracteur");
  const ncle = nb.x + "," + nb.y;
  return { ok, cout, depense: Math.round(mat0 - window.__LS().mat),
           liensAvant: liens, liensApres: window.__LS().links.filter((l) => l.a === ncle || l.b === ncle).length,
           deplace: nb.x !== bx0 || nb.y !== by0 };
});
console.log("déplacement :", JSON.stringify(dep));
if (!dep.ok || !dep.deplace) throw new Error("le déplacement a échoué");
if (dep.depense !== dep.cout) throw new Error("coût de déplacement non débité");
if (dep.liensApres !== dep.liensAvant) throw new Error("câbles perdus au déplacement");
// 6. la palette doit être atteignable au doigt (touch-action)
console.log("palette défilable :", await page.evaluate(() => getComputedStyle(document.querySelector("#buildlist")).touchAction));

console.log("ERREURS:", errors.length ? errors : "aucune");
await browser.close();
process.exit(errors.length ? 1 : 0);
