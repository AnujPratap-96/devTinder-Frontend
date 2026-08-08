/**
 * [PHASE-2] — offline chat resilience exports.
 * Import everything from here so the ChatBox integration stays in one place.
 */
export {
  getPeerKey,
  cacheMessages,
  getCachedMessages,
  queueOutgoing,
  getQueuedOutgoing,
  removeQueuedOutgoing,
  queuedOutgoingCount,
} from "./offlineChat";