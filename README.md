# Healthy Eating - Backend Setup

## Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- Redis

## Installation

### 1. Clone and install dependencies
```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Setup PostgreSQL

Install PostgreSQL: https://www.postgresql.org/download/

After installation, create a database:
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE your_db_name;

# Create user (optional)
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_db_name TO your_username;

# Exit
\q
```

Your `DATABASE_URL` format:
```
postgresql://username:password@host:port/database?schema=public
```

- `username`: PostgreSQL user (default: `postgres`)
- `password`: User password
- `host`: Database host (default: `localhost`)
- `port`: PostgreSQL port (default: `5432`)
- `database`: Database name you created
- `?schema=public`: Specifies the schema (required by Prisma, keeps all tables in the `public` schema)

Example:
```
postgresql://postgres:mypassword@localhost:5432/healthy_eating?schema=public
```

### 3. Setup Redis

Install Redis: https://redis.io/docs/getting-started/installation/

Start Redis server:
```bash
redis-server --daemonize yes
```

### 4. Get FatSecret API Credentials (Optional)

If you need food/nutrition data from FatSecret:

1. Go to https://platform.fatsecret.com/api/
2. Sign up and create an application
3. Copy your Client ID and Client Secret
4. **Important - IP Restrictions:**
   - Free tier allows up to 15 IP addresses
   - Add your public IP address to the allowed list in FatSecret dashboard
   - Find your public IP: https://whatismyipaddress.com/
   - Go to your FatSecret app settings → IP Restrictions → Add your IP
   - Premium tiers can be configured to allow all IPs, but still recommended to configure for security
   - Documentation: https://platform.fatsecret.com/api/Default.aspx?screen=rapiauth2

You can use the existing credentials from the `.env` file or get your own.

### 5. Setup Gmail API (for email notifications)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Desktop app)
5. Get your Client ID and Client Secret
6. Generate a refresh token using OAuth Playground: https://developers.google.com/oauthplayground/
   - Select Gmail API v1 scopes
   - Authorize and exchange authorization code for tokens
   - Copy the refresh token

### 6. Configure `.env`

Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
JWT_SECRET="your-long-random-secret-key"
PORT=3000

# FatSecret API
FATSECRET_CLIENT_ID="your-fatsecret-client-id"
FATSECRET_CLIENT_SECRET="your-fatsecret-client-secret"

# Gmail API
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REFRESH_TOKEN="your-refresh-token"
GMAIL_USER="your-email@gmail.com"
EMAIL_FROM="your-email@gmail.com"
```

### 7. Setup Prisma and Database

Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

This will:
- Generate the Prisma Client based on your schema
- Create all database tables
- Apply any pending migrations

### 8. Start the server
```bash
node index.js
```

Server will run on `http://localhost:3000` (or your configured PORT)

---

# Frontend Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Start development server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default port).

**API Proxy:** The frontend is configured to proxy `/api` requests to `http://localhost:3000` (backend). If you change the backend port in `.env`, update `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:YOUR_BACKEND_PORT',
    },
  },
}
```

### 3. Build for production
```bash
npm run build
```

---

## Testing
```bash
npm test
```

## Troubleshooting

**Database connection fails:**
- Verify PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL credentials
- Ensure database exists: `psql -U postgres -l`

**Redis connection fails:**
- Check if Redis is running: `redis-cli ping` (should return `PONG`)
- Start Redis: `redis-server`

**Prisma errors:**
- Reset database: `npx prisma migrate reset`
- Regenerate client: `npx prisma generate`
