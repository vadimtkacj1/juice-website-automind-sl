#!/bin/bash
# Nginx Setup Script
# Run this on your server to configure Nginx for the Next.js application

set -e

echo "=========================================="
echo "Nginx Setup for Next.js Application"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠ This script needs to be run as root (use sudo)"
  exit 1
fi

# Configuration file path
CONFIG_FILE="/etc/nginx/sites-available/naturallyrefreshing.store"
ENABLED_LINK="/etc/nginx/sites-enabled/naturallyrefreshing.store"

echo "1. Checking Nginx installation..."
if ! command -v nginx &> /dev/null; then
  echo "Nginx not found. Installing..."
  apt-get update
  apt-get install -y nginx
else
  echo "✓ Nginx is installed"
fi
echo ""

echo "2. Creating Nginx configuration..."
cat > ${CONFIG_FILE} << 'NGINX_EOF'
# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name naturallyrefreshing.store www.naturallyrefreshing.store;
    
    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name naturallyrefreshing.store www.naturallyrefreshing.store;

    # SSL certificates
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase timeouts for Next.js
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Proxy to Docker container on port 80
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
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:80/api/health;
        proxy_set_header Host $host;
        access_log off;
    }
}
NGINX_EOF

echo "✓ Configuration file created: ${CONFIG_FILE}"
echo ""

echo "3. Enabling site..."
# Remove old symlink if exists
rm -f ${ENABLED_LINK}
# Create new symlink
ln -s ${CONFIG_FILE} ${ENABLED_LINK}
echo "✓ Site enabled"
echo ""

echo "4. Testing Nginx configuration..."
if nginx -t; then
  echo "✓ Nginx configuration is valid"
else
  echo "❌ Nginx configuration has errors!"
  exit 1
fi
echo ""

echo "5. Reloading Nginx..."
systemctl reload nginx
echo "✓ Nginx reloaded"
echo ""

echo "6. Checking Nginx status..."
systemctl status nginx --no-pager | head -5
echo ""

echo "=========================================="
echo "Nginx Setup Complete!"
echo "=========================================="
echo ""
echo "Your Next.js application should now be accessible at:"
echo "  https://naturallyrefreshing.store"
echo "  https://www.naturallyrefreshing.store"
echo ""
echo "Make sure:"
echo "1. Docker container is running on port 80"
echo "2. SSL certificates are in /etc/nginx/ssl/"
echo "3. Firewall allows ports 80 and 443"
echo ""

