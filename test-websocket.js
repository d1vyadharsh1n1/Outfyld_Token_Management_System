// WebSocket Test Client
// Run with: node test-websocket.js

import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

console.log("🧪 Starting WebSocket test...\n");

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
  
  // Join kiosk room
  socket.emit("join:kiosk");
  console.log("📺 Joined kiosk room\n");
  
  console.log("⏳ Waiting for events...");
  console.log("💡 Generate a token or call next token to see events\n");
});

socket.on("token:called", (data) => {
  console.log("📢 TOKEN CALLED EVENT:");
  console.log("   Counter ID:", data.counterId);
  console.log("   Token Number:", data.token.tokenNumber);
  console.log("   Service:", data.token.service);
  console.log("   Timestamp:", data.timestamp);
  console.log("");
});

socket.on("token:generated", (data) => {
  console.log("📢 TOKEN GENERATED EVENT:");
  console.log("   Token Number:", data.token.tokenNumber);
  console.log("   Service:", data.token.service);
  console.log("   Timestamp:", data.timestamp);
  console.log("");
});

socket.on("queue:update", (data) => {
  console.log("📢 QUEUE UPDATE EVENT:");
  console.log("   Counter ID:", data.counterId);
  console.log("   Current Token:", data.currentToken);
  console.log("   Action:", data.action);
  console.log("");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
  console.log("💡 Make sure the server is running on port 5000");
});

// Keep process alive
process.on("SIGINT", () => {
  console.log("\n👋 Closing connection...");
  socket.disconnect();
  process.exit(0);
});

console.log("Press Ctrl+C to exit\n");

