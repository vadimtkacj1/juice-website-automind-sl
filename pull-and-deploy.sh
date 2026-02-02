#!/bin/bash
# Commands to run on the server to pull changes from GitHub

set -e

echo "🔄 Pulling latest changes from GitHub..."
cd /opt/juice-website

# Pull latest changes including the renamed image files
git pull origin main

echo "📸 Copying menu images to Docker container..."
docker exec juice-website mkdir -p /app/public/uploads/menu
docker cp public/uploads/menu/. juice-website:/app/public/uploads/menu/
docker exec juice-website chown -R nextjs:nodejs /app/public/uploads/menu

echo "🔄 Updating database image paths..."
docker exec -i juice-website-mysql mysql -uroot -prootpassword juice_website < fix-images-correct.sql

echo "✅ All done! Images should now load correctly."
