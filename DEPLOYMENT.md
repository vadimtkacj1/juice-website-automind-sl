# Production Deployment Guide

This document describes how to deploy the Juice Website application to production using CI/CD.

## Prerequisites

1. **GitHub Repository** with CI/CD workflows enabled
2. **Production Server** (Hetzner, AWS, DigitalOcean, etc.) with:
   - Docker and Docker Compose installed
   - SSH access configured
   - PM2 installed (for PM2 deployment method)
   - Node.js 18+ installed (for PM2 deployment method)

## Required GitHub Secrets

Configure the following secrets in your GitHub repository (Settings → Secrets and variables → Actions):

### For Docker Deployment (ci-cd.yml)
- `SSH_PRIVATE_KEY` - Private SSH key for server access
- `SSH_HOST` - Server IP address or hostname
- `SSH_USER` - SSH username (usually `root` or `ubuntu`)
- `APP_PATH` - Application path on server (default: `/opt/juice-website`)
- `DEPLOYMENT_URL` - Full URL of your deployment (e.g., `https://yourdomain.com`)
- `GHCR_TOKEN` - GitHub Container Registry token (optional, for private repos)
- `GHCR_USER` - GitHub username (optional, defaults to repository owner)

### For PM2 Deployment (deploy.yml)
- `SSH_PRIVATE_KEY` - Private SSH key for server access
- `SSH_HOST` - Server IP address or hostname
- `SSH_USER` - SSH username
- `SSH_PORT` - SSH port (default: 22)
- `DEPLOYMENT_URL` - Full URL of your deployment
- `NEXT_PUBLIC_APP_URL` - Public URL of your application

### Application Secrets (Both Methods)
- `RAPYD_ACCESS_KEY` - Rapyd API access key (legacy, optional)
- `RAPYD_SECRET_KEY` - Rapyd API secret key (legacy, optional)
- `PAYPLUS_API_KEY` - PayPlus API key (required for payments)
- `PAYPLUS_SECRET_KEY` - PayPlus secret key (required for payments)
- `PAYPLUS_PAGE_UID` - PayPlus payment page UID (required for payments)
- `TELEGRAM_BOT_TOKEN` - Telegram bot token (optional)
- `SESSION_SECRET` - Secret key for session encryption (generate a random string)
- `DEPLOYMENT_URL` - Full URL of your deployment (e.g., `https://yourdomain.com`) - required for PayPlus callbacks

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

The `ci-cd.yml` workflow automatically:
1. Lints and tests the code
2. Builds the application
3. Builds and pushes Docker image to GitHub Container Registry
4. Deploys to Hetzner server using Docker Compose

**Setup on Server:**

1. Create application directory:
```bash
mkdir -p /opt/juice-website
cd /opt/juice-website
```

2. Create `docker-compose.yml` (or copy from repository):
```bash
# Copy docker-compose.yml to server
```

3. Create `.env` file on server:
```bash
cat > .env << EOF
RAPYD_ACCESS_KEY=your_access_key
RAPYD_SECRET_KEY=your_secret_key
PAYPLUS_API_KEY=your_payplus_api_key
PAYPLUS_SECRET_KEY=your_payplus_secret_key
PAYPLUS_PAGE_UID=your_payplus_page_uid
TELEGRAM_BOT_TOKEN=your_telegram_token
SESSION_SECRET=your_session_secret
DEPLOYMENT_URL=https://yourdomain.com
PORT=3000
EOF
```

4. Create data directory:
```bash
mkdir -p data public/uploads
chmod 755 data public/uploads
```

5. Initialize database (first time only):
```bash
docker-compose run --rm nextjs-app node scripts/init-database.js
docker-compose run --rm nextjs-app node scripts/create-admin.js
```

**Deployment:**
- Push to `main` or `master` branch to trigger automatic deployment
- Or manually trigger via GitHub Actions UI

### Method 2: PM2 Deployment

The `deploy.yml` workflow:
1. Builds the application
2. Creates a deployment package
3. Deploys to server via SSH
4. Runs PM2 to manage the application

**Setup on Server:**

1. Install PM2:
```bash
npm install -g pm2
```

2. Create application directory:
```bash
mkdir -p /opt/juice-website
cd /opt/juice-website
```

3. Create `.env` file:
```bash
cat > .env << EOF
NODE_ENV=production
PORT=3000
RAPYD_ACCESS_KEY=your_access_key
RAPYD_SECRET_KEY=your_secret_key
PAYPLUS_API_KEY=your_payplus_api_key
PAYPLUS_SECRET_KEY=your_payplus_secret_key
PAYPLUS_PAGE_UID=your_payplus_page_uid
TELEGRAM_BOT_TOKEN=your_telegram_token
SESSION_SECRET=your_session_secret
DEPLOYMENT_URL=https://yourdomain.com
DATABASE_PATH=./juice_website.db
EOF
```

4. Initialize database (first time only):
```bash
npm run init-db
npm run create-admin
```

**Deployment:**
- Push to `main` or `master` branch
- Or manually trigger via GitHub Actions UI (workflow_dispatch)

## Environment Variables

### Required
- `NODE_ENV=production`
- `PAYPLUS_API_KEY` - PayPlus API key (required for payments)
- `PAYPLUS_SECRET_KEY` - PayPlus secret key (required for payments)
- `PAYPLUS_PAGE_UID` - PayPlus payment page UID (required for payments)
- `DEPLOYMENT_URL` - Full URL of your deployment (required for PayPlus callbacks)
- `SESSION_SECRET` - Random string for session encryption

### Optional
- `PORT` - Server port (default: 3000)
- `TELEGRAM_BOT_TOKEN` - For Telegram notifications
- `TELEGRAM_SERVICE_URL` - Telegram service URL (default: http://localhost:3001)
- `DATABASE_PATH` - Path to SQLite database file
- `NEXT_PUBLIC_APP_URL` - Public URL of your application

## Health Check

The application includes a health check endpoint at `/api/health` that:
- Checks database connectivity
- Returns application status
- Used by CI/CD for deployment verification

## Troubleshooting

### Docker Deployment Issues

1. **Image pull fails:**
   - Check GHCR_TOKEN and GHCR_USER secrets
   - Ensure repository is public or token has access

2. **Container won't start:**
   - Check environment variables in `.env` file
   - Verify database directory permissions
   - Check logs: `docker-compose logs nextjs-app`

3. **Database errors:**
   - Ensure data directory is mounted correctly
   - Check file permissions: `chmod 755 data`
   - Initialize database if missing

### PM2 Deployment Issues

1. **Application won't start:**
   - Check PM2 logs: `pm2 logs juice-website`
   - Verify environment variables
   - Check Node.js version: `node --version` (should be 18+)

2. **Database errors:**
   - Ensure DATABASE_PATH is correct
   - Check file permissions
   - Initialize database if missing

3. **Port already in use:**
   - Change PORT in `.env` file
   - Or stop conflicting service

## Monitoring

### Docker
```bash
# View logs
docker-compose logs -f nextjs-app

# Check status
docker-compose ps

# Restart service
docker-compose restart nextjs-app
```

### PM2
```bash
# View logs
pm2 logs juice-website

# Check status
pm2 status

# Restart application
pm2 restart juice-website

# Monitor
pm2 monit
```

## Backup

### Database Backup
```bash
# Docker
docker-compose exec nextjs-app cp /app/data/juice_website.db /app/data/juice_website.db.backup

# PM2
cp juice_website.db juice_website.db.backup
```

## Security Notes

1. Never commit `.env` files or secrets to repository
2. Use strong `SESSION_SECRET` (random 32+ character string)
3. Keep dependencies updated: `npm audit`
4. Use HTTPS in production (configure reverse proxy like Nginx)
5. Regularly backup database

## Reverse Proxy Setup (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Support

For issues or questions, check:
- Application logs
- GitHub Actions workflow logs
- Server system logs

