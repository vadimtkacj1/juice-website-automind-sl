#!/bin/bash
# Script to fix database issues on server
# This will check and reseed all data if needed

echo "=========================================="
echo "🔧 Server Database Fix Script"
echo "=========================================="
echo ""

# Check if container is running
if ! docker ps | grep -q juice-website; then
    echo "❌ Container is not running!"
    echo "💡 Start it with: docker-compose up -d"
    exit 1
fi

echo "✅ Container is running"
echo ""

# Ensure data directory exists and is writable
echo "1. Ensuring data directory exists and is writable..."
docker exec juice-website sh -c 'mkdir -p /app/data && chmod 777 /app/data' || {
    echo "⚠ Trying with root user..."
    docker exec -u root juice-website sh -c 'mkdir -p /app/data && chmod 777 /app/data'
}

# Check if database exists
if ! docker exec juice-website sh -c 'test -f /app/data/juice_website.db'; then
    echo "2. Database not found, initializing..."
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js || {
        echo "❌ Database initialization failed!"
        exit 1
    }
    echo "✅ Database initialized"
else
    echo "2. Database exists, checking structure..."
    docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db ".tables"' || {
        echo "⚠ Database might be corrupted, reinitializing..."
        docker exec juice-website sh -c 'rm -f /app/data/juice_website.db'
        docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js
    }
fi

echo ""
echo "3. Checking current data counts..."
MENU_CATS=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM menu_categories WHERE is_active = 1;"' 2>/dev/null || echo "0")
MENU_ITEMS=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM menu_items WHERE is_available = 1;"' 2>/dev/null || echo "0")
LOCATIONS=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM locations WHERE is_active = 1;"' 2>/dev/null || echo "0")
CONTACTS=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM contacts;"' 2>/dev/null || echo "0")

echo "   Menu Categories: $MENU_CATS"
echo "   Menu Items: $MENU_ITEMS"
echo "   Locations: $LOCATIONS"
echo "   Contacts: $CONTACTS"

echo ""
echo "4. Seeding missing data..."

# Seed menu if needed
if [ "$MENU_CATS" = "0" ] || [ "$MENU_ITEMS" = "0" ] || [ "$MENU_ITEMS" -lt "10" ]; then
    echo "   Seeding menu data..."
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-menu.js || echo "⚠ Menu seeding had issues"
else
    echo "   ✅ Menu data exists"
fi

# Seed locations if needed
if [ "$LOCATIONS" = "0" ]; then
    echo "   Seeding locations..."
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-locations.js || echo "⚠ Locations seeding had issues"
else
    echo "   ✅ Locations exist"
fi

# Seed contacts if needed
if [ "$CONTACTS" = "0" ]; then
    echo "   Seeding contacts..."
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-contacts.js || echo "⚠ Contacts seeding had issues"
else
    echo "   ✅ Contacts exist"
fi

# Create admin if needed
ADMINS=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM admins;"' 2>/dev/null || echo "0")
if [ "$ADMINS" = "0" ]; then
    echo "   Creating admin user..."
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/create-admin.js || echo "⚠ Admin creation had issues"
else
    echo "   ✅ Admin user exists"
fi

echo ""
echo "5. Verifying final counts..."
MENU_CATS_FINAL=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM menu_categories WHERE is_active = 1;"' 2>/dev/null || echo "0")
MENU_ITEMS_FINAL=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM menu_items WHERE is_available = 1;"' 2>/dev/null || echo "0")
LOCATIONS_FINAL=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM locations WHERE is_active = 1;"' 2>/dev/null || echo "0")
CONTACTS_FINAL=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM contacts;"' 2>/dev/null || echo "0")

echo "   Menu Categories: $MENU_CATS_FINAL"
echo "   Menu Items: $MENU_ITEMS_FINAL"
echo "   Locations: $LOCATIONS_FINAL"
echo "   Contacts: $CONTACTS_FINAL"

echo ""
echo "=========================================="
if [ "$MENU_CATS_FINAL" -gt "0" ] && [ "$MENU_ITEMS_FINAL" -gt "0" ]; then
    echo "✅ Database fix complete!"
else
    echo "⚠️  Some data might still be missing. Check logs above."
fi
echo "=========================================="

