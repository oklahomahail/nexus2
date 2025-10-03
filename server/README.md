# Nexus Backend API

A robust TypeScript/Express.js backend for the Nexus donor management platform.

## Features

- 🔐 **JWT Authentication** with refresh tokens
- 📊 **Complete Database Schema** with Prisma ORM
- 🛡️ **Security Middleware** (Helmet, CORS, Rate Limiting)
- ⚡ **WebSocket Support** for real-time updates
- 📝 **Comprehensive Logging** with Winston
- 🎯 **Input Validation** with Zod
- 🔄 **Error Handling** with custom error classes
- 📈 **Health Check Endpoints** for monitoring

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
# or
pnpm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 3. Database Setup

You'll need PostgreSQL running. You can use:

**Option A: Local PostgreSQL**

```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Ubuntu

# Create database
createdb nexus_dev
```

**Option B: Docker PostgreSQL**

```bash
docker run --name nexus-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=nexus_dev \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud Database (Recommended for production)**

- Use services like [Neon](https://neon.tech), [PlanetScale](https://planetscale.com), or [Supabase](https://supabase.com)

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with test data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Core Endpoints (Placeholder - implement as needed)

- `GET /api/campaigns` - List campaigns
- `GET /api/clients` - List clients
- `GET /api/donors` - List donors
- `GET /api/donations` - List donations
- `GET /api/analytics` - Analytics data

### Health Check

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system health

## Database Schema

The database includes tables for:

- **Users** - Authentication and user management
- **Clients** - Organizations using the platform
- **Campaigns** - Fundraising campaigns
- **Donors** - Individual and corporate donors
- **Donations** - Transaction records
- **Analytics** - Campaign performance data
- **Activities** - Audit log of system events

## Development

### Database Commands

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database (careful - deletes all data!)
npm run db:reset

# Create new migration
npm run db:migrate

# Deploy to production database
npm run db:deploy
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_SECRET=your_super_secure_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build and Start

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t nexus-backend .

# Run container
docker run -p 4000:4000 --env-file .env nexus-backend
```

## API Usage Examples

### Authentication

```javascript
// Register
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "securepassword",
    firstName: "John",
    lastName: "Doe",
  }),
});

// Login
const loginResponse = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "securepassword",
  }),
});

const { tokens } = await loginResponse.json();

// Use access token for authenticated requests
const protectedResponse = await fetch("/api/campaigns", {
  headers: {
    Authorization: `Bearer ${tokens.accessToken}`,
  },
});
```

### WebSocket Connection

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:4000");

// Join user-specific room for notifications
socket.emit("join-user-room", userId);

// Listen for campaign updates
socket.on("campaign-updated", (campaign) => {
  console.log("Campaign updated:", campaign);
});
```

## Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route handlers
│   ├── controllers/     # Business logic controllers
│   ├── services/        # Business services
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── scripts/         # Database scripts
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/               # Application logs
└── uploads/           # File uploads
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in .env
   - Kill existing process: `lsof -ti:4000 | xargs kill -9`

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set and long enough (32+ characters)
   - Check token expiration settings

4. **CORS Issues**
   - Verify CORS_ORIGIN matches your frontend URL
   - Check for trailing slashes in URLs

## Next Steps

1. **Implement Core Endpoints** - Add CRUD operations for campaigns, donors, etc.
2. **Add Email Service** - Integrate with SendGrid, Mailgun, or similar
3. **File Upload** - Implement file upload for campaign assets
4. **Payment Integration** - Add Stripe or PayPal for donations
5. **Advanced Analytics** - Build reporting and dashboard APIs
6. **Testing** - Add comprehensive test suite
7. **Documentation** - Add OpenAPI/Swagger documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Run linting and formatting
5. Submit a pull request

## Support

For questions or issues, check the logs in the `logs/` directory or enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```
