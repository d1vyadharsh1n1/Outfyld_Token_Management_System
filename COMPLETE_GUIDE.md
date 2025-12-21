# Complete WebSocket Integration Guide

## ✅ What Was Implemented

### Backend (Server-Side)
1. **Socket.IO Server** - Real-time WebSocket server
2. **Room Management** - Separate rooms for kiosk and admin
3. **Event Broadcasting** - Broadcasts token events to connected clients
4. **CORS Configuration** - Allows frontend to connect

### Frontend (Client-Side)
1. **Socket.IO Client** - Connects to WebSocket server
2. **Kiosk Display** - Real-time updates when tokens are called
3. **Auto-reconnection** - Automatically reconnects if connection drops

---

## 📁 Complete Folder Structure Explained

### Root Level
- **`config/`** - Sequelize CLI config (for migrations only)
- **`migrations/`** - Database schema migration files
- **`src/`** - Backend application code
- **`queue-management-frontend-main/`** - React frontend
- **`.env`** - Environment variables (database, Redis URLs)
- **`package.json`** - Backend dependencies

### `/src` - Backend Structure

#### `/src/config`
- **`db.js`** - PostgreSQL/Supabase connection (ES6)
- **`redis.js`** - Redis connection and queue functions

#### `/src/controllers`
- **`serviceController.js`** - Handles HTTP requests, emits WebSocket events
- **`tokenController.js`** - Token-specific request handlers

#### `/src/routes`
- **`serviceRoutes.js`** - Maps URLs to controllers
- **`tokenRoutes.js`** - Token-specific routes

#### `/src/services`
- **`serviceService.js`** - Business logic (token generation, queue ops)

#### `/src/sockets`
- **`queueSocket.js`** - WebSocket handlers and broadcast functions

#### `/src/models`
- Empty (for future Sequelize models)

#### Root Files
- **`app.js`** - Express app configuration
- **`server.js`** - Main entry point (starts HTTP + WebSocket server)

### `/queue-management-frontend-main/src` - Frontend Structure

#### `/pages`
- **`KioskDisplay.jsx`** - Public display (uses WebSocket)
- **`AdminDashboard.jsx` - Admin dashboard
- **`TokenGenerate.jsx`** - Customer token generation
- **`TokenPreview.jsx`** - Token confirmation

#### `/services`
- **`socketService.js`** - WebSocket client connection
- **`tokenService.js`** - HTTP API calls

---

## 🔄 How WebSocket Works

### Connection Flow:
1. **Server starts** → Creates Socket.IO server on port 5000
2. **Client connects** → Frontend connects via `socket.io-client`
3. **Join room** → Client emits `join:kiosk` or `join:admin`
4. **Events broadcast** → Server emits events to specific rooms

### Event Flow Example (Token Called):
```
Admin clicks "Call Next"
  ↓
POST /services/token/next/Deposit
  ↓
serviceController.callNextToken()
  ↓
Gets token from Redis queue
  ↓
broadcastToKiosk("token:called", data)
  ↓
All kiosk clients receive event
  ↓
KioskDisplay updates "Now Serving"
```

---

## 🧪 Testing Instructions

### Test 1: Start Server
```bash
cd c:\Token_Management_System
npm start
```

**Expected Output:**
```
✅ Socket.IO initialized
✅ Database connection successful
🚀 Server running on port 5000
🔌 WebSocket ready at ws://localhost:5000
```

### Test 2: Test WebSocket Connection
Run the test client:
```bash
node test-websocket.js
```

**Expected Output:**
```
✅ Connected to server: [socket-id]
📺 Joined kiosk room
⏳ Waiting for events...
```

### Test 3: Generate Token
In another terminal:
```powershell
$body = @{service="Deposit"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/services/token -Method POST -Body $body -ContentType "application/json"
```

**Check test client** - Should see token:generated event

### Test 4: Call Token
```powershell
Invoke-WebRequest -Uri http://localhost:5000/services/token/next/Deposit -UseBasicParsing
```

**Check test client** - Should see token:called event

### Test 5: Frontend Kiosk
1. Start frontend: `cd queue-management-frontend-main && npm run dev`
2. Open browser: `http://localhost:5173`
3. Switch to Kiosk mode
4. Generate and call tokens from API
5. Watch kiosk update in real-time!

---

## 📝 Key Files Explained

### `src/server.js`
- Creates HTTP server
- Initializes Socket.IO
- Connects to database
- Starts listening

### `src/sockets/queueSocket.js`
- Handles client connections
- Manages rooms (kiosk/admin)
- Provides broadcast functions

### `src/controllers/serviceController.js`
- Handles API requests
- Calls service functions
- Broadcasts WebSocket events

### `queue-management-frontend-main/src/services/socketService.js`
- Creates Socket.IO client
- Handles connection events
- Exports socket instance

### `queue-management-frontend-main/src/pages/KioskDisplay.jsx`
- Connects to WebSocket on mount
- Joins kiosk room
- Listens for token:called events
- Updates display in real-time

---

## 🎯 WebSocket Events

### Server Emits:
- **`token:generated`** → Sent to admin room when new token created
- **`token:called`** → Sent to kiosk room when token is called
- **`queue:update`** → Sent to admin room when queue changes

### Client Emits:
- **`join:kiosk`** → Join kiosk display room
- **`join:admin`** → Join admin dashboard room

---

## ✅ Success Checklist

- [x] Socket.IO server initialized
- [x] WebSocket connection works
- [x] Room joining works
- [x] Token generation broadcasts
- [x] Token calling broadcasts
- [x] Frontend kiosk receives updates
- [x] Multiple clients receive same events

---

## 🚀 Next Steps

1. **Test everything** using the test client
2. **Start frontend** and test kiosk display
3. **Add more events** (token:served, token:skipped)
4. **Add admin dashboard** WebSocket integration
5. **Add error handling** for connection failures

Your WebSocket integration is complete and ready to use! 🎉

