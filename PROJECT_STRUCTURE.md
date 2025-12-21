# Project Structure - Complete Guide

## 📁 Root Directory Structure

```
Token_Management_System/
├── config/                    # Sequelize CLI configuration
├── migrations/                # Database migration files
├── queue-management-frontend-main/  # React frontend application
├── src/                       # Backend application (ES6 modules)
├── .env                       # Environment variables (not in git)
├── .gitignore                 # Git ignore rules
├── .sequelizerc              # Sequelize CLI paths config
└── package.json              # Node.js dependencies
```

---

## 📂 Folder-by-Folder Explanation

### 1. `/config` - Sequelize CLI Configuration

**Purpose**: Configuration for Sequelize CLI tool (used for migrations)

**Files**:
- `config.js` - Database connection config for CLI (CommonJS format)

**Why it exists**: 
- Sequelize CLI requires CommonJS format (`require/module.exports`)
- Used when running `npm run migrate`
- Separate from application runtime config

**Key Point**: This is ONLY for migrations CLI, not for the running application.

---

### 2. `/migrations` - Database Migrations

**Purpose**: SQL migration files that create/modify database tables

**Files**:
- `20251213165206-create-initial-tables.js` - Creates services, counters, token_history tables

**What it does**:
- Defines database schema changes
- Run with: `npm run migrate`
- Creates tables: `services`, `counters`, `token_history`

**Key Point**: These files define your database structure and are version-controlled.

---

### 3. `/src` - Backend Application Code

**Purpose**: Main backend server code (Express + Socket.IO + Sequelize)

#### `/src/config` - Application Configuration

**Files**:
- `db.js` - Database connection for application runtime (ES6)
- `redis.js` - Redis connection and queue functions

**What they do**:
- `db.js`: Connects to PostgreSQL/Supabase when server starts
- `redis.js`: Manages Redis connection and queue operations

**Key Point**: These are ES6 modules used by the running application.

#### `/src/controllers` - Request Handlers

**Files**:
- `serviceController.js` - Handles service-related API requests
- `tokenController.js` - Handles token-related API requests

**What they do**:
- Process HTTP requests
- Call service functions
- Send responses
- Emit WebSocket events

**Example**: `generateToken()` receives POST request, creates token, broadcasts via WebSocket

#### `/src/routes` - API Route Definitions

**Files**:
- `serviceRoutes.js` - Defines service endpoints
- `tokenRoutes.js` - Defines token endpoints

**What they do**:
- Map URLs to controller functions
- Example: `POST /services/token` → `generateToken` controller

**Routes**:
- `GET /api` - Get services
- `POST /services/token` - Generate token
- `GET /services/token/next/:service` - Get next token

#### `/src/services` - Business Logic

**Files**:
- `serviceService.js` - Token generation and queue operations

**What they do**:
- Contains business logic (not HTTP-specific)
- Interacts with Redis for queue management
- Can be reused by controllers or other services

**Key Point**: Separates business logic from HTTP handling.

#### `/src/sockets` - WebSocket Handlers

**Files**:
- `queueSocket.js` - Socket.IO event handlers and broadcast functions

**What it does**:
- Sets up Socket.IO connection handling
- Manages rooms (kiosk, admin)
- Provides broadcast functions for real-time updates

**Events**:
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

#### `/src/app.js` - Express Application Setup

**Purpose**: Configures Express app (middleware, routes)

**What it does**:
- Sets up Express application
- Adds middleware (JSON parser, CORS)
- Registers routes
- Error handling

**Key Point**: This is the Express app, not the server itself.

#### `/src/server.js` - Main Entry Point

**Purpose**: Starts the HTTP server and Socket.IO

**What it does**:
- Creates HTTP server from Express app
- Initializes Socket.IO
- Connects to database
- Starts listening on port 5000

**Key Point**: This is where the application starts.

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
- `TokenPreview.jsx` - Shows generated token
- `AdminDashboard.jsx` - Admin operator dashboard
- `KioskDisplay.jsx` - Public display screen (uses WebSocket)

**What they do**:
- `TokenGenerate`: Customer selects service and generates token
- `TokenPreview`: Shows token number and details
- `AdminDashboard`: Operators call/serve/skip tokens
- `KioskDisplay`: Shows "Now Serving" tokens (real-time via WebSocket)

#### `/queue-management-frontend-main/src/services` - Frontend Services

**Files**:
- `tokenService.js` - API calls for token operations
- `socketService.js` - WebSocket connection setup

**What they do**:
- `tokenService.js`: Makes HTTP requests to backend API
- `socketService.js`: Connects to Socket.IO server for real-time updates

---

## 🔄 Data Flow

### Token Generation Flow:
1. **Frontend** (`TokenGenerate.jsx`) → User selects service
2. **Frontend** (`tokenService.js`) → POST `/services/token`
3. **Backend** (`routes/serviceRoutes.js`) → Routes to controller
4. **Backend** (`controllers/serviceController.js`) → Calls service
5. **Backend** (`services/serviceService.js`) → Adds to Redis queue
6. **Backend** (`controllers/serviceController.js`) → Broadcasts via WebSocket
7. **Frontend** (`KioskDisplay.jsx`) → Receives WebSocket event, updates display

### Token Called Flow:
1. **Frontend** (`AdminDashboard.jsx`) → Operator clicks "Call Next"
2. **Backend** (`controllers/serviceController.js`) → Gets token from Redis
3. **Backend** (`sockets/queueSocket.js`) → Broadcasts to kiosk room
4. **Frontend** (`KioskDisplay.jsx`) → Updates "Now Serving" display

---

## 🎯 Key Concepts

### Why Two Config Files?
- `config/config.js` (CommonJS) - For Sequelize CLI migrations
- `src/config/db.js` (ES6) - For application runtime
- **Cannot merge** - Different module systems, different purposes

### Why Separate Controllers/Services?
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic (reusable)
- **Separation**: Makes code testable and maintainable

### WebSocket Rooms:
- **kiosk room**: Public display screens
- **admin room**: Admin dashboards
- **Broadcasting**: Sends updates only to relevant clients

---

## 📝 Summary

- **`/config`**: CLI config (migrations)
- **`/migrations`**: Database schema changes
- **`/src`**: Backend application code
- **`/src/config`**: Runtime config (DB, Redis)
- **`/src/controllers`**: HTTP request handlers
- **`/src/routes`**: API route definitions
- **`/src/services`**: Business logic
- **`/src/sockets`**: WebSocket handlers
- **`/queue-management-frontend-main`**: React frontend

Each folder has a specific purpose following separation of concerns principles!

