// server/roomManager.js
/**
 * In‑memory room storage.
 * Future work: replace with Redis hash/set for distributed scaling.
 */
const rooms = {};

/**
 * Join a user to a room.
 * @param {string} userId
 * @param {string} roomId
 * @param {string} targetLang
 * @param {WebSocket} socket
 */
export function joinRoom(userId, roomId, targetLang, socket) {
  if (!rooms[roomId]) {
    rooms[roomId] = { users: {} };
  }
  rooms[roomId].users[userId] = { socket, targetLang };
}

/**
 * Remove a user from a room.
 * @param {string} userId
 * @param {string} roomId
 */
export function leaveRoom(userId, roomId) {
  const room = rooms[roomId];
  if (!room) return;
  delete room.users[userId];
  if (Object.keys(room.users).length === 0) {
    delete rooms[roomId];
  }
}

/**
 * Get a room object (read‑only).
 * @param {string} roomId
 * @returns {object|undefined}
 */
export function getRoom(roomId) {
  return rooms[roomId];
}

/**
 * Get a shallow copy of all rooms (for diagnostics / future Redis sync).
 * @returns {object}
 */
export function getAllRooms() {
  return { ...rooms };
}

/**
 * Get list of user IDs in a room.
 * @param {string} roomId
 * @returns {string[]}
 */
export function getRoomUserIds(roomId) {
  const room = rooms[roomId];
  return room ? Object.keys(room.users) : [];
}