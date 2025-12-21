# Quick Start Guide - WebSocket Testing

## ✅ WebSocket Integration Complete!

### What Was Added:
1. ✅ Socket.IO server integrated with Express
2. ✅ WebSocket handlers for kiosk and admin rooms
3. ✅ Real-time token broadcasting
4. ✅ Frontend WebSocket client
5. ✅ Kiosk display with live updates

---

## 🚀 Quick Test Steps

### Step 1: Start Backend Server
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

### Step 2: Test WebSocket Connection
```bash
node test-websocket.js
```

**Expected Output:**
```
✅ Connected to server: [socket-id]
📺 Joined kiosk room
⏳ Waiting for events...
```

### Step 3: Generate Token (Another Terminal)
```powershell
$body = @{service="Deposit"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/services/token -Method POST -Body $body -ContentType "application/json"
```

**Watch test client** - Should see `token:generated` event

### Step 4: Call Token
```powershell
Invoke-WebRequest -Uri http://localhost:5000/services/token/next/Deposit -UseBasicParsing
```

**Watch test client** - Should see `token:called` event with token number

### Step 5: Test Frontend Kiosk
```bash
cd queue-management-frontend-main
npm run dev
```

1. Open browser: `http://localhost:5173`
2. Click "Kiosk" button
3. Generate tokens from API
4. Watch kiosk update in real-time!

---

## 📁 Folder Structure Summary

### Backend (`/src`):
- **`config/`** - Database & Redis connections
- **`controllers/`** - HTTP request handlers + WebSocket broadcasts
- **`routes/`** - API route definitions
- **`services/`** - Business logic
- **`sockets/`** - WebSocket handlers
- **`server.js`** - Main entry point

### Frontend (`/queue-management-frontend-main/src`):
- **`pages/`** - React components (KioskDisplay uses WebSocket)
- **`services/`** - API calls + WebSocket client

---

## 🎯 WebSocket Events

### Server Broadcasts:
- `token:generated` → Admin room (new token created)
- `token:called` → Kiosk room (token called for service)
- `queue:update` → Admin room (queue changes)

### Client Emits:
- `join:kiosk` → Join kiosk display room
- `join:admin` → Join admin dashboard room

---

## ✅ Testing Checklist

- [x] Server starts with Socket.IO
- [x] WebSocket test client connects
- [x] Token generation broadcasts
- [x] Token calling broadcasts
- [x] Frontend kiosk receives updates
- [x] Multiple clients work

---

## 📚 Documentation Files Created

1. **`PROJECT_STRUCTURE.md`** - Complete folder explanation
2. **`WEBSOCKET_TEST.md`** - Detailed testing guide
3. **`FOLDER_EXPLANATION.md`** - Every folder explained
4. **`COMPLETE_GUIDE.md`** - Full integration guide
5. **`test-websocket.js`** - Test client script

---

## 🎉 Ready to Use!

Your WebSocket integration is complete and tested! The kiosk display will now update in real-time when tokens are called. 🚀

