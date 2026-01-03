#!/bin/bash
# Comprehensive server debugging script
# Run this on your server to diagnose issues

echo "=========================================="
echo "🔍 Server Diagnostic Script"
echo "=========================================="
echo ""

# Check if container is running
echo "1. Checking Docker container status..."
if docker ps | grep -q juice-website; then
    echo "✅ Container is running"
    docker ps | grep juice-website
else
    echo "❌ Container is NOT running!"
    echo "Checking stopped containers:"
    docker ps -a | grep juice-website
    echo ""
    echo "💡 Start container with: docker-compose up -d"
    exit 1
fi

echo ""
echo "2. Checking container logs (last 50 lines)..."
echo "----------------------------------------"
docker logs juice-website --tail 50
echo "----------------------------------------"

echo ""
echo "3. Checking database file..."
if docker exec juice-website sh -c 'test -f /app/data/juice_website.db'; then
    echo "✅ Database file exists"
    docker exec juice-website sh -c 'ls -lh /app/data/juice_website.db'
else
    echo "❌ Database file NOT found!"
    echo "💡 Database should be at: /app/data/juice_website.db"
fi

echo ""
echo "4. Checking database directory permissions..."
docker exec juice-website sh -c 'ls -la /app/ | grep data || echo "Data directory not found"'

echo ""
echo "5. Checking database content..."
echo "----------------------------------------"
echo "Menu Categories:"
docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) as count FROM menu_categories WHERE is_active = 1;"' 2>/dev/null || echo "❌ Cannot query categories"

echo "Menu Items:"
docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) as count FROM menu_items WHERE is_available = 1;"' 2>/dev/null || echo "❌ Cannot query items"

echo "Locations:"
docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) as count FROM locations WHERE is_active = 1;"' 2>/dev/null || echo "❌ Cannot query locations"

echo "Contacts:"
docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) as count FROM contacts;"' 2>/dev/null || echo "❌ Cannot query contacts"

echo "Admins:"
docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) as count FROM admins;"' 2>/dev/null || echo "❌ Cannot query admins"
echo "----------------------------------------"

echo ""
echo "6. Checking environment variables..."
docker exec juice-website sh -c 'echo "DATABASE_PATH: $DATABASE_PATH"'
docker exec juice-website sh -c 'echo "NODE_ENV: $NODE_ENV"'

echo ""
echo "7. Testing API endpoints from inside container..."
echo "----------------------------------------"
echo "Health check:"
docker exec juice-website sh -c 'curl -s http://localhost:80/api/health || echo "❌ Health check failed"'

echo ""
echo "Debug DB endpoint:"
docker exec juice-website sh -c 'curl -s http://localhost:80/api/debug-db | head -20 || echo "❌ Debug DB endpoint failed"'

echo ""
echo "Menu endpoint (first 500 chars):"
docker exec juice-website sh -c 'curl -s http://localhost:80/api/menu | head -c 500 || echo "❌ Menu endpoint failed"'

echo "----------------------------------------"

echo ""
echo "8. Checking if data directory is writable..."
docker exec juice-website sh -c 'test -w /app/data && echo "✅ Directory is writable" || echo "❌ Directory is NOT writable"'

echo ""
echo "=========================================="
echo "📋 Summary"
echo "=========================================="
echo ""
echo "To view live logs:"
echo "  docker logs -f juice-website"
echo ""
echo "To check database manually:"
echo "  docker exec -it juice-website sh -c 'sqlite3 /app/data/juice_website.db \"SELECT * FROM menu_categories;\"'"
echo ""
echo "To reseed database:"
echo "  docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-menu.js"
echo "  docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-locations.js"
echo "  docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-contacts.js"
echo ""
echo "To restart container:"
echo "  docker-compose restart"
echo ""
echo "=========================================="

