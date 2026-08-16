/* ---------- audio ---------- */
let actx = null, muted = false;
try { muted = localStorage.getItem("ls-muted") === "1"; } catch (e) {}
function audioInit() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (actx && actx.state === "suspended") actx.resume();
}
function beep(f, d, ty, v, dl) {
  if (muted || !actx) return;
  const t = actx.currentTime + (dl || 0);
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = ty || "sine"; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(v || 0.035, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d);
}
const sfx = {
  collect: () => beep(880, 0.09, "sine", 0.04),
  build: () => { beep(320, 0.12, "square", 0.04); beep(480, 0.14, "square", 0.04, 0.09); },
  up: () => { beep(523, 0.09, "square", 0.04); beep(784, 0.13, "square", 0.04, 0.08); },
  deny: () => beep(140, 0.18, "sawtooth", 0.05),
  tech: () => { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.11, "sine", 0.045, i * 0.09)); },
  star: () => beep(1046, 0.1, "square", 0.045),
  mission: () => { beep(659, 0.1, "sine", 0.05); beep(988, 0.16, "sine", 0.05, 0.09); },
  ui: () => beep(500, 0.05, "sine", 0.02),
  fireMob: () => { beep(700, 0.1, "sawtooth", 0.045); beep(950, 0.12, "sawtooth", 0.04, 0.09); },
};

