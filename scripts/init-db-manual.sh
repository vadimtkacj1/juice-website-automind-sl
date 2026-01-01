#!/bin/bash
# Manual Database Initialization Script
# Run this on your server to initialize the database manually
# Usage: sudo bash scripts/init-db-manual.sh

set -e

echo "=========================================="
echo "Manual Database Initialization"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠ This script needs to be run as root (use sudo)"
  exit 1
fi

# Check if container is running
if ! docker ps | grep -q juice-website; then
  echo "❌ Container 'juice-website' is not running!"
  echo "Please start the container first:"
  echo "  cd /opt/juice-website"
  echo "  docker-compose up -d"
  exit 1
fi

echo "✓ Container is running"
echo ""

# Create data directory if it doesn't exist
echo "1. Creating data directory..."
mkdir -p /opt/juice-website/data
chmod 755 /opt/juice-website/data
echo "✓ Data directory ready"
echo ""

# Copy scripts to container
echo "2. Copying scripts to container..."
if docker cp /opt/juice-website/scripts juice-website:/app/scripts 2>/dev/null; then
  echo "✓ Scripts copied"
else
  echo "⚠ Could not copy scripts (may already exist)"
fi
echo ""

# Create data directory in container
echo "3. Creating data directory in container..."
docker exec juice-website mkdir -p /app/data 2>/dev/null || true
echo "✓ Data directory created in container"
echo ""

# Initialize database
echo "4. Initializing database..."
if docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js 2>/dev/null; then
  echo "✓ Database initialized successfully!"
else
  echo "⚠ Initialization failed, trying alternative method..."
  # Create database file first
  docker exec juice-website touch /app/data/juice_website.db 2>/dev/null || true
  docker exec juice-website chmod 666 /app/data/juice_website.db 2>/dev/null || true
  # Try again
  if docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js 2>/dev/null; then
    echo "✓ Database initialized (alternative method)!"
  else
    echo "❌ Database initialization failed!"
    echo "Check container logs: docker logs juice-website"
    exit 1
  fi
fi
echo ""

# Create admin user
echo "5. Creating admin user..."
if docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/create-admin.js 2>/dev/null; then
  echo "✓ Admin user created!"
else
  echo "⚠ Admin creation failed or admin already exists"
fi
echo ""

# Verify database exists
echo "6. Verifying database..."
if [ -f "/opt/juice-website/data/juice_website.db" ]; then
  echo "✓ Database file exists: /opt/juice-website/data/juice_website.db"
  ls -lh /opt/juice-website/data/juice_website.db
else
  echo "⚠ Database file not found on host (may be only in container)"
fi
echo ""

echo "=========================================="
echo "✅ Database Initialization Complete!"
echo "=========================================="
echo ""
echo "You can now access the admin panel at:"
echo "  http://YOUR_SERVER_IP/admin"
echo ""
echo "Default admin credentials (if created):"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠ Please change the default password after first login!"
echo ""

