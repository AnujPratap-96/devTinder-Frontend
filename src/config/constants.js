import io from "socket.io-client";

export const BASE_URL = window.location.hostname === "localhost"
  ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_PROD;

let socketInstance;
let registeredUserId;

/**
 * Disconnect the socket gracefully when the user closes the tab/window.
 * This fires the 'disconnect' event on the server side immediately,
 * so the user's online status is cleared without waiting for the TCP timeout.
 */
const handleBeforeUnload = () => {
  if (socketInstance?.connected) {
    socketInstance.disconnect();
  }
};

window.addEventListener("beforeunload", handleBeforeUnload);

export const createSocketConnection = (userId) => {
  if (userId) {
    registeredUserId = userId;
  }

  if (!socketInstance) {
    const connectionOptions = {
      withCredentials: true,
      transports: ["websocket"],
      path: "/socket.io",
      // Render free tier sleeps idle instances — keep retrying until the
      // instance wakes up, so online status and realtime events recover.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    };
    socketInstance = io(BASE_URL, connectionOptions);

    // Re-register the session on every (re)connect so the server keeps
    // tracking this user as online and can deliver real-time events.
    socketInstance.on("connect", () => {
      if (registeredUserId) {
        socketInstance.emit("session:register", { userId: registeredUserId });
      }
    });
  }

  if (userId) {
    socketInstance.emit("session:register", { userId });
  }

  return socketInstance;
};

export const closeSocketConnection = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = undefined;
};