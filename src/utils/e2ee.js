// End-to-end encryption for 1:1 chats.
//
// Model: each device generates an ECDH P-256 keypair. The PUBLIC key is sent
// to the server; the PRIVATE key never leaves the browser. For every
// conversation both participants derive the SAME AES-256-GCM key from
// ECDH(selfPrivate, peerPublic) -> HKDF-SHA256. Messages are encrypted in the
// browser before they ever reach the socket/DB, so the server only ever stores
// and relays ciphertext — it cannot read message contents.
//
// Key-at-rest: the private key is stored device-bound in IndexedDB (unwrapped).
// This keeps the platform fully blind and survives page refreshes without
// re-prompting the user. Trade-off: like any client-side secret, it is
// reachable by JavaScript on the page (e.g. an XSS bug), so it should be paired
// with a strict CSP. The server never receives the private key.

import axios from "axios";
import { BASE_URL } from "./constant";

const DB_NAME = "devtinder-e2ee";
const STORE = "keys";
const KEY_VERSION = 1;
const HKDF_INFO = new TextEncoder().encode("devtinder-e2ee-v1");

// ── module state ────────────────────────────────────────────────────────────
let selfPrivateKey = null; // CryptoKey
let selfPublicKeyB64 = null; // string (spki, base64)
let selfUserId = null;
const peerPubCache = new Map(); // userId -> string (spki, base64)
const peerPubCryptoCache = new Map(); // userId -> CryptoKey
const convoCache = new Map(); // userId -> AES-GCM CryptoKey

// ── small helpers ────────────────────────────────────────────────────────────
const bufToB64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const b64ToBuf = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
};

const subtle = () => {
  if (!window.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable (needs https or localhost)");
  }
  return window.crypto.subtle;
};

// ── IndexedDB (tiny promise wrapper) ─────────────────────────────────────────
const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "userId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const idbGet = async (userId) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(userId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
};

const idbPut = async (record) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// ── public key exchange with server ───────────────────────────────────────────
export const uploadPublicKey = async (publicKeyB64) => {
  await axios.post(
    `${BASE_URL}/user/public-key`,
    { publicKey: publicKeyB64, keyVersion: KEY_VERSION },
    { withCredentials: true }
  );
};

export const fetchPeerPublicKey = async (userId) => {
  if (peerPubCache.has(userId)) return peerPubCache.get(userId);
  try {
    const { data } = await axios.get(`${BASE_URL}/user/public-key/${userId}`, {
      withCredentials: true,
    });
    const pk = data?.data?.publicKey ?? null;
    peerPubCache.set(userId, pk);
    return pk;
  } catch {
    peerPubCache.set(userId, null);
    return null;
  }
};

// ── initialize / unlock keys for the current user ────────────────────────────
// Returns `true` only when E2E is usable. NEVER throws — message loading must
// not depend on crypto succeeding. If Web Crypto is unavailable (non-secure
// context, e.g. the app served over a plain-HTTP LAN IP) or IndexedDB is
// blocked (private mode), we degrade to plaintext and let callers continue.
export const ensureCrypto = async ({ userId } = {}) => {
  if (selfUserId === userId && selfPrivateKey && window.crypto?.subtle) return true;
  if (!userId) return false;
  if (!window.crypto?.subtle) return false;

  selfUserId = userId;
  try {
    const record = await idbGet(userId).catch(() => null);

    if (record?.raw) {
      selfPrivateKey = await subtle().importKey(
        "pkcs8",
        b64ToBuf(record.raw),
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveBits"]
      );
      selfPublicKeyB64 = record.publicKeyB64 ?? null;
    }

    if (!selfPrivateKey) {
      const pair = await subtle().generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        false,
        ["deriveBits"]
      );
      selfPrivateKey = pair.privateKey;
      const spki = await subtle().exportKey("spki", pair.publicKey);
      selfPublicKeyB64 = bufToB64(spki);
      const pkcs8 = await subtle().exportKey("pkcs8", pair.privateKey);
      // IndexedDB may be unavailable/blocked — key just stays in memory for
      // this session; encryption still works for the duration of the page.
      try {
        await idbPut({ userId, publicKeyB64: selfPublicKeyB64, raw: bufToB64(pkcs8) });
      } catch {
        /* non-fatal */
      }
      try {
        await uploadPublicKey(selfPublicKeyB64);
      } catch {
        /* server unreachable; public key uploads on next init */
      }
    }

    peerPubCache.set(userId, selfPublicKeyB64);
    return true;
  } catch {
    selfPrivateKey = null;
    selfPublicKeyB64 = null;
    return false;
  }
};

export const isCryptoReady = () =>
  Boolean(selfPrivateKey) && Boolean(window.crypto?.subtle);

// ── conversation key derivation ───────────────────────────────────────────────
const getConversationKey = async (peerId) => {
  if (convoCache.has(peerId)) return convoCache.get(peerId);
  if (!selfPrivateKey) throw new Error("E2EE not initialized");

  const peerB64 = await fetchPeerPublicKey(peerId);
  if (!peerB64) throw new Error("Peer has no encryption key yet");

  let peerPubCrypto = peerPubCryptoCache.get(peerId);
  if (!peerPubCrypto) {
    peerPubCrypto = await subtle().importKey(
      "spki",
      b64ToBuf(peerB64),
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    );
    peerPubCryptoCache.set(peerId, peerPubCrypto);
  }

  const sharedBits = await subtle().deriveBits(
    { name: "ECDH", public: peerPubCrypto },
    selfPrivateKey,
    256
  );

  const hkdfBase = await subtle().importKey("raw", sharedBits, { name: "HKDF" }, false, ["deriveKey"]);
  const convKey = await subtle().deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: HKDF_INFO, info: HKDF_INFO },
    hkdfBase,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  convoCache.set(peerId, convKey);
  return convKey;
};

// ── encrypt / decrypt ─────────────────────────────────────────────────────────
export const encryptMessage = async (peerId, plaintext) => {
  const key = await getConversationKey(peerId);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle().encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const merged = new Uint8Array(iv.length + ct.byteLength);
  merged.set(iv, 0);
  merged.set(new Uint8Array(ct), iv.length);
  return bufToB64(merged.buffer);
};

export const decryptMessage = async (peerId, stored) => {
  const key = await getConversationKey(peerId);
  const merged = new Uint8Array(b64ToBuf(stored));
  const iv = merged.slice(0, 12);
  const ct = merged.slice(12);
  const plain = await subtle().decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plain);
};

export const canEncryptWith = async (peerId) => {
  if (!isCryptoReady()) return false;
  const pk = await fetchPeerPublicKey(peerId);
  return Boolean(pk);
};
