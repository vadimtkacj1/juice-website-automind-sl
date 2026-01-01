#!/bin/bash
# Quick fix for nginx to proxy to Docker container
# Run this on your server: sudo bash scripts/fix-nginx-now.sh

set -e

echo "=========================================="
echo "Fixing Nginx Configuration"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠ This script needs to be run as root (use sudo)"
  exit 1
fi

# Create nginx config
echo "1. Creating nginx configuration..."
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

cat > /etc/nginx/sites-available/juice-website << 'EOF'
# HTTP server - proxy to Docker container
server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        
        # Headers for Next.js
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
        
        # Don't buffer responses
        proxy_buffering off;
        
        # Increase timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:80/api/health;
        proxy_set_header Host $host;
        access_log off;
    }
}
EOF

echo "✓ Configuration file created"
echo ""

# Disable default nginx site
echo "2. Disabling default nginx site..."
rm -f /etc/nginx/sites-enabled/default
echo "✓ Default site disabled"
echo ""

# Enable our site
echo "3. Enabling juice-website site..."
rm -f /etc/nginx/sites-enabled/juice-website
ln -sf /etc/nginx/sites-available/juice-website /etc/nginx/sites-enabled/juice-website
echo "✓ Site enabled"
echo ""

# Test configuration
echo "4. Testing nginx configuration..."
if nginx -t; then
  echo "✓ Nginx configuration is valid"
else
  echo "❌ Nginx configuration has errors!"
  exit 1
fi
echo ""

# Reload nginx
echo "5. Reloading nginx..."
systemctl reload nginx || service nginx reload
echo "✓ Nginx reloaded"
echo ""

# Check if Docker container is running
echo "6. Checking Docker container..."
if docker ps | grep -q juice-website; then
  echo "✓ Docker container is running"
  docker ps | grep juice-website
else
  echo "⚠ Docker container is NOT running!"
  echo "Please make sure your container is running:"
  echo "  cd /opt/juice-website"
  echo "  docker-compose up -d"
fi
echo ""

# Test connection
echo "7. Testing connection..."
sleep 2
if curl -f http://localhost/api/health 2>/dev/null; then
  echo "✓ Application is responding!"
else
  echo "⚠ Application is not responding on port 80"
  echo "Check container logs: docker logs juice-website"
fi
echo ""

echo "=========================================="
echo "Nginx Configuration Complete!"
echo "=========================================="
echo ""
echo "Your website should now be accessible!"
echo "Try accessing: http://YOUR_SERVER_IP"
echo ""

