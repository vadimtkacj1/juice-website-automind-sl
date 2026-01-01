# Quick Fix: SSH Connection Issues

## Step 1: Find Your SSH Port

**On your server, run:**
```bash
# Check SSH configuration
sudo grep "^Port" /etc/ssh/sshd_config

# Or check what port SSH is listening on
sudo netstat -tlnp | grep ssh
# OR
sudo ss -tlnp | grep ssh
```

**Common SSH ports:**
- `22` - Default SSH port
- `2222` - Common alternative
- `2200` - Another common alternative

## Step 2: Update GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Check/Update these secrets:
   - `SSH_HOST` - Your server IP (e.g., `123.45.67.89`)
   - `SSH_PORT` - The port from Step 1 (e.g., `22` or `2222`)
   - `SSH_USER` - Your username (usually `root` or `ubuntu`)
   - `SSH_PRIVATE_KEY` - Your private SSH key

## Step 3: Fix Firewall

**On your server:**

```bash
# Check current firewall status
sudo ufw status

# Allow your SSH port (replace 22 with your actual port)
sudo ufw allow 22/tcp

# If using different port, e.g., 2222:
sudo ufw allow 2222/tcp

# Enable firewall
sudo ufw enable
```

## Step 4: Check Cloud Provider Firewall

**Hetzner Cloud:**
- Server → Firewalls → Add rule: Allow TCP port 22 (or your SSH port)

**AWS:**
- EC2 → Security Groups → Inbound rules → Add SSH (port 22)

**DigitalOcean:**
- Networking → Firewalls → Add inbound rule for SSH

## Step 5: Verify SSH is Running

```bash
# Check SSH service
sudo systemctl status ssh
# OR
sudo systemctl status sshd

# If not running:
sudo systemctl start ssh
sudo systemctl enable ssh
```

## Step 6: Test Connection

**From your local computer:**
```bash
# Test SSH connection
ssh -p 22 your_username@your_server_ip

# If using different port:
ssh -p 2222 your_username@your_server_ip
```

If this works but GitHub Actions doesn't, it's a firewall/IP restriction issue.

## Step 7: Run Diagnostic Script

**On your server:**
```bash
cd /opt/juice-website
chmod +x scripts/check-ssh-ports.sh
bash scripts/check-ssh-ports.sh
```

This will show you exactly what port SSH is using and what needs to be fixed.

## Common Mistakes

1. ❌ **SSH_PORT secret not set** - GitHub Actions uses port 22 by default
2. ❌ **Wrong port in SSH_PORT** - Must match server's actual SSH port
3. ❌ **Firewall blocking port** - Both server firewall AND cloud firewall
4. ❌ **SSH service not running** - Check with `systemctl status ssh`

## Still Not Working?

1. **Check if you can SSH from your computer** - If yes, it's a GitHub Actions IP issue
2. **Try allowing all IPs temporarily** - `sudo ufw allow from 0.0.0.0 to any port 22`
3. **Check server logs** - `sudo tail -f /var/log/auth.log` while deployment runs
4. **Contact hosting provider** - They may have additional firewall rules

