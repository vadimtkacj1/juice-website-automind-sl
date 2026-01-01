# Deployment Guide

## Why is the build slow?

The build process takes time because:

1. **Docker Image Build** (~2-3 minutes)
   - Installing Node.js dependencies (`npm install`)
   - Building Next.js application (`npm run build`)
   - Creating optimized production image

2. **Multi-platform builds** (if enabled)
   - Building for both `linux/amd64` and `linux/arm64` doubles the time
   - **Solution**: We've configured it to build only for `linux/amd64` (your server architecture)

3. **Docker layer caching**
   - First build is slower (no cache)
   - Subsequent builds are faster (cached layers)

## How to Initialize Database Manually

If the automatic database initialization fails during deployment, you can initialize it manually:

### Option 1: Quick Manual Initialization (Recommended)

SSH into your server and run:

```bash
cd /opt/juice-website
sudo bash scripts/init-db-manual.sh
```

This script will:
- Check if container is running
- Copy scripts to container
- Initialize database tables
- Create admin user

### Option 2: Step-by-Step Manual Initialization

```bash
# 1. Make sure container is running
cd /opt/juice-website
docker-compose ps

# 2. Copy scripts to container
docker cp scripts juice-website:/app/scripts

# 3. Create data directory
docker exec juice-website mkdir -p /app/data

# 4. Initialize database
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js

# 5. Create admin user
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/create-admin.js
```

### Option 3: Initialize from Host (if scripts are on server)

```bash
cd /opt/juice-website

# Make sure scripts directory exists
ls scripts/

# Initialize database
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js

# Create admin
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/create-admin.js
```

## Verify Database is Initialized

```bash
# Check if database file exists
ls -lh /opt/juice-website/data/juice_website.db

# Check inside container
docker exec juice-website ls -lh /app/data/juice_website.db

# Test database connection
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node -e "const db = require('./lib/database'); console.log('DB:', db ? 'Connected' : 'Failed');"
```

## Troubleshooting

### Container not running
```bash
cd /opt/juice-website
docker-compose up -d
docker ps | grep juice-website
```

### Database initialization fails
```bash
# Check container logs
docker logs juice-website

# Check if scripts exist in container
docker exec juice-website ls -la /app/scripts/

# Try manual initialization
sudo bash scripts/init-db-manual.sh
```

### Database file permissions
```bash
# Fix permissions
sudo chmod 666 /opt/juice-website/data/juice_website.db
sudo chown $(whoami):$(whoami) /opt/juice-website/data/juice_website.db
```

## Speed Up Future Builds

1. **Use Docker layer caching** (already enabled)
2. **Build only for your platform** (already configured - `linux/amd64`)
3. **Skip unnecessary steps** in CI/CD if possible
4. **Use build cache** from GitHub Actions (already enabled)

## Default Admin Credentials

After initialization:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change the password immediately after first login!

