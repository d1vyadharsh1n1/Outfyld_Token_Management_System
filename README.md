# Token Management System

A queue management system built with Node.js, Express, Sequelize, and PostgreSQL (Supabase).

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Supabase account (or PostgreSQL database)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Token_Management_System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Connection URL (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Alternative: Individual Database Credentials
# DB_USERNAME=your_username
# DB_PASSWORD=your_password
# DB_HOST=your_host
# DB_NAME=postgres
# DB_PORT=5432

# Server Configuration (Optional)
PORT=3000
```

**Getting your Supabase Connection String:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Copy the **Connection string** under "Connection pooling" or "Direct connection"
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Paste it as `DATABASE_URL` in your `.env` file

**Example:**
```env
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:your_password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 4. Run Database Migrations

This will create all necessary tables in your database:

```bash
npm run migrate
```

**Expected Output:**
```
== 20251213165206-create-initial-tables: migrating =======
== 20251213165206-create-initial-tables: migrated (0.530s)
```

**Tables Created:**
- `services` - Service definitions
- `counters` - Counter information
- `token_history` - Token tracking and history

### 5. Start the Server

```bash
node server.js
```

**Expected Output:**
```
✅ DB Connection Successful. Supabase Ready.
🚀 Server listening on http://localhost:3000
```

### 6. Verify Installation

Open your browser and navigate to:
```
http://localhost:3000
```

You should see: `Queue System Backend Running.`

## Project Structure

```
Token_Management_System/
├── config/
│   └── config.js          # Sequelize configuration
├── migrations/
│   └── 20251213165206-create-initial-tables.js
├── models/
│   └── index.js           # Sequelize models
├── .env                   # Environment variables (create this)
├── .sequelizerc           # Sequelize CLI configuration
├── package.json           # Dependencies and scripts
└── server.js              # Main server file
```

## Available Scripts

- `npm run migrate` - Run database migrations
- `node server.js` - Start the development server

## Troubleshooting

### Database Connection Failed

1. **Check your `.env` file:**
   - Ensure `DATABASE_URL` is set correctly
   - Verify the password doesn't have special characters that need URL encoding
   - Make sure there are no extra spaces or quotes

2. **Verify Supabase Connection:**
   - Check if your Supabase project is active
   - Ensure your IP is whitelisted (if IP restrictions are enabled)
   - Verify the connection string format

3. **SSL Connection Issues:**
   - The code is configured to handle Supabase SSL requirements
   - If you're using a different PostgreSQL provider, adjust SSL settings in `server.js`

### Migration Errors

- Ensure the database connection is working before running migrations
- Check that you have proper permissions on the database
- Verify the migration file exists in the `migrations/` folder

## Database Schema

### Services Table
- `service_id` (Primary Key) - Unique service identifier
- `name` - Service name
- `avg_duration_minutes` - Average service duration
- `is_active` - Service status

### Counters Table
- `counter_id` (Primary Key) - Unique counter identifier
- `name` - Counter name
- `supported_service_ids` - Array of supported service IDs
- `is_open` - Counter availability status
- `operator_name` - Current operator

### Token History Table
- `token_id` (Primary Key) - Unique token identifier
- `service_id` (Foreign Key) - Reference to services
- `assigned_counter_id` (Foreign Key) - Reference to counters
- `status` - Token status
- `generation_timestamp` - When token was created
- `called_timestamp` - When token was called
- `served_timestamp` - When service was completed
- `skip_count` - Number of times token was skipped

## License

ISC
