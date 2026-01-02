#!/bin/sh
set -e

# Fix permissions for data directory
# This ensures the nextjs user (UID 1001) can write to mounted volumes
echo "🔧 Fixing permissions for mounted volumes..."

# Ensure directories exist
mkdir -p /app/data /app/public/uploads

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

# Switch to nextjs user if we're root
if [ "$(id -u)" = "0" ]; then
  echo "🔄 Switching to nextjs user..."
  exec su-exec nextjs "$@"
else
  echo "▶️  Starting application..."
  exec "$@"
fi

