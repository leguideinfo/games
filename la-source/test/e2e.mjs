// Test E2E de La Source — parcours complet des 17 missions par interactions réelles.
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
  if (!o) { await page.waitForTimeout(1200); continue; }
  await page.mouse.click(o.sx, o.sy);
  await page.waitForTimeout(250);
  collected = await page.evaluate(() => window.__LS().orbsCollected);
}
console.log("après 3 éclats, mission:", await page.evaluate(() => window.__LS().mi));
// si la Pluie d'éclats s'est déclenchée (3 récoltes rapides), on la laisse passer
await page.waitForTimeout(700);
await page.waitForFunction(() => document.querySelector("#frenzy").hidden, null, { timeout: 12000 });

// M1 : menu construire = extracteur seul, construction par tap réel
const target = await page.evaluate(() => {
  for (let y = 2; y <= 6; y++) for (let x = 2; x <= 6; x++) {
    if (window.__api.buildableAt(x, y)) {
      const p = window.__api.screenOf(x, y);
      if (p.x > 30 && p.x < 360 && p.y > 120 && p.y < 540) return { sx: p.x, sy: p.y };
    }
  }
  return null;
});
await page.mouse.click(target.sx, target.sy);
await page.waitForTimeout(300);
const menu1 = await page.evaluate(() => [...document.querySelectorAll("#buildlist .bcard .nm")].map((n) => n.textContent));
console.log("menu à M1:", JSON.stringify(menu1));
await page.locator("#buildlist .bcard button").first().click();
await page.waitForTimeout(300);

// M2 : amélioration via UI
const bpos = await page.evaluate(() => {
  const b = window.__LS().buildings[0];
  return window.__api.screenOf(b.x, b.y);
});
await page.mouse.click(bpos.x, bpos.y - 20);
await page.waitForTimeout(300);
await page.click("#bl-up");
await page.waitForTimeout(300);
console.log("mission après amélioration:", await page.evaluate(() => window.__LS().mi));

// M3-M6 : entrepôt, centrale, ferme, datacenter
await page.evaluate(() => {
  for (const t of ["entrepot", "centrale", "ferme", "datacenter"]) {
    window.__LS().mat = 300;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (window.__api.buildableAt(x, y)) { window.__api.build(t, x, y); y = 99; break; }
    }
  }
});
await page.waitForTimeout(300);
console.log("après M6:", await page.evaluate(() => ({ mi: window.__LS().mi, techVisible: !document.querySelector("#tab-tech").hidden })));

// M7-M8 : DHCP puis DNS
await page.evaluate(() => { window.__api.giveEo(60); window.__api.research("dhcp"); });
await page.evaluate(() => { window.__api.giveEo(60); window.__api.research("dns"); });
await page.waitForTimeout(300);

// M9 : carte
await page.evaluate(() => { for (const s of document.querySelectorAll(".sheet")) s.hidden = true; });
await page.click("#tab-map");
await page.waitForTimeout(300);
await page.click("#tab-col");

// M10-M13 : baie réseau, surcharge, console, forge
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
console.log("après forge:", await page.evaluate(() => window.__LS().mi));

// M14 : drone récolteur posé sur cristaux par tap réel (dézoome si hors vue)
await page.evaluate(() => { window.__LS().mat = 300; window.__api.assemble("recolteur"); });
let cpos = null;
for (let tries = 0; tries < 4 && !cpos; tries++) {
  cpos = await page.evaluate(() =>
    window.__api.crystalsAll().find((c) => c.x > 40 && c.x < 350 && c.y > 130 && c.y < 530) || null);
  if (!cpos) await page.click("#z-out");
  await page.waitForTimeout(150);
}
await page.mouse.click(cpos.x, cpos.y);
await page.waitForTimeout(300);
console.log("drone posé:", await page.evaluate(() => ({ mi: window.__LS().mi, units: window.__LS().units.length })));

// M15 : chasseur contre le parasite (dézoome si hors vue)
await page.evaluate(() => { window.__LS().mat = 300; window.__api.giveEo(30); window.__api.assemble("chasseur"); });
await page.waitForFunction(() => window.__api.mobsPos().length > 0, null, { timeout: 10000 });
let mpos = null;
for (let tries = 0; tries < 6 && !mpos; tries++) {
  mpos = await page.evaluate(() =>
    window.__api.mobsPos().find((m) => m.sx > 20 && m.sx < 350 && m.sy > 145 && m.sy < 640) || null);
  if (!mpos) { await page.click("#z-out"); await page.waitForTimeout(200); }
}
await page.mouse.click(mpos.sx, mpos.sy);
await page.waitForFunction(() => window.__LS().mi >= 16, null, { timeout: 15000 });
console.log("parasite éliminé:", await page.evaluate(() => ({ mi: window.__LS().mi, mobs: window.__api.mobsPos().length })));

// M16 : expansion via UI (réessaie le tap Source si besoin)
await page.evaluate(() => { window.__LS().mat = 500; });
for (let tries = 0; tries < 4; tries++) {
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

console.log("ERREURS:", errors.length ? errors : "aucune");
await browser.close();
process.exit(errors.length ? 1 : 0);
