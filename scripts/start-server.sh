#!/bin/bash
# Manual server start script
# Run this on your server to manually start the application

set -e

APP_DIR="/opt/juice-website"
cd "$APP_DIR" || { echo "Error: Cannot access $APP_DIR"; exit 1; }

echo "=========================================="
echo "Starting Juice Website Application"
echo "=========================================="
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Installing..."
  npm install -g pm2
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠ Warning: .env file not found!"
  echo "Creating basic .env file..."
  cat > .env << EOF
NODE_ENV=production
PORT=80
HOSTNAME=0.0.0.0
DATABASE_PATH=./juice_website.db
EOF
  echo "⚠ Please update .env with your actual secrets!"
fi

# Load environment variables
set -a
source .env
set +a

# Set capabilities for port 80
NODE_PATH=$(which node)
if [ -n "$NODE_PATH" ] && [ "$PORT" = "80" ]; then
  echo "Setting capabilities for port 80..."
  sudo setcap 'cap_net_bind_service=+ep' "$NODE_PATH" || echo "⚠ setcap failed (may need to run as root)"
fi

# Stop existing process
echo "Stopping existing PM2 process..."
pm2 stop juice-website || true
pm2 delete juice-website || true

# Start application
echo ""
echo "Starting application..."

if [ -f "server.js" ]; then
  echo "✓ Using server.js"
  PORT=${PORT:-80} HOSTNAME=${HOSTNAME:-0.0.0.0} pm2 start server.js --name juice-website --update-env
elif [ -f ".next/standalone/server.js" ]; then
  echo "✓ Using .next/standalone/server.js"
  PORT=${PORT:-80} HOSTNAME=${HOSTNAME:-0.0.0.0} pm2 start .next/standalone/server.js --name juice-website --update-env
elif [ -f "package.json" ]; then
  echo "✓ Using npm start"
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --production --omit=dev || npm install --production --omit=dev
  fi
  PORT=${PORT:-80} HOSTNAME=${HOSTNAME:-0.0.0.0} pm2 start npm --name juice-website -- start --update-env
else
  echo "❌ ERROR: No server.js, .next/standalone/server.js, or package.json found!"
  echo "Current directory: $(pwd)"
  echo "Files:"
  ls -la
  exit 1
fi

# Save PM2 configuration
pm2 save

# Wait a moment
sleep 5

# Check status
echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "Testing server..."
sleep 3
if curl -f http://localhost:${PORT:-80}/api/health 2>/dev/null; then
  echo "✓ Server is responding!"
else
  echo "⚠ Server not responding. Check logs: pm2 logs juice-website"
fi

echo ""
echo "=========================================="
echo "Startup Complete"
echo "=========================================="
echo ""
echo "Useful commands:"
echo "  View logs: pm2 logs juice-website"
echo "  Check status: pm2 status"
echo "  Restart: pm2 restart juice-website"
echo "  Stop: pm2 stop juice-website"
echo ""

