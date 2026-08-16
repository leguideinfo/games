/* ---------- orbes ---------- */
function collectOrb(o, auto) {
  orbs = orbs.filter((x) => x !== o);
  S.mat = Math.min(matCap(), S.mat + o.val);
  if (!auto) {
    sfx.collect();
    collectTimes.push(performance.now());
    collectTimes = collectTimes.filter((t) => performance.now() - t < 5000);
    if (collectTimes.length >= 3 && performance.now() > frzCooldownUntil && !frz) startFrenzy();
    // mission 1 : le HUB-01 doit être amorcé — on relance l'Amorçage si besoin
    if (S.mi === 2 && !S.hubBoot && !frz && performance.now() > frzRetryAt) {
      frzRetryAt = performance.now() + 12000;
      startFrenzy();
    }
  }
  S.orbsCollected++;
  if (S.orbsCollected === 1)
    toast("✨ Éclat récolté ! La planète en fait émerger, surtout <b>près des cristaux</b>.");
  if (S.orbsCollected >= 3) missionDone("orbs3");
}

