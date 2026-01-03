#!/bin/bash
# Script to migrate database from /app/juice_website.db to /app/data/juice_website.db
# Run this on your server

echo "=========================================="
echo "🔧 Database Path Migration Script"
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

# Check if old database exists
echo "1. Checking for old database location..."
if docker exec juice-website sh -c 'test -f /app/juice_website.db'; then
    echo "   Found database at /app/juice_website.db"
    OLD_DB_SIZE=$(docker exec juice-website sh -c 'ls -lh /app/juice_website.db | awk "{print \$5}"')
    echo "   Size: $OLD_DB_SIZE"
    
    # Check if new database exists
    if docker exec juice-website sh -c 'test -f /app/data/juice_website.db'; then
        echo "   ⚠️  Database also exists at /app/data/juice_website.db"
        NEW_DB_SIZE=$(docker exec juice-website sh -c 'ls -lh /app/data/juice_website.db | awk "{print \$5}"')
        echo "   Size: $NEW_DB_SIZE"
        
        # Check which has more data
        OLD_COUNT=$(docker exec juice-website sh -c 'sqlite3 /app/juice_website.db "SELECT COUNT(*) FROM menu_categories;"' 2>/dev/null || echo "0")
        NEW_COUNT=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM menu_categories;"' 2>/dev/null || echo "0")
        
        echo "   Old DB categories: $OLD_COUNT"
        echo "   New DB categories: $NEW_COUNT"
        
        if [ "$OLD_COUNT" -gt "$NEW_COUNT" ]; then
            echo "   📋 Old database has more data, copying to new location..."
            docker exec juice-website sh -c 'cp /app/juice_website.db /app/data/juice_website.db'
            echo "   ✅ Copied old database to new location"
        else
            echo "   ✅ New database already has data, keeping it"
        fi
    else
        echo "   📋 Copying database to correct location..."
        docker exec juice-website sh -c 'mkdir -p /app/data && cp /app/juice_website.db /app/data/juice_website.db'
        echo "   ✅ Database copied to /app/data/juice_website.db"
    fi
    
    # Verify copy
    if docker exec juice-website sh -c 'test -f /app/data/juice_website.db'; then
        echo "   ✅ Verified: Database exists at /app/data/juice_website.db"
    else
        echo "   ❌ Failed to copy database!"
        exit 1
    fi
else
    echo "   ℹ️  No database found at /app/juice_website.db"
fi

echo ""
echo "2. Checking new database location..."
if docker exec juice-website sh -c 'test -f /app/data/juice_website.db'; then
    echo "   ✅ Database exists at /app/data/juice_website.db"
    DB_SIZE=$(docker exec juice-website sh -c 'ls -lh /app/data/juice_website.db | awk "{print \$5}"')
    echo "   Size: $DB_SIZE"
    
    # Check data counts
    CAT_COUNT=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM menu_categories;"' 2>/dev/null || echo "0")
    ITEM_COUNT=$(docker exec juice-website sh -c 'sqlite3 /app/data/juice_website.db "SELECT COUNT(*) FROM menu_items;"' 2>/dev/null || echo "0")
    
    echo "   Categories: $CAT_COUNT"
    echo "   Items: $ITEM_COUNT"
    
    if [ "$CAT_COUNT" = "0" ] || [ "$ITEM_COUNT" = "0" ]; then
        echo ""
        echo "   ⚠️  Database is empty or missing data!"
        echo "   Seeding database..."
        docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-menu.js
        docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-locations.js
        docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-contacts.js
        echo "   ✅ Seeding complete"
    fi
else
    echo "   ❌ Database not found at /app/data/juice_website.db"
    echo "   Initializing new database..."
    docker exec juice-website sh -c 'mkdir -p /app/data'
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/create-admin.js
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-menu.js
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-locations.js
    docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/seed-contacts.js
    echo "   ✅ Database initialized and seeded"
fi

echo ""
echo "3. Verifying environment variable..."
ENV_PATH=$(docker exec juice-website sh -c 'echo $DATABASE_PATH' || echo "not set")
echo "   DATABASE_PATH in container: $ENV_PATH"

if [ "$ENV_PATH" != "/app/data/juice_website.db" ]; then
    echo "   ⚠️  DATABASE_PATH is not set correctly!"
    echo "   💡 Restart container to apply environment variable:"
    echo "      docker-compose restart"
else
    echo "   ✅ DATABASE_PATH is set correctly"
fi

echo ""
echo "=========================================="
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Restart container to ensure DATABASE_PATH is applied:"
echo "   docker-compose restart"
echo ""
echo "2. Verify the API works:"
echo "   curl https://naturallyrefreshing.store/api/debug-db"
echo ""
echo "=========================================="

