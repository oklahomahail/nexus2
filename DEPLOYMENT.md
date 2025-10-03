# Deployment Guide for Nexus

This guide covers deploying your Nexus application to various platforms with different backend configurations.

## Quick Start

### 1. Local Deployment

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### 2. Using the Deploy Script

```bash
# Deploy to Vercel (production)
./scripts/deploy.sh production vercel

# Deploy to Netlify (staging)
./scripts/deploy.sh staging netlify

# Deploy using Docker
./scripts/deploy.sh production docker

# Deploy using Docker Compose
./scripts/deploy.sh development docker-compose
```

## Platform-Specific Deployment

### Vercel

1. **Setup**:

   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Configuration**:
   - The `vercel.json` file is already configured
   - Set environment variables in Vercel dashboard:
     - `VITE_API_BASE_URL`
     - `VITE_CLAUDE_API_KEY`

3. **Deploy**:
   ```bash
   vercel --prod  # Production
   vercel         # Preview
   ```

### Netlify

1. **Setup**:

   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Configuration**:
   - The `netlify.toml` file is already configured
   - Set environment variables in Netlify dashboard

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist  # Production
   netlify deploy --dir=dist         # Preview
   ```

### Docker

1. **Build and Run**:

   ```bash
   # Build production image
   docker build \
     --target production \
     --build-arg VITE_API_ENVIRONMENT=production \
     --build-arg VITE_API_BASE_URL=https://api.nexus.com/v1 \
     --build-arg VITE_CLAUDE_API_KEY=your_key_here \
     -t nexus:prod \
     .

   # Run container
   docker run -d -p 80:80 nexus:prod
   ```

2. **Docker Compose**:

   ```bash
   # Development
   COMPOSE_PROFILES=dev docker-compose up -d

   # Production
   COMPOSE_PROFILES=prod docker-compose up -d
   ```

## Backend Configuration

The application supports multiple backend configurations through the API configuration system:

### Available Configurations

- **Development**: Local development server
- **Staging**: Staging API server
- **Production**: Production API server
- **Mock**: Mock API server for testing
- **Supabase**: Supabase backend
- **Firebase**: Firebase backend
- **GraphQL**: GraphQL backend

### Switching Backends

1. **Environment Variables**:

   ```bash
   # Set the environment
   VITE_API_ENVIRONMENT=development

   # Or override the base URL directly
   VITE_API_BASE_URL=https://your-api.com/v1
   ```

2. **Programmatically**:

   ```typescript
   import { apiConfigService } from "./src/services/apiConfig";

   // Switch to staging
   apiConfigService.setConfig("staging");

   // Or set custom configuration
   apiConfigService.setCustomConfig({
     name: "Custom API",
     baseUrl: "https://custom-api.com",
     // ... other config
   });
   ```

## Environment Variables

### Required Variables

| Variable               | Description            | Example                    |
| ---------------------- | ---------------------- | -------------------------- |
| `VITE_API_ENVIRONMENT` | Deployment environment | `production`               |
| `VITE_API_BASE_URL`    | API base URL           | `https://api.nexus.com/v1` |
| `VITE_CLAUDE_API_KEY`  | Claude AI API key      | `sk-ant-...`               |

### Optional Variables

| Variable                    | Description           | Default |
| --------------------------- | --------------------- | ------- |
| `VITE_ENABLE_ANALYTICS`     | Enable analytics      | `true`  |
| `VITE_ENABLE_NOTIFICATIONS` | Enable notifications  | `true`  |
| `VITE_ENABLE_DEBUG`         | Enable debug mode     | `false` |
| `VITE_CDN_URL`              | CDN URL for assets    | -       |
| `VITE_SENTRY_DSN`           | Sentry error tracking | -       |

## CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Runs tests and builds the application
2. Deploys to Vercel (or other platforms)
3. Sends notifications

### Required Secrets

Set these secrets in your GitHub repository settings:

| Secret                | Description             |
| --------------------- | ----------------------- |
| `VITE_API_BASE_URL`   | Production API URL      |
| `VITE_CLAUDE_API_KEY` | Claude AI API key       |
| `VERCEL_TOKEN`        | Vercel deployment token |
| `VERCEL_ORG_ID`       | Vercel organization ID  |
| `VERCEL_PROJECT_ID`   | Vercel project ID       |

## Health Checks and Monitoring

### Health Check Endpoints

- **Docker**: `http://localhost/health`
- **Application**: Built-in health checks for API connectivity

### Monitoring Setup

1. **Sentry** (Error Tracking):

   ```bash
   VITE_SENTRY_DSN=your_sentry_dsn_here
   VITE_SENTRY_ENVIRONMENT=production
   ```

2. **Custom Monitoring**: The API client includes built-in retry logic and error handling

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Ensure all environment variables are set
   - Check that dependencies are installed with `pnpm install --frozen-lockfile`
   - Verify Node.js version (≥20.0.0)

2. **API Connection Issues**:
   - Verify `VITE_API_BASE_URL` is correct
   - Check CORS configuration on your API server
   - Ensure API endpoints match the configuration

3. **Docker Issues**:
   - Make sure Docker daemon is running
   - Check that all build args are provided
   - Verify nginx configuration in `docker/nginx.conf`

### Debug Mode

Enable debug mode for development:

```bash
VITE_ENABLE_DEBUG=true pnpm dev
```

## Security Considerations

### Production Checklist

- [ ] All secrets are stored in environment variables
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] API endpoints are properly secured
- [ ] Rate limiting is configured
- [ ] Content Security Policy is set

### Security Headers

The deployment configurations include security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Performance Optimization

### Build Optimizations

- Tree shaking for unused code
- Code splitting for better loading
- Asset optimization and compression
- Long-term caching for static assets

### Runtime Optimizations

- Service worker for caching (if implemented)
- Lazy loading of components
- API request deduplication
- Error boundary for graceful failures

## Support

For deployment issues or questions:

1. Check the troubleshooting section above
2. Review the platform-specific documentation
3. Check the application logs
4. Ensure all environment variables are correctly set
