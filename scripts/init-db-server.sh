#!/bin/bash
# Script to initialize database on server
# Usage: bash scripts/init-db-server.sh

set -e

echo "=========================================="
echo "Database Initialization Script"
echo "=========================================="
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ docker-compose.yml not found!"
  echo "Please run this script from the project root directory."
  exit 1
fi

# Check if container exists
if ! docker ps -a | grep -q juice-website; then
  echo "⚠ Container 'juice-website' not found. Starting container first..."
  docker-compose up -d
  echo "Waiting for container to start..."
  sleep 10
fi

# Check if container is running
if ! docker ps | grep -q juice-website; then
  echo "⚠ Container is not running. Starting container..."
  docker-compose up -d
  echo "Waiting for container to start..."
  sleep 10
  
  # Check again
  if ! docker ps | grep -q juice-website; then
    echo "❌ Failed to start container. Check logs:"
    docker-compose logs
    exit 1
  fi
fi

echo "✓ Docker container is running"
echo ""

# Check if database already exists
if docker exec juice-website sh -c 'test -f /app/data/juice_website.db' 2>/dev/null; then
  echo "⚠ Database already exists at /app/data/juice_website.db"
  read -p "Do you want to reinitialize? This will DELETE existing data! (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
  fi
  echo "Removing existing database..."
  docker exec juice-website sh -c 'rm -f /app/data/juice_website.db'
fi

# Ensure data directory exists and is writable
echo "1. Ensuring data directory exists and is writable..."
docker exec juice-website sh -c 'mkdir -p /app/data && chmod 777 /app/data' || {
  echo "⚠ Failed to set permissions, trying with root..."
  docker exec -u root juice-website sh -c 'mkdir -p /app/data && chmod 777 /app/data'
}

echo ""
echo "2. Initializing database tables..."
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js || {
  echo "❌ Database initialization failed!"
  echo "Checking container logs..."
  docker logs juice-website --tail 20
  exit 1
}

echo ""
echo "3. Creating admin user..."
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/create-admin.js || {
  echo "⚠ Admin creation failed (may already exist)"
}

echo ""
echo "4. Verifying database..."
docker exec juice-website sh -c 'ls -lh /app/data/juice_website.db && echo "✓ Database file exists"'

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  IMPORTANT: Change the password after first login!"
echo ""
echo "=========================================="
