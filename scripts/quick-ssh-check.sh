#!/bin/bash
# Quick SSH Port Check
# Run this on your server

echo "=========================================="
echo "Quick SSH Port Check"
echo "=========================================="
echo ""

echo "1. SSH Configuration:"
SSH_PORT=$(grep -E "^Port" /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}' | head -1)
if [ -z "$SSH_PORT" ]; then
  SSH_PORT="22 (default - no Port line in config)"
fi
echo "   SSH Port: $SSH_PORT"
echo ""

echo "2. Checking if SSH is listening:"
if sudo netstat -tlnp | grep -E ':22.*ssh' > /dev/null 2>&1; then
  echo "   ✓ SSH is listening on port 22"
  sudo netstat -tlnp | grep -E ':22.*ssh'
elif sudo ss -tlnp | grep -E ':22.*ssh' > /dev/null 2>&1; then
  echo "   ✓ SSH is listening on port 22"
  sudo ss -tlnp | grep -E ':22.*ssh'
else
  echo "   ✗ SSH is NOT listening on port 22"
  echo "   Checking all SSH processes:"
  sudo netstat -tlnp | grep ssh || sudo ss -tlnp | grep ssh || echo "   No SSH ports found"
fi
echo ""

echo "3. SSH Service Status:"
if systemctl is-active --quiet ssh; then
  echo "   ✓ SSH service is running"
elif systemctl is-active --quiet sshd; then
  echo "   ✓ SSHD service is running"
else
  echo "   ✗ SSH service is NOT running"
  echo "   Start with: sudo systemctl start ssh"
fi
echo ""

echo "4. Firewall Status (UFW):"
if command -v ufw &> /dev/null; then
  echo "   UFW Status:"
  sudo ufw status | head -5
  echo ""
  echo "   Checking if port 22 is allowed:"
  if sudo ufw status | grep -E "22/tcp|22/udp" > /dev/null; then
    echo "   ✓ Port 22 is allowed in UFW"
    sudo ufw status | grep -E "22/tcp|22/udp"
  else
    echo "   ✗ Port 22 is NOT explicitly allowed"
    echo "   Fix with: sudo ufw allow 22/tcp"
  fi
else
  echo "   UFW not installed"
fi
echo ""

echo "5. Server IP Addresses:"
echo "   $(hostname -I 2>/dev/null || ip addr show | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 | head -1)"
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo "SSH Port: 22 (default)"
echo ""
echo "For GitHub Actions, make sure:"
echo "1. SSH_PORT secret is set to: 22 (or leave empty for default)"
echo "2. Run: sudo ufw allow 22/tcp"
echo "3. Check cloud provider firewall allows port 22"
echo ""

