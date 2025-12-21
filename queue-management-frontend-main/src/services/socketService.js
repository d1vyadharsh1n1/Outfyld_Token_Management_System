import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Connection event handlers
socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from WebSocket server");
});

socket.on("connect_error", (error) => {
  console.error("❌ WebSocket connection error:", error.message);
});

export default socket;

