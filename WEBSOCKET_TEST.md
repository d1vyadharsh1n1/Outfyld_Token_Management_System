# WebSocket Testing Guide

## 🧪 Testing WebSocket Connection

### Prerequisites
1. Backend server running on port 5000
2. Frontend running (or use test client below)

---

## Test 1: Backend WebSocket Server

### Check Server Logs
When server starts, you should see:
```
✅ Socket.IO initialized
🚀 Server running on port 5000
🔌 WebSocket ready at ws://localhost:5000
```

### Test Connection (Browser Console)
Open browser console and run:
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected!', socket.id);
});

socket.emit('join:kiosk');
console.log('Joined kiosk room');
```

---

## Test 2: Generate Token and Broadcast

### Step 1: Start Server
```bash
cd c:\Token_Management_System
npm start
```

### Step 2: Generate Token (PowerShell)
```powershell
$body = @{service="Deposit"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/services/token -Method POST -Body $body -ContentType "application/json"
```

### Step 3: Check Server Logs
You should see:
```
📢 Broadcasted to admin: token:generated
```

---

## Test 3: Call Token and Update Kiosk

### Step 1: Connect Kiosk Client (Browser Console)
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected');
  socket.emit('join:kiosk');
});

socket.on('token:called', (data) => {
  console.log('📢 Token called:', data);
  // Should update kiosk display
});
```

### Step 2: Call Next Token (PowerShell)
```powershell
Invoke-WebRequest -Uri http://localhost:5000/services/token/next/Deposit -UseBasicParsing
```

### Step 3: Check Browser Console
You should see the `token:called` event with token data.

---

## Test 4: Full Integration Test

### Test Script (Node.js)
Create `test-websocket.js`:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
  
  // Join kiosk room
  socket.emit("join:kiosk");
  console.log("📺 Joined kiosk room");
});

socket.on("token:called", (data) => {
  console.log("📢 Token called event:", data);
  console.log(`Counter ${data.counterId} is now serving token ${data.token.tokenNumber}`);
});

socket.on("token:generated", (data) => {
  console.log("📢 Token generated:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});

// Keep connection alive
setTimeout(() => {
  console.log("Test complete. Connection will stay open.");
}, 5000);
```

Run: `node test-websocket.js`

---

## Test 5: Frontend Kiosk Display

### Step 1: Start Frontend
```bash
cd queue-management-frontend-main
npm run dev
```

### Step 2: Open Browser
Go to: `http://localhost:5173`

### Step 3: Switch to Kiosk Mode
- Click "Kiosk" button in the app
- Or navigate directly to kiosk component

### Step 4: Generate Token from Another Tab
- Open another browser tab
- Use Postman or curl to generate token
- Call next token
- Watch kiosk display update in real-time!

---

## Test 6: Multiple Clients

### Test Scenario:
1. Open 3 browser tabs
2. All connect to kiosk room
3. Generate token and call it
4. All 3 tabs should update simultaneously

### Browser Console Code:
```javascript
// Tab 1, 2, 3 - Run this in each
const socket = io('http://localhost:5000');
socket.on('connect', () => {
  socket.emit('join:kiosk');
  console.log('Joined kiosk');
});
socket.on('token:called', (data) => {
  console.log('Token called:', data.token.tokenNumber);
});
```

---

## Expected WebSocket Events

### Events Emitted by Server:

1. **`token:generated`**
   - When: New token is created
   - Sent to: Admin room
   - Data: `{ token: {...}, timestamp: "..." }`

2. **`token:called`**
   - When: Operator calls next token
   - Sent to: Kiosk room
   - Data: `{ counterId: 1, token: {...}, timestamp: "..." }`

3. **`queue:update`**
   - When: Queue changes
   - Sent to: Admin room
   - Data: `{ counterId: 1, currentToken: 123, action: "called" }`

### Events Received by Server:

1. **`join:kiosk`**
   - Client wants to join kiosk display room

2. **`join:admin`**
   - Client wants to join admin dashboard room

---

## 🐛 Troubleshooting

### WebSocket Not Connecting?
- Check server is running
- Check CORS settings in `src/server.js`
- Check frontend URL matches `FRONTEND_URL` in `.env`

### Events Not Receiving?
- Verify client joined correct room (`join:kiosk` or `join:admin`)
- Check server logs for broadcast messages
- Verify event names match exactly

### Frontend Not Updating?
- Check browser console for errors
- Verify `socketService.js` is imported correctly
- Check WebSocket connection status in browser DevTools → Network → WS

---

## ✅ Success Criteria

- [ ] Server starts with Socket.IO initialized
- [ ] Client can connect to WebSocket
- [ ] Client can join kiosk room
- [ ] Token generation broadcasts to admin
- [ ] Token called broadcasts to kiosk
- [ ] Frontend kiosk display updates in real-time
- [ ] Multiple clients receive same updates

---

## 📝 Quick Test Checklist

1. ✅ Server running → Check logs
2. ✅ WebSocket connects → Browser console
3. ✅ Join room → Emit `join:kiosk`
4. ✅ Generate token → POST `/services/token`
5. ✅ Call token → GET `/services/token/next/:service`
6. ✅ Kiosk updates → Check frontend display

All tests passing? WebSocket integration is working! 🎉

