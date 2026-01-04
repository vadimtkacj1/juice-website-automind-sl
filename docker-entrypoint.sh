#!/bin/sh
set -e

# Fix permissions for data directory
# This ensures the nextjs user (UID 1001) can write to mounted volumes
echo "🔧 Fixing permissions for mounted volumes..."

# Ensure directories exist
mkdir -p /app/data /app/public/uploads

# Set DATABASE_PATH if not set (for consistency)
if [ -z "$DATABASE_PATH" ]; then
  export DATABASE_PATH=/app/data/juice_website.db
  echo "📁 DATABASE_PATH not set, using default: $DATABASE_PATH"
else
  echo "📁 DATABASE_PATH is set to: $DATABASE_PATH"
fi

# Fix ownership and permissions
if [ "$(id -u)" = "0" ]; then
  # Running as root - fix ownership properly
  chown -R nextjs:nodejs /app/data /app/public/uploads 2>/dev/null || true
  chmod -R 755 /app/data /app/public/uploads 2>/dev/null || true
  echo "✓ Permissions fixed (as root)"
else
  # Not root - try to make writable
  chmod -R 777 /app/data /app/public/uploads 2>/dev/null || true
  echo "✓ Permissions fixed (as non-root)"
fi

# Verify data directory is writable
if [ -w /app/data ]; then
  echo "✓ Data directory is writable"
else
  echo "⚠️  Data directory is not writable, attempting to fix..."
  chmod 777 /app/data 2>/dev/null || true
fi

# Switch to nextjs user if we're root
if [ "$(id -u)" = "0" ]; then
  echo "🔄 Switching to nextjs user..."
  exec su-exec nextjs "$@"
else
  echo "▶️  Starting application..."
  exec "$@"
fi

