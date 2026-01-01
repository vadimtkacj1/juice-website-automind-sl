#!/bin/bash
# Check HTTPS/SSL Configuration
# Run this on your server to diagnose HTTPS issues

echo "=========================================="
echo "HTTPS/SSL Diagnostic Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠ Some checks require root (use sudo)"
fi

echo "1. Checking Nginx status..."
if systemctl is-active --quiet nginx; then
  echo "✓ Nginx is running"
else
  echo "✗ Nginx is NOT running"
  echo "  Start with: sudo systemctl start nginx"
fi
echo ""

echo "2. Checking Nginx configuration..."
if sudo nginx -t 2>&1; then
  echo "✓ Nginx configuration is valid"
else
  echo "✗ Nginx configuration has errors!"
fi
echo ""

echo "3. Checking SSL certificates..."
if [ -f "/etc/nginx/ssl/cert.pem" ]; then
  echo "✓ SSL certificate file exists"
  sudo ls -lh /etc/nginx/ssl/cert.pem
  echo ""
  echo "Certificate details:"
  sudo openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout | grep -E "Subject:|Issuer:|Not Before|Not After" | head -4
else
  echo "✗ SSL certificate NOT found: /etc/nginx/ssl/cert.pem"
fi
echo ""

if [ -f "/etc/nginx/ssl/key.pem" ]; then
  echo "✓ SSL key file exists"
  sudo ls -lh /etc/nginx/ssl/key.pem
else
  echo "✗ SSL key NOT found: /etc/nginx/ssl/key.pem"
fi
echo ""

echo "4. Checking if port 443 is listening..."
if sudo netstat -tlnp | grep :443 > /dev/null 2>&1; then
  echo "✓ Port 443 is listening"
  sudo netstat -tlnp | grep :443
elif sudo ss -tlnp | grep :443 > /dev/null 2>&1; then
  echo "✓ Port 443 is listening"
  sudo ss -tlnp | grep :443
else
  echo "✗ Port 443 is NOT listening!"
  echo "  Nginx may not be configured for HTTPS"
fi
echo ""

echo "5. Checking Nginx error logs..."
echo "Recent errors:"
sudo tail -20 /var/log/nginx/error.log | grep -i ssl || sudo tail -20 /var/log/nginx/error.log | tail -5
echo ""

echo "6. Checking firewall for port 443..."
if command -v ufw &> /dev/null; then
  if sudo ufw status | grep -q "443/tcp"; then
    echo "✓ Port 443 is allowed in UFW"
    sudo ufw status | grep 443
  else
    echo "✗ Port 443 is NOT allowed in UFW"
    echo "  Fix with: sudo ufw allow 443/tcp"
  fi
else
  echo "UFW not installed"
fi
echo ""

echo "7. Testing HTTPS connection locally..."
if curl -k https://localhost 2>&1 | head -5; then
  echo "✓ HTTPS responds locally"
else
  echo "✗ HTTPS does NOT respond locally"
fi
echo ""

echo "8. Checking Nginx site configuration..."
if [ -f "/etc/nginx/sites-available/naturallyrefreshing.store" ]; then
  echo "✓ Site config exists"
  echo "Checking for SSL configuration:"
  sudo grep -E "listen.*443|ssl_certificate" /etc/nginx/sites-available/naturallyrefreshing.store | head -5
else
  echo "✗ Site config NOT found"
fi
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "Common HTTPS issues:"
echo "1. SSL certificates missing or invalid"
echo "2. Port 443 not allowed in firewall"
echo "3. Nginx not listening on port 443"
echo "4. SSL certificate path wrong in config"
echo ""
echo "Quick fixes:"
echo "1. Allow port 443: sudo ufw allow 443/tcp"
echo "2. Check SSL certs: sudo ls -la /etc/nginx/ssl/"
echo "3. Test config: sudo nginx -t"
echo "4. Reload Nginx: sudo systemctl reload nginx"
echo "5. Check logs: sudo tail -f /var/log/nginx/error.log"
echo ""

