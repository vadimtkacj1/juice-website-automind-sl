#!/bin/bash
# Manual deployment script to update images on server

set -e

echo "🚀 Starting manual image deployment..."

# 1. Copy fix-images-correct.sql to server
echo "📄 Copying SQL file to server..."
scp -P 22 fix-images-correct.sql root@your-server-ip:/opt/juice-website/

# 2. Copy all menu images to server
echo "📸 Copying menu images to server..."
scp -P 22 -r public/uploads/menu root@your-server-ip:/opt/juice-website/public/uploads/

# 3. SSH to server and execute commands
echo "🔧 Executing deployment commands on server..."
ssh -p 22 root@your-server-ip << 'REMOTE_COMMANDS'
cd /opt/juice-website

# Copy images to container
echo "📸 Copying images to Docker container..."
docker exec juice-website mkdir -p /app/public/uploads/menu
docker cp public/uploads/menu/. juice-website:/app/public/uploads/menu/
docker exec juice-website chown -R nextjs:nodejs /app/public/uploads/menu

# Update database paths
echo "🔄 Updating database image paths..."
docker exec -i juice-website-mysql mysql -uroot -prootpassword juice_website < fix-images-correct.sql

echo "✅ Images and database updated successfully!"
REMOTE_COMMANDS

echo "✅ Manual deployment completed!"
