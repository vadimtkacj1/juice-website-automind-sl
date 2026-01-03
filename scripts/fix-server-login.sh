#!/bin/bash
# Script to fix login issues on the server
# This resets the admin password and checks database

echo "=========================================="
echo "Fixing Server Login Issues"
echo "=========================================="
echo ""

# Check if container is running
if ! docker ps | grep -q juice-website; then
    echo "❌ Container 'juice-website' is not running!"
    echo "💡 Start it with: docker-compose up -d"
    exit 1
fi

echo "✅ Container is running"
echo ""

# Check database
echo "1. Checking database..."
docker exec juice-website sh -c 'test -f /app/data/juice_website.db && echo "✅ Database exists" || echo "❌ Database not found"'

echo ""
echo "2. Resetting admin password..."
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/reset-admin-password.js

echo ""
echo "3. Verifying admin user..."
docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/check-db.js

echo ""
echo "=========================================="
echo "✅ Login fix complete!"
echo ""
echo "Try logging in with:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "If login still fails, check server logs:"
echo "  docker logs juice-website --tail 50"
echo "=========================================="

