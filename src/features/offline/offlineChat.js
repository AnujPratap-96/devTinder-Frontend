/**
 * [PHASE-2] — Offline chat resilience: IndexedDB display cache + outgoing queue.
 *
 * Zero external dependencies. Every call is defensive: if IndexedDB is
 * unavailable or a request fails, it resolves to a safe fallback so the live
 * chat keeps working untouched.
 *
 * To fully revert Phase 2-lite:
 *   1. delete this folder (offlineChat.js + index.js),
 *   2. remove the `// [PHASE-2]` import + every `// [PHASE-2]` block in ChatBox.jsx,
 *   3. delete the `offlineChat` entry from src/config/features.js.
 */

const DB_NAME = "devtinder-offline";
const DB_VERSION = 1;
const STORE_MESSAGES = "messages";
const STORE_OUTBOX = "outbox";
const MAX_MESSAGES_PER_CHAT = 50;

let dbPromise = null;

const isSupported = () =>
  typeof indexedDB !== "undefined" && typeof navigator !== "undefined";

const openDB = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
          const store = db.createObjectStore(STORE_MESSAGES, { keyPath: "id" });
          store.createIndex("peerKey", "peerKey", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
          const store = db.createObjectStore(STORE_OUTBOX, { keyPath: "id" });
          store.createIndex("userId", "userId", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("IndexedDB blocked"));
    } catch (err) {
      reject(err);
    }
  });
  return dbPromise;
};

const run = (storeName, mode, action) =>
  openDB()
    .then((db) => db.transaction(storeName, mode).objectStore(storeName))
    .then((store) =>
      new Promise((resolve, reject) => {
        const request = action(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    );

const put = (storeName, value) => run(storeName, "readwrite", (s) => s.put(value));
const del = (storeName, id) => run(storeName, "readwrite", (s) => s.delete(id));
const getAllByIndex = (storeName, indexName, value) =>
  run(storeName, "readonly", (s) => s.index(indexName).getAll(value));

const safe = async (fallback, fn) => {
  try {
    if (!isSupported()) return fallback;
    return await fn();
  } catch {
    return fallback;
  }
};

/** Namespace for a 1:1 chat: `${userId}:${targetUserId}`. */
export const getPeerKey = ({ userId, targetUserId }) => `${userId}:${targetUserId}`;

const messageId = (peerKey, msg) => `${peerKey}|${msg.clientMessageId || msg._id}`;

/**
 * Write-through display cache. Stores display-ready (already decrypted)
 * messages per chat, capped to the most recent MAX_MESSAGES_PER_CHAT.
 */
export const cacheMessages = (peerKey, messages = []) =>
  safe(0, async () => {
    if (!messages.length) return 0;
    for (const msg of messages) {
      await put(STORE_MESSAGES, { id: messageId(peerKey, msg), peerKey, message: msg });
    }
    const all = await getAllByIndex(STORE_MESSAGES, "peerKey", peerKey);
    if (all.length > MAX_MESSAGES_PER_CHAT) {
      const excess = all
        .sort((a, b) => new Date(b.message.createdAt) - new Date(a.message.createdAt))
        .slice(MAX_MESSAGES_PER_CHAT);
      await Promise.all(excess.map((row) => del(STORE_MESSAGES, row.id)));
    }
    return messages.length;
  });

/** Read the on-disk display cache for a chat (empty array when offline/empty). */
export const getCachedMessages = (peerKey) =>
  safe([], async () => {
    const rows = await getAllByIndex(STORE_MESSAGES, "peerKey", peerKey);
    return rows
      .map((row) => row.message)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  });

/**
 * Queue an outgoing message. `entry.payload` is the exact wire payload for the
 * socket `sendMessage` event (already encrypted if applicable) so a reconnect
 * flush can re-emit it verbatim; `entry.plaintext` is kept for display.
 */
export const queueOutgoing = (userId, entry) =>
  safe(undefined, async () => {
    const clientMessageId = entry?.payload?.clientMessageId;
    if (!clientMessageId) return;
    await put(STORE_OUTBOX, { id: `${userId}|${clientMessageId}`, userId, entry });
  });

/** All queued outgoing messages for a user, oldest first. */
export const getQueuedOutgoing = (userId) =>
  safe([], async () => {
    const rows = await getAllByIndex(STORE_OUTBOX, "userId", userId);
    return rows
      .map((row) => ({
        clientMessageId: String(row.entry.payload.clientMessageId),
        entry: row.entry,
      }))
      .sort((a, b) => new Date(a.entry.createdAt) - new Date(b.entry.createdAt));
  });

/** Remove a queued message once the server confirms it (ack / created). */
export const removeQueuedOutgoing = (userId, clientMessageId) =>
  safe(undefined, async () => {
    if (!clientMessageId) return;
    await del(STORE_OUTBOX, `${userId}|${clientMessageId}`);
  });

/** Number of messages still waiting in the outbox. */
export const queuedOutgoingCount = (userId) =>
  safe(0, async () => {
    const rows = await getAllByIndex(STORE_OUTBOX, "userId", userId);
    return rows.length;
  });