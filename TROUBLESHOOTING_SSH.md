# SSH Connection Troubleshooting Guide

If you're getting `dial tcp ***:22: i/o timeout` errors during deployment, follow these steps:

## Quick Fixes

### 1. Check Server Firewall (UFW)

SSH into your server and run:

```bash
# Check UFW status
sudo ufw status

# Allow SSH (port 22)
sudo ufw allow 22/tcp

# If you changed SSH port, allow that port instead
sudo ufw allow YOUR_SSH_PORT/tcp

# Enable firewall
sudo ufw enable
```

### 2. Check Cloud Provider Firewall

**Hetzner Cloud:**
1. Go to your server in Hetzner Cloud Console
2. Click on "Firewalls" tab
3. Create or edit firewall rules
4. Add rule: Allow TCP port 22 from anywhere (or GitHub Actions IPs)

**AWS:**
1. Go to EC2 → Security Groups
2. Select your server's security group
3. Add inbound rule: SSH (TCP 22) from 0.0.0.0/0 (or specific IPs)

**DigitalOcean:**
1. Go to Networking → Firewalls
2. Add inbound rule: SSH (TCP 22)

### 3. Check SSH Service

On your server:

```bash
# Check if SSH is running
sudo systemctl status ssh
# OR
sudo systemctl status sshd

# Start SSH if not running
sudo systemctl start ssh
sudo systemctl enable ssh
```

### 4. Verify SSH Port

```bash
# Check what port SSH is listening on
sudo netstat -tlnp | grep ssh
# OR
sudo ss -tlnp | grep ssh

# Check SSH config
sudo cat /etc/ssh/sshd_config | grep Port
```

### 5. Test SSH Connection Manually

From your local machine:

```bash
# Test SSH connection
ssh -v -p 22 your_username@your_server_ip

# If using different port
ssh -v -p YOUR_PORT your_username@your_server_ip
```

### 6. Check GitHub Secrets

Verify in GitHub repository settings:
- `SSH_HOST` - Should be your server IP or hostname
- `SSH_PORT` - Should be 22 (or your custom SSH port)
- `SSH_USER` - Should be root, ubuntu, or your username
- `SSH_PRIVATE_KEY` - Should be your private SSH key (starts with `-----BEGIN OPENSSH PRIVATE KEY-----`)

### 7. Allow GitHub Actions IPs (Optional but Recommended)

GitHub Actions uses dynamic IPs. You can:
- Allow all IPs (less secure): `0.0.0.0/0`
- Or use GitHub's IP ranges (more secure): https://api.github.com/meta

To allow GitHub IPs automatically:

```bash
# On your server, create a script to update firewall
cat > /usr/local/bin/update-github-ips.sh << 'EOF'
#!/bin/bash
# Get GitHub Actions IPs
IPS=$(curl -s https://api.github.com/meta | jq -r '.actions[]' | tr '\n' ' ')

# Add to UFW (example - adjust as needed)
for ip in $IPS; do
  sudo ufw allow from $ip to any port 22
done
EOF

chmod +x /usr/local/bin/update-github-ips.sh
```

### 8. Alternative: Use Different SSH Port

If port 22 is blocked, you can use a different port:

1. **On Server:**
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change: Port 22 to Port 2222 (or any port)
Port 2222

# Restart SSH
sudo systemctl restart ssh
```

2. **Update GitHub Secret:**
   - Go to GitHub → Settings → Secrets
   - Update `SSH_PORT` to `2222` (or your chosen port)

3. **Update Firewall:**
```bash
sudo ufw allow 2222/tcp
```

### 9. Check Server Logs

```bash
# Check SSH logs for connection attempts
sudo tail -f /var/log/auth.log
# OR on some systems
sudo tail -f /var/log/secure
```

### 10. Verify Server is Running

```bash
# Check if server is online
ping your_server_ip

# Check if port 22 is open from outside
# Use online tools like: https://www.yougetsignal.com/tools/open-ports/
```

## Common Issues

### Issue: "Connection refused"
**Solution:** SSH service is not running or port is wrong

### Issue: "Connection timeout"
**Solution:** Firewall is blocking the connection

### Issue: "Permission denied"
**Solution:** SSH key is incorrect or user doesn't have access

### Issue: "Host key verification failed"
**Solution:** Add server to known hosts (GitHub Actions does this automatically)

## Testing After Fix

Once you've made changes, test the connection:

```bash
# From GitHub Actions (in workflow)
ssh -o ConnectTimeout=10 -p 22 user@server "echo 'Connected!'"

# Or manually from your computer
ssh user@server
```

## Still Not Working?

1. **Check if you can SSH from your local machine** - If yes, it's a firewall/IP issue
2. **Check server logs** - Look for connection attempts
3. **Try different SSH port** - Some providers block port 22
4. **Contact your hosting provider** - They may have additional firewall rules

## Security Note

While troubleshooting, you might temporarily allow SSH from anywhere (`0.0.0.0/0`). Once working, consider restricting to:
- Your home IP
- GitHub Actions IP ranges
- Specific IPs you trust

