#!/bin/bash
# Script to check and fix database issues on the server
# Run this inside the Docker container or on the server

echo "=========================================="
echo "Server Database Diagnostic Script"
echo "=========================================="
echo ""

# Check if running in Docker
if [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]; then
    echo "🐳 Running inside Docker container"
    DB_PATH="${DATABASE_PATH:-/app/data/juice_website.db}"
else
    echo "🖥️  Running on server"
    DB_PATH="${DATABASE_PATH:-./juice_website.db}"
fi

echo "📁 Database path: $DB_PATH"
echo ""

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database file does not exist!"
    echo "💡 Run: docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/init-database.js"
    exit 1
fi

echo "✅ Database file exists"
echo ""

# Check database connection and tables
echo "🔍 Checking database structure..."
if command -v sqlite3 &> /dev/null; then
    sqlite3 "$DB_PATH" <<EOF
.tables
SELECT COUNT(*) as admin_count FROM admins;
SELECT COUNT(*) as menu_items_count FROM menu_items WHERE is_available = 1;
SELECT COUNT(*) as categories_count FROM menu_categories WHERE is_active = 1;
EOF
else
    echo "⚠️  sqlite3 not available, using Node.js..."
    node -e "
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('$DB_PATH', (err) => {
        if (err) {
            console.error('❌ Error:', err.message);
            process.exit(1);
        }
        console.log('✅ Database connection successful');
        db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
            if (err) {
                console.error('❌ Error:', err.message);
            } else {
                console.log('📊 Admin users:', row.count);
            }
            db.get('SELECT COUNT(*) as count FROM menu_items WHERE is_available = 1', (err, row) => {
                if (err) {
                    console.error('❌ Error:', err.message);
                } else {
                    console.log('📋 Available menu items:', row.count);
                }
                db.close();
            });
        });
    });
    "
fi

echo ""
echo "=========================================="
echo "To fix login issues, run:"
echo "  docker exec -e DATABASE_PATH=/app/data/juice_website.db juice-website node scripts/reset-admin-password.js"
echo "=========================================="

