# Testing Guide

## ✅ Server Status

The server is running successfully!

### Current Status:
- ✅ **Database**: Connected to Supabase
- ⚠️ **Redis**: Not running (server continues without it)
- ✅ **Express Server**: Running on port 5000

## 🧪 How to Test

### 1. Test Server Health
```bash
curl http://localhost:5000
```
**Expected Response**: `Backend server is running`

### 2. Test API Endpoints

#### Get Services
```bash
curl http://localhost:5000/api
```
or
```bash
curl http://localhost:5000/services
```

#### Generate Token
```bash
curl -X POST http://localhost:5000/services/token \
  -H "Content-Type: application/json" \
  -d '{"service": "Deposit"}'
```

#### Get Next Token
```bash
curl http://localhost:5000/services/token/next/Deposit
```

### 3. Test in Browser

Open your browser and visit:
- **Home**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Services**: http://localhost:5000/services

### 4. Test with Postman/Thunder Client

**Base URL**: `http://localhost:5000`

**Available Endpoints**:
- `GET /` - Health check
- `GET /api` - Get services
- `GET /services` - Get services
- `POST /services/token` - Generate token
- `GET /services/token/next/:service` - Get next token from queue

## ⚠️ Redis Setup (Optional for Testing)

If you want to test Redis queue functionality:

### Windows:
1. Download Redis for Windows
2. Or use WSL: `wsl redis-server`
3. Or use Docker: `docker run -d -p 6379:6379 redis`

### After Redis is Running:
The server will automatically connect and you'll see:
```
✅ Redis connected
```

## 📝 Test Checklist

- [x] Server starts successfully
- [x] Database connection works
- [ ] Redis connection (optional)
- [ ] API endpoints respond
- [ ] Token generation works
- [ ] Queue operations work

## 🐛 Troubleshooting

### Server won't start?
- Check `.env` file has `DATABASE_URL`
- Check database credentials are correct
- Check port 5000 is not in use

### Redis errors?
- Redis is optional - server works without it
- Queue features won't work without Redis
- Start Redis to enable queue functionality

### Database connection fails?
- Verify `DATABASE_URL` in `.env`
- Check Supabase project is active
- Verify SSL settings

