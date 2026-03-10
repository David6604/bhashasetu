// server/broadcastManager.js
/**
 * In‑memory broadcast subscription storage.
 * Future work: replace with Redis sorted sets or pub/sub.
 */
const subscribers = {};

/**
 * Subscribe a user to global broadcast for a specific target language.
 * @param {string} userId
 * @param {string} targetLang
 * @param {WebSocket} socket
 */
export function subscribe(userId, targetLang, socket) {
  if (!subscribers[targetLang]) {
    subscribers[targetLang] = {};
  }
  subscribers[targetLang][userId] = socket;
}

/**
 * Unsubscribe a user from any broadcast channel.
 * @param {string} userId
 */
export function unsubscribe(userId) {
  for (const lang in subscribers) {
    if (subscribers[lang][userId]) {
      delete subscribers[lang][userId];
      if (Object.keys(subscribers[lang]).length === 0) {
        delete subscribers[lang];
      }
      break;
    }
  }
}

/**
 * Get a snapshot of all current subscribers grouped by target language.
 * @returns {Object} { targetLang: [{ userId, socket }, ...] }
 */
export function getAll() {
  const snapshot = {};
  for (const [lang, users] of Object.entries(subscribers)) {
    snapshot[lang] = Object.entries(users).map(([uid, socket]) => ({
      userId: uid,
      socket,
    }));
  }
  return snapshot;
}

/**
 * Get list of subscriber sockets for a specific language.
 * @param {string} targetLang
 * @returns {Array<{userId:string, socket:WebSocket}>}
 */
export function getSubscribersByLang(targetLang) {
  const users = subscribers[targetLang] || {};
  return Object.entries(users).map(([uid, socket]) => ({
    userId: uid,
    socket,
  }));
}