# Complete Folder Explanation Guide

## 📁 Every Folder Explained

### 1. `/config` - Sequelize CLI Configuration
**Purpose**: Configuration file for Sequelize CLI tool (used for database migrations)

**What's inside**:
- `config.js` - Database connection settings in CommonJS format

**Why it exists**:
- Sequelize CLI requires CommonJS (`require/module.exports`)
- Used when you run `npm run migrate`
- Separate from application runtime config

**When it's used**: Only when running migrations, not during normal server operation

---

### 2. `/migrations` - Database Schema Changes
**Purpose**: SQL migration files that create and modify database tables

**What's inside**:
- `20251213165206-create-initial-tables.js` - Creates your database tables

**What it does**:
- Defines database structure (services, counters, token_history tables)
- Run with: `npm run migrate`
- Version-controlled database changes

**Key Point**: These files define your database structure and are run once per environment

---

### 3. `/src` - Backend Application Code
**Purpose**: Main backend server code (Express + Socket.IO + Sequelize)

#### `/src/config` - Runtime Configuration
**Files**:
- `db.js` - PostgreSQL/Supabase connection (ES6 modules)
- `redis.js` - Redis connection and queue management functions

**What they do**:
- `db.js`: Connects to database when server starts
- `redis.js`: Manages Redis connection and provides queue functions

**Key Point**: These are ES6 modules used by the running application (different from `/config`)

#### `/src/controllers` - Request Handlers
**Files**:
- `serviceController.js` - Handles service and token API requests
- `tokenController.js` - Token-specific request handlers

**What they do**:
- Receive HTTP requests
- Call service functions for business logic
- Send HTTP responses
- Emit WebSocket events for real-time updates

**Example Flow**:
```
POST /services/token
  → serviceController.generateToken()
  → Calls serviceService.createToken()
  → Broadcasts via WebSocket
  → Returns JSON response
```

#### `/src/routes` - API Route Definitions
**Files**:
- `serviceRoutes.js` - Maps URLs to controller functions
- `tokenRoutes.js` - Token-specific routes

**What they do**:
- Define API endpoints
- Connect URLs to controller functions
- Example: `POST /services/token` → `generateToken` controller

**Routes Available**:
- `GET /api` - Get services
- `POST /services/token` - Generate token
- `GET /services/token/next/:service` - Get next token from queue

#### `/src/services` - Business Logic
**Files**:
- `serviceService.js` - Token generation and queue operations

**What they do**:
- Contains business logic (not HTTP-specific)
- Interacts with Redis for queue management
- Can be reused by controllers or other services

**Key Point**: Separates business logic from HTTP handling (better code organization)

#### `/src/sockets` - WebSocket Handlers
**Files**:
- `queueSocket.js` - Socket.IO event handlers and broadcast functions

**What it does**:
- Sets up Socket.IO connection handling
- Manages rooms (kiosk for display, admin for dashboard)
- Provides broadcast functions for real-time updates

**Events Handled**:
- `join:kiosk` - Client joins kiosk display room
- `join:admin` - Client joins admin dashboard room
- `token:called` - Broadcasts when token is called
- `token:generated` - Broadcasts when new token created

#### `/src/models` - Database Models (Future)
**Purpose**: Sequelize model definitions (not created yet)

**What it will contain**:
- Model files for `Service`, `Counter`, `TokenHistory`
- Defines table relationships
- Used for database queries

**Key Point**: Models will be created here when implementing database operations

#### `/src/app.js` - Express Application Setup
**Purpose**: Configures Express app (middleware, routes)

**What it does**:
- Sets up Express application
- Adds middleware (JSON parser, CORS)
- Registers routes
- Error handling

**Key Point**: This is the Express app configuration, not the server itself

#### `/src/server.js` - Main Entry Point
**Purpose**: Starts the HTTP server and Socket.IO

**What it does**:
- Creates HTTP server from Express app
- Initializes Socket.IO with CORS
- Connects to database
- Starts listening on port 5000

**Key Point**: This is where the application starts - run this file to start the server

---

### 4. `/queue-management-frontend-main` - React Frontend
**Purpose**: Customer-facing and admin frontend application

#### `/queue-management-frontend-main/src` - React Source Code
**Files**:
- `App.jsx` - Main app component with routing
- `main.jsx` - React entry point

#### `/queue-management-frontend-main/src/pages` - Page Components
**Files**:
- `TokenGenerate.jsx` - Customer token generation page
- `TokenPreview.jsx` - Shows generated token details
- `AdminDashboard.jsx` - Admin operator dashboard
- `KioskDisplay.jsx` - Public display screen (uses WebSocket for real-time updates)

**What they do**:
- `TokenGenerate`: Customer selects service and generates token
- `TokenPreview`: Shows token number and details
- `AdminDashboard`: Operators call/serve/skip tokens
- `KioskDisplay`: Shows "Now Serving" tokens (updates in real-time via WebSocket)

#### `/queue-management-frontend-main/src/services` - Frontend Services
**Files**:
- `tokenService.js` - API calls for token operations
- `socketService.js` - WebSocket connection setup

**What they do**:
- `tokenService.js`: Makes HTTP requests to backend API
- `socketService.js`: Connects to Socket.IO server for real-time updates

---

## 🔄 Data Flow Example

### Token Generation Flow:
```
1. Frontend (TokenGenerate.jsx)
   ↓ User clicks "Generate Token"
2. Frontend (tokenService.js)
   ↓ POST /services/token
3. Backend (routes/serviceRoutes.js)
   ↓ Routes to controller
4. Backend (controllers/serviceController.js)
   ↓ Calls service function
5. Backend (services/serviceService.js)
   ↓ Adds token to Redis queue
6. Backend (controllers/serviceController.js)
   ↓ Broadcasts via WebSocket
7. Frontend (KioskDisplay.jsx)
   ↓ Receives WebSocket event
8. Frontend updates display in real-time
```

---

## 📝 Summary Table

| Folder | Purpose | Key Files | Used By |
|--------|---------|-----------|---------|
| `/config` | CLI config | `config.js` | Sequelize CLI |
| `/migrations` | DB schema | Migration files | Sequelize CLI |
| `/src/config` | Runtime config | `db.js`, `redis.js` | Application |
| `/src/controllers` | HTTP handlers | `serviceController.js` | Routes |
| `/src/routes` | API routes | `serviceRoutes.js` | Express app |
| `/src/services` | Business logic | `serviceService.js` | Controllers |
| `/src/sockets` | WebSocket | `queueSocket.js` | Server |
| `/src/models` | DB models | (Future) | Services |
| `/src/app.js` | Express setup | `app.js` | Server |
| `/src/server.js` | Entry point | `server.js` | Node.js |
| `/queue-management-frontend-main` | Frontend | React components | Browser |

---

## 🎯 Key Concepts

### Separation of Concerns:
- **Routes** → Define URLs
- **Controllers** → Handle HTTP requests
- **Services** → Business logic
- **Sockets** → Real-time communication
- **Config** → Connection settings

### Why Two Config Folders?
- `/config` → CommonJS (for CLI tools)
- `/src/config` → ES6 (for application)

### WebSocket Flow:
- Client connects → Joins room → Receives broadcasts → Updates UI

---

## ✅ Understanding Complete!

Now you know what every folder does and how they work together! 🎉

