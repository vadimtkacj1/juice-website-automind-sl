#!/bin/sh
set -e

echo "🗄️  Running database initialization SQL script..."
echo ""

SQL_FILE="/app/init-database.sql"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: SQL file not found at $SQL_FILE"
    exit 1
fi

# Database connection parameters
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
MYSQL_DATABASE="${MYSQL_DATABASE:-juice_website}"

echo "Connecting to MySQL at ${MYSQL_HOST}:${MYSQL_PORT}..."
echo "Database: ${MYSQL_DATABASE}"
echo ""

# Check if we can connect to MySQL
if ! command -v mysql >/dev/null 2>&1; then
    echo "❌ Error: mysql client not found in container"
    echo "Please run this script from the MySQL container or install mysql client"
    echo ""
    echo "Run this command from host machine:"
    echo "docker exec -i juice-website-mysql mysql -u ${MYSQL_USER} -p\${MYSQL_PASSWORD} ${MYSQL_DATABASE} < /app/init-database.sql"
    exit 1
fi

# Execute SQL file
echo "Executing SQL initialization script..."
if [ -n "$MYSQL_PASSWORD" ]; then
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$SQL_FILE"
else
    mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" "$MYSQL_DATABASE" < "$SQL_FILE"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database initialization complete!"
    echo "📝 Database is ready for use"
    echo ""
    echo "Next steps:"
    echo "  1. docker exec -it juice-website npm run create-admin"
    echo "  2. docker exec -it juice-website npm run seed-menu"
else
    echo ""
    echo "❌ Error executing SQL file"
    exit 1
fi
