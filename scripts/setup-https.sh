#!/bin/bash
# Setup HTTPS with SSL certificates
# Run this on your server: sudo bash scripts/setup-https.sh

set -e

echo "=========================================="
echo "HTTPS Setup Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠ This script needs to be run as root (use sudo)"
  exit 1
fi

# Create SSL directory
mkdir -p /etc/nginx/ssl
chmod 700 /etc/nginx/ssl

echo "Choose SSL certificate setup method:"
echo "1. Use existing certificates (cert.pem and key.pem)"
echo "2. Generate self-signed certificate (for testing)"
echo "3. Use Let's Encrypt (certbot - recommended for production)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
  1)
    echo ""
    echo "Please place your SSL certificates at:"
    echo "  /etc/nginx/ssl/cert.pem"
    echo "  /etc/nginx/ssl/key.pem"
    echo ""
    read -p "Press Enter after placing the certificates..."
    
    if [ ! -f "/etc/nginx/ssl/cert.pem" ] || [ ! -f "/etc/nginx/ssl/key.pem" ]; then
      echo "❌ Certificate files not found!"
      exit 1
    fi
    
    chmod 600 /etc/nginx/ssl/key.pem
    chmod 644 /etc/nginx/ssl/cert.pem
    echo "✓ Certificates found and permissions set"
    ;;
    
  2)
    echo ""
    echo "Generating self-signed certificate (valid for 365 days)..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/key.pem \
      -out /etc/nginx/ssl/cert.pem \
      -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    
    chmod 600 /etc/nginx/ssl/key.pem
    chmod 644 /etc/nginx/ssl/cert.pem
    echo "✓ Self-signed certificate generated"
    echo "⚠ Warning: Self-signed certificates will show security warnings in browsers"
    ;;
    
  3)
    echo ""
    echo "Setting up Let's Encrypt with certbot..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
      echo "Installing certbot..."
      apt-get update
      apt-get install -y certbot python3-certbot-nginx
    fi
    
    read -p "Enter your domain name (e.g., example.com): " domain
    read -p "Enter your email address: " email
    
    if [ -z "$domain" ] || [ -z "$email" ]; then
      echo "❌ Domain and email are required!"
      exit 1
    fi
    
    echo ""
    echo "Obtaining certificate from Let's Encrypt..."
    certbot certonly --standalone -d "$domain" -d "www.$domain" --email "$email" --agree-tos --non-interactive || {
      echo "❌ Failed to obtain certificate"
      echo "Make sure:"
      echo "  1. Domain DNS points to this server"
      echo "  2. Port 80 is accessible from internet"
      echo "  3. No other service is using port 80"
      exit 1
    }
    
    # Create symlinks to Let's Encrypt certificates
    ln -sf /etc/letsencrypt/live/$domain/fullchain.pem /etc/nginx/ssl/cert.pem
    ln -sf /etc/letsencrypt/live/$domain/privkey.pem /etc/nginx/ssl/key.pem
    
    chmod 600 /etc/nginx/ssl/key.pem
    chmod 644 /etc/nginx/ssl/cert.pem
    
    echo "✓ Let's Encrypt certificate obtained"
    echo ""
    echo "Setting up auto-renewal..."
    systemctl enable certbot.timer
    systemctl start certbot.timer
    echo "✓ Auto-renewal configured"
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "=========================================="
echo "Updating Nginx Configuration"
echo "=========================================="
echo ""

# Check if nginx config exists
if [ -f "/etc/nginx/sites-available/juice-website" ]; then
  echo "Updating existing nginx configuration for HTTPS..."
  
  # Create HTTPS-enabled config
  cat > /etc/nginx/sites-available/juice-website << 'NGINX_EOF'
# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name _;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /api/health {
        proxy_pass http://localhost:80/api/health;
        proxy_set_header Host $host;
        access_log off;
    }
}
NGINX_EOF

  echo "✓ Nginx configuration updated"
else
  echo "⚠ Nginx configuration not found. Run the deployment workflow first."
fi

echo ""
echo "Testing Nginx configuration..."
if nginx -t; then
  echo "✓ Nginx configuration is valid"
  echo ""
  echo "Reloading Nginx..."
  systemctl reload nginx
  echo "✓ Nginx reloaded"
else
  echo "❌ Nginx configuration has errors!"
  exit 1
fi

echo ""
echo "=========================================="
echo "HTTPS Setup Complete!"
echo "=========================================="
echo ""
echo "Your website should now be accessible via HTTPS!"
echo ""
echo "To verify:"
echo "  1. Check port 443: sudo netstat -tlnp | grep :443"
echo "  2. Test HTTPS: curl -k https://localhost/api/health"
echo "  3. Check nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""

