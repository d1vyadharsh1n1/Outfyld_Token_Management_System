import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import "./config/redis.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import { setupSocketIO } from "./sockets/queueSocket.js";

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup Socket.IO handlers
setupSocketIO(io);

// Export io for use in other modules
export { io };

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server (with Socket.IO)
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 WebSocket ready at ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();