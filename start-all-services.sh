#!/bin/sh
set -e

echo "🚀 Starting Juice Website services..."

# Start Next.js server
echo "▶️  Starting Next.js server..."
exec node server.js
