// Instagram-style incoming-call ringtone, generated with Web Audio so no
// audio asset is required. Browsers block audio until the user interacts with
// the page at least once — we unlock the AudioContext on the first gesture so
// incoming calls actually ring instead of silently no-opping.

let audioCtx = null;
let ringTimer = null;

const getContext = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
};

const resumeContext = async () => {
  const ctx = getContext();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  return ctx.state === "running";
};

// First pointer/key/touch interaction on the page unlocks audio for good.
const unlockOnGesture = () => {
  resumeContext();
  window.removeEventListener("pointerdown", unlockOnGesture);
  window.removeEventListener("keydown", unlockOnGesture);
  window.removeEventListener("touchstart", unlockOnGesture);
};
window.addEventListener("pointerdown", unlockOnGesture);
window.addEventListener("keydown", unlockOnGesture);
window.addEventListener("touchstart", unlockOnGesture);

export const startRingtone = () => {
  stopRingtone();
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const playTone = (frequency, delay, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay + duration * 0.6);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    };

    const ring = () => {
      playTone(880, 0, 0.4);
      playTone(1180, 0.45, 0.4);
    };

    ring();
    ringTimer = setInterval(ring, 1500);
  } catch {
    // audio unavailable — ignore
  }
};

export const stopRingtone = () => {
  if (ringTimer) {
    clearInterval(ringTimer);
    ringTimer = null;
  }
  if (audioCtx) {
    try {
      audioCtx.close();
    } catch {
      // already closed
    }
  }
  audioCtx = null;
};