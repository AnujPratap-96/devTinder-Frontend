/**
 * features.js — Phase-1 feature flags (single source of truth on the client).
 * Flip any flag to false to disable that feature and its UI entirely.
 */
export const FEATURES = {
  markdown: true, // code blocks + inline markdown in text messages
  voiceNotes: true, // record & send voice notes
  reactions: true, // emoji reactions on messages
  gifs: true, // Tenor GIF picker in the composer
  chatSearch: true, // search messages + pinned messages panel
  chatPrefs: true, // pin conversation + mute notifications per chat
  callQuality: true, // live call-quality badge
  missedCalls: true, // missed-call cards in the chat
  // [PHASE-2] offline chat: IndexedDB message cache + outgoing queue (no PWA)
  offlineChat: true,
};

/** Tenor GIF picker requires an API key: set VITE_TENOR_API_KEY in .env */
export const isGifEnabled = () => FEATURES.gifs && Boolean(import.meta.env.VITE_TENOR_API_KEY);

export const GIF_TENOR_LIMIT = 12;

export default FEATURES;
