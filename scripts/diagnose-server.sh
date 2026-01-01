#!/bin/bash
# Server Diagnostic Script
# Run this on your server to diagnose deployment issues

echo "=========================================="
echo "Server Diagnostic Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠ Running as non-root user. Some checks may require sudo."
fi

echo "1. Checking PM2 installation..."
if command -v pm2 &> /dev/null; then
  echo "✓ PM2 is installed: $(pm2 --version)"
  echo ""
  echo "PM2 Status:"
  pm2 status
  echo ""
  echo "PM2 Processes:"
  pm2 list
  echo ""
  echo "PM2 Logs (last 30 lines):"
  pm2 logs juice-website --lines 30 --nostream 2>/dev/null || echo "No logs found for juice-website"
else
  echo "✗ PM2 is NOT installed"
  echo "Install with: npm install -g pm2"
fi
echo ""

echo "2. Checking Node.js..."
if command -v node &> /dev/null; then
  echo "✓ Node.js is installed: $(node --version)"
  NODE_PATH=$(which node)
  echo "Node path: $NODE_PATH"
  # Check capabilities
  if command -v getcap &> /dev/null; then
    echo "Node capabilities:"
    getcap "$NODE_PATH" || echo "No special capabilities set"
  fi
else
  echo "✗ Node.js is NOT installed"
fi
echo ""

echo "3. Checking application directory..."
APP_DIR="/opt/juice-website"
if [ -d "$APP_DIR" ]; then
  echo "✓ Application directory exists: $APP_DIR"
  cd "$APP_DIR" || exit 1
  echo ""
  echo "Directory contents:"
  ls -la | head -20
  echo ""
  echo "Checking for key files:"
  [ -f "server.js" ] && echo "✓ server.js exists" || echo "✗ server.js NOT found"
  [ -f ".next/standalone/server.js" ] && echo "✓ .next/standalone/server.js exists" || echo "✗ .next/standalone/server.js NOT found"
  [ -f "package.json" ] && echo "✓ package.json exists" || echo "✗ package.json NOT found"
  [ -f ".env" ] && echo "✓ .env exists" || echo "✗ .env NOT found"
  [ -f "juice_website.db" ] && echo "✓ Database exists" || echo "✗ Database NOT found"
  echo ""
  if [ -f ".env" ]; then
    echo ".env file contents (without secrets):"
    grep -v -E "(KEY|SECRET|TOKEN|PASSWORD)" .env | head -10
  fi
else
  echo "✗ Application directory NOT found: $APP_DIR"
fi
echo ""

echo "4. Checking ports..."
echo "Port 80 status:"
sudo netstat -tlnp | grep :80 || sudo ss -tlnp | grep :80 || echo "No process listening on port 80"
echo ""
echo "Port 3000 status:"
sudo netstat -tlnp | grep :3000 || sudo ss -tlnp | grep :3000 || echo "No process listening on port 3000"
echo ""
echo "Processes using port 80:"
sudo lsof -i :80 2>/dev/null || echo "lsof not available or no process found"
echo ""

echo "5. Checking firewall..."
if command -v ufw &> /dev/null; then
  echo "UFW Status:"
  sudo ufw status
else
  echo "UFW not installed"
fi
echo ""

echo "6. Testing local connections..."
echo "Testing http://localhost:80/api/health..."
curl -f http://localhost/api/health 2>/dev/null && echo "✓ Port 80 responding" || echo "✗ Port 80 NOT responding"
echo ""
echo "Testing http://localhost:3000/api/health..."
curl -f http://localhost:3000/api/health 2>/dev/null && echo "✓ Port 3000 responding" || echo "✗ Port 3000 NOT responding"
echo ""

echo "7. Checking system resources..."
echo "Disk space:"
df -h / | tail -1
echo ""
echo "Memory:"
free -h | head -2
echo ""

echo "8. Checking for errors in system logs..."
if [ -f /var/log/syslog ]; then
  echo "Recent errors from syslog:"
  sudo tail -20 /var/log/syslog | grep -i error | tail -5 || echo "No recent errors"
fi
echo ""

echo "=========================================="
echo "Diagnostic Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If PM2 is not installed: npm install -g pm2"
echo "2. If app is not running: cd /opt/juice-website && pm2 start server.js --name juice-website"
echo "3. Check logs: pm2 logs juice-website"
echo "4. Check status: pm2 status"
echo "5. If port 80 needs capabilities: sudo setcap 'cap_net_bind_service=+ep' \$(which node)"
echo ""

