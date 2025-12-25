# Token Management System

A real-time, web-based queue management system designed for banks with multiple counters. Customers generate same-day service tokens, each counter maintains its own queue, operators manage tokens via an admin dashboard, and a kiosk updates live through WebSockets.

## Features

- ✅ Real-time token generation and queue management
- ✅ Counter-based queue system (each counter has its own independent queue)
- ✅ WebSocket-based live updates for kiosk displays
- ✅ Admin dashboard for token management
- ✅ PostgreSQL for persistent storage
- ✅ Redis for fast queue operations
- ✅ Same-day token generation only (fairness rule)

## Technology Stack

- **Backend**: Node.js (Express.js), PostgreSQL, Redis
- **Frontend**: React.js (Vite)
- **Real-time**: Socket.IO
- **ORM**: Sequelize

## Project Structure

```
Token_Management_System/
├── src/                    # Backend source code
│   ├── config/            # Database and Redis configuration
│   ├── controllers/       # Request handlers
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── sockets/           # WebSocket handlers
│   ├── utils/             # Utility functions
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── migrations/            # Database migrations
├── seeders/              # Database seeders
├── docs/                 # Documentation files
└── config/               # Configuration files
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Token_Management_System
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=token_management
DB_USER=your_username
DB_PASSWORD=your_password

# Redis
REDIS_URL=redis://127.0.0.1:6379

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173
```

4. Run database migrations:
```bash
npm run migrate
```

5. Seed initial data:
```bash
npm run seed
```

6. Start the backend server:
```bash
npm run dev
```


## API Endpoints

### Services
- `GET /api/services` - Get all active services
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service

### Tokens
- `POST /services/token` - Generate a new token
- `GET /services/token/next/:counter_id` - Get next token for a counter
- `POST /services/token/serve` - Mark token as served
- `POST /services/token/skip` - Skip a token


## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed initial data
- `npm run seed:undo` - Undo seed data

### Code Standards

- Use ESLint + Prettier for code formatting
- Follow meaningful naming conventions
- Write unit tests for critical components
- Document all APIs

## License

ISC


