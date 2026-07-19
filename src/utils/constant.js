export const BASE_URL = location.hostname === "localhost" ? "http://localhost:3000" : "https://devtinder-1zr8.onrender.com";

import io from "socket.io-client";

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
    const isLocal = location.hostname === "localhost";
    const connectionOptions = {
      withCredentials: true,
      transports: ["websocket"],
      path: isLocal ? "/socket.io" : "/api/socket.io",
    };
    socketInstance = io(isLocal ? BASE_URL : "/", connectionOptions);

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
