// Instagram-style incoming-call ringtone, generated with Web Audio so no
// audio asset is required. Browsers may block audio without a user gesture —
// the module silently no-ops in that case (the incoming-call UI still shows).

let audioCtx = null;
let ringTimer = null;

export const startRingtone = () => {
  stopRingtone();
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const playTone = (frequency, delay, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime + delay);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime + delay + duration * 0.6);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delay + duration);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration + 0.05);
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