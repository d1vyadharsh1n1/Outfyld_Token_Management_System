# Quick Test Guide

## ✅ Server is Running!

Based on the logs:
- ✅ **Database**: Connected successfully
- ✅ **Server**: Running on port 5000
- ⚠️ **Redis**: Not running (optional - server works without it)

## 🧪 How to Test

### Option 1: Browser Test
1. Open your browser
2. Go to: **http://localhost:5000**
3. You should see: `Backend server is running`

### Option 2: Command Line Test
```powershell
# Test home endpoint
Invoke-WebRequest -Uri http://localhost:5000 -UseBasicParsing

# Test API endpoint
Invoke-WebRequest -Uri http://localhost:5000/api -UseBasicParsing

# Test services endpoint
Invoke-WebRequest -Uri http://localhost:5000/services -UseBasicParsing
```

### Option 3: Generate a Token (POST request)
```powershell
$body = @{service="Deposit"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:5000/services/token -Method POST -Body $body -ContentType "application/json"
```

### Option 4: Get Next Token
```powershell
Invoke-WebRequest -Uri http://localhost:5000/services/token/next/Deposit -UseBasicParsing
```

## 📋 Test Checklist

- [x] Server starts
- [x] Database connects
- [ ] Home endpoint responds (`GET /`)
- [ ] API endpoint responds (`GET /api`)
- [ ] Services endpoint responds (`GET /services`)
- [ ] Token generation works (`POST /services/token`)
- [ ] Queue operations work (requires Redis)

## ⚠️ Note About Redis

Redis is **optional** for basic server functionality. The server will:
- ✅ Start without Redis
- ✅ Handle API requests
- ❌ Queue features won't work without Redis

To enable Redis:
1. Install Redis on Windows (or use Docker/WSL)
2. Start Redis server
3. Restart your Node.js server
4. You'll see: `✅ Redis connected`

## 🎯 Next Steps

1. Test all endpoints in browser or Postman
2. Start Redis if you want to test queue features
3. Ready for WebSocket integration!

