/* ---------- son ---------- */
$("#mute").onclick = () => {
  muted = !muted;
  try { localStorage.setItem("ls-muted", muted ? "1" : "0"); } catch (e) {}
  $("#mute").textContent = muted ? "∅" : "♪";
  audioInit();
};
$("#mute").textContent = muted ? "∅" : "♪";

