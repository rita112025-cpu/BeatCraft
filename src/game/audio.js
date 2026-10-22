// Web Audio sound effects. Every call fails silently when audio is unavailable.
const JUDGEMENT_TONES = {
  perfect: { type: "sine", ratio: 1.5, decay: 0.35 },
  good: { type: "triangle", ratio: 1, decay: 0.22 },
  notYours: { type: "sawtooth", ratio: 0.4, decay: 0.22 },
};
const DEFAULT_TONE = { type: "square", ratio: 0.6, decay: 0.22 };

export function createSfx() {
  let context = null;

  function audioContext() {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") context.resume();
    return context;
  }

  function tone({ type = "sine", frequency, volume, floor, decay, duration }) {
    const ctx = audioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(floor, ctx.currentTime + decay);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  return {
    // Browsers only allow audio after a user gesture, so call this from one.
    unlock() {
      try {
        audioContext();
      } catch {}
    },
    judgement(baseFrequency, quality) {
      const { type, ratio, decay } = JUDGEMENT_TONES[quality] ?? DEFAULT_TONE;
      try {
        tone({ type, frequency: baseFrequency * ratio, volume: 0.22, floor: 0.01, decay, duration: 0.32 });
      } catch {}
    },
    beat(isDemon) {
      try {
        tone({ frequency: isDemon ? 140 : 110, volume: isDemon ? 0.09 : 0.06, floor: 0.001, decay: 0.15, duration: 0.16 });
      } catch {}
    },
  };
}
