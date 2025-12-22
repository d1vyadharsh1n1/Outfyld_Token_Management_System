// WebSocket handlers for real-time queue updates

let ioInstance = null;

export const setupSocketIO = (io) => {
  ioInstance = io;
  console.log("✅ Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join kiosk room for public display
    socket.on("join:kiosk", () => {
      socket.join("kiosk");
      console.log(`📺 Client ${socket.id} joined kiosk room`);
    });

    // Join admin room for admin dashboard
    socket.on("join:admin", () => {
      socket.join("admin");
      console.log(`👤 Client ${socket.id} joined admin room`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Broadcast functions for different events
export const broadcastToKiosk = (event, data) => {
  if (ioInstance) {
    ioInstance.to("kiosk").emit(event, data);
    console.log(`📢 Broadcasted to kiosk: ${event}`, data);
  }
};

export const broadcastToAdmin = (event, data) => {
  if (ioInstance) {
    ioInstance.to("admin").emit(event, data);
    console.log(`📢 Broadcasted to admin: ${event}`, data);
  }
};

export const broadcastToAll = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
    console.log(`📢 Broadcasted to all: ${event}`, data);
  }
};

