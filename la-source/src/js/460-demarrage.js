/* ---------- démarrage ---------- */
resize();
fitCam();
offlineGains();
skipSatisfied(); // sauvegardes migrées : l'acquis ne se rejoue pas, en silence
if (S.techs.includes("dns")) unlockMap();
missionUI();
if (!introOn) $("#intro").hidden = true;
else { setScene(0); requestAnimationFrame(drawIntro); }
document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });
requestAnimationFrame(frame);
