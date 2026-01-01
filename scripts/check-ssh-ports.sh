#!/bin/bash
# Check SSH Port Configuration
# Run this on your server to find the correct SSH port

echo "=========================================="
echo "SSH Port Diagnostic Script"
echo "=========================================="
echo ""

# Check SSH service status
echo "1. Checking SSH service status..."
if systemctl is-active --quiet ssh; then
  echo "✓ SSH service is running"
elif systemctl is-active --quiet sshd; then
  echo "✓ SSHD service is running"
else
  echo "✗ SSH service is NOT running"
  echo "  Start with: sudo systemctl start ssh"
fi
echo ""

# Check SSH configuration for port
echo "2. Checking SSH port configuration..."
SSH_PORT=$(grep -E "^Port" /etc/ssh/sshd_config 2>/dev/null | awk '{print $2}' | head -1)
if [ -z "$SSH_PORT" ]; then
  SSH_PORT="22 (default)"
  echo "  Using default port: 22"
else
  echo "  Configured port: $SSH_PORT"
fi
echo ""

# Check what ports SSH is actually listening on
echo "3. Checking which ports SSH is listening on..."
echo "  Ports with SSH/sshd processes:"
sudo netstat -tlnp | grep -E 'ssh|sshd' || sudo ss -tlnp | grep -E 'ssh|sshd' || echo "  No SSH ports found"
echo ""

# Check all listening ports
echo "4. All listening ports:"
sudo netstat -tlnp | grep LISTEN | awk '{print $4}' | cut -d: -f2 | sort -n | uniq || \
sudo ss -tlnp | grep LISTEN | awk '{print $4}' | cut -d: -f2 | sort -n | uniq
echo ""

# Check firewall status
echo "5. Checking firewall status..."
if command -v ufw &> /dev/null; then
  echo "  UFW Status:"
  sudo ufw status | head -10
  echo ""
  echo "  Checking if SSH port is allowed:"
  if [ "$SSH_PORT" = "22 (default)" ]; then
    sudo ufw status | grep -E "22/tcp|22/udp" || echo "  ⚠ Port 22 not explicitly allowed"
  else
    sudo ufw status | grep -E "${SSH_PORT}/tcp|${SSH_PORT}/udp" || echo "  ⚠ Port $SSH_PORT not explicitly allowed"
  fi
else
  echo "  UFW not installed"
fi
echo ""

# Check iptables
echo "6. Checking iptables rules for SSH..."
if command -v iptables &> /dev/null; then
  echo "  SSH-related iptables rules:"
  sudo iptables -L -n -v | grep -E "22|ssh" | head -5 || echo "  No SSH-specific rules found"
else
  echo "  iptables not available"
fi
echo ""

# Test SSH connection locally
echo "7. Testing SSH connection locally..."
if command -v ssh &> /dev/null; then
  if [ "$SSH_PORT" = "22 (default)" ]; then
    TEST_PORT=22
  else
    TEST_PORT=$SSH_PORT
  fi
  echo "  Attempting to connect to localhost:$TEST_PORT..."
  timeout 2 ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -p $TEST_PORT localhost "echo 'SSH working'" 2>&1 | head -3 || echo "  ✗ Cannot connect to localhost:$TEST_PORT"
else
  echo "  SSH client not available"
fi
echo ""

# Server IP addresses
echo "8. Server IP addresses:"
hostname -I 2>/dev/null || ip addr show | grep "inet " | awk '{print $2}' | cut -d/ -f1
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "SSH Port: $SSH_PORT"
echo ""
echo "For GitHub Actions, make sure:"
echo "1. SSH_PORT secret is set to: $SSH_PORT"
echo "2. Firewall allows port $SSH_PORT from anywhere (or GitHub IPs)"
echo "3. SSH service is running: sudo systemctl status ssh"
echo ""
echo "To allow SSH port in UFW:"
if [ "$SSH_PORT" = "22 (default)" ]; then
  echo "  sudo ufw allow 22/tcp"
else
  echo "  sudo ufw allow ${SSH_PORT}/tcp"
fi
echo ""

