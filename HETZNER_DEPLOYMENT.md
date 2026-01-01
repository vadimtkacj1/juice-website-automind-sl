# Hetzner Deployment Guide

This guide explains how to set up your GitHub Actions CI/CD pipeline to deploy to a Hetzner server.

## Prerequisites

1. A Hetzner Cloud server (or dedicated server) with:
   - Docker installed
   - Docker Compose installed
   - SSH access configured

2. A GitHub repository with Actions enabled

## Step 1: Prepare Your Hetzner Server

### 1.1 Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
```

### 1.2 Create Application Directory

```bash
# Create directory for your application
sudo mkdir -p /opt/juice-website
sudo chown $USER:$USER /opt/juice-website
cd /opt/juice-website
```

### 1.3 Set Up Docker Compose

Copy your `docker-compose.yml` file to the server and create necessary directories:

```bash
# Create data directories
mkdir -p data public/uploads

# Copy docker-compose.yml to the server
# You can do this via SCP or by cloning the repo temporarily
```

### 1.4 Create Environment File

Create a `.env` file in `/opt/juice-website` with your environment variables:

```bash
nano /opt/juice-website/.env
```

Add the following (replace with your actual values):

```env
PORT=3000
NODE_ENV=production
RAPYD_ACCESS_KEY=your_rapyd_access_key
RAPYD_SECRET_KEY=your_rapyd_secret_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_SERVICE_URL=http://localhost:3001
TELEGRAM_SERVICE_PORT=3001
SESSION_SECRET=your_secure_random_session_secret
DATABASE_PATH=/app/data/juice_website.db
GITHUB_REPOSITORY=your-username/your-repo-name
```

**Important:** Generate a secure `SESSION_SECRET`:
```bash
openssl rand -base64 32
```

### 1.5 Generate SSH Key for GitHub Actions

```bash
# On your local machine or Hetzner server, generate an SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/hetzner_deploy

# Copy the public key to Hetzner server's authorized_keys
ssh-copy-id -i ~/.ssh/hetzner_deploy.pub your-user@your-hetzner-ip

# Or manually add it:
cat ~/.ssh/hetzner_deploy.pub | ssh your-user@your-hetzner-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Save the private key** (`~/.ssh/hetzner_deploy`) - you'll need it for GitHub Secrets.

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Required Secrets:

1. **SSH_PRIVATE_KEY**
   - Value: The content of your private SSH key (`~/.ssh/hetzner_deploy`)
   - Get it with: `cat ~/.ssh/hetzner_deploy`
   - Include the entire key including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`

2. **SSH_USER**
   - Value: Your SSH username (e.g., `root`, `ubuntu`, `admin`)

3. **SSH_HOST**
   - Value: Your Hetzner server IP address or domain name (e.g., `123.45.67.89` or `yourdomain.com`)

4. **GHCR_TOKEN**
   - Value: A GitHub Personal Access Token (PAT) with `read:packages` permission
   - Create one at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Required scopes: `read:packages`

5. **GHCR_USER** (Optional)
   - Value: Your GitHub username
   - If not set, defaults to the workflow actor

6. **DEPLOYMENT_URL**
   - Value: Your application URL (e.g., `https://yourdomain.com` or `http://123.45.67.89:3000`)

### Optional Secrets:

7. **APP_PATH** (Optional)
   - Value: Path to your application on the server
   - Default: `/opt/juice-website`
   - Only set if you're using a different path

## Step 3: Configure GitHub Container Registry Permissions

1. Go to your repository → Settings → Actions → General
2. Under "Workflow permissions", ensure "Read and write permissions" is selected
3. Under "Packages", ensure the repository can publish packages

## Step 4: Update docker-compose.yml on Server

Make sure your `docker-compose.yml` on the server uses the correct image name. The workflow will use:
```
ghcr.io/your-username/your-repo-name:latest
```

Update the `docker-compose.yml` on your server to match:

```yaml
services:
  nextjs-app:
    image: ghcr.io/your-username/your-repo-name:latest
    # ... rest of config
```

## Step 5: Test the Deployment

1. Push a commit to your `main` or `master` branch
2. Go to your repository → Actions tab
3. Watch the workflow run
4. Check the "Deploy to Hetzner" job for any errors

## Step 6: Verify Deployment

After deployment, verify your application is running:

```bash
# SSH into your Hetzner server
ssh your-user@your-hetzner-ip

# Check if container is running
cd /opt/juice-website
docker-compose ps

# Check logs
docker-compose logs -f nextjs-app

# Test health endpoint
curl http://localhost:3000/api/health
```

## Troubleshooting

### SSH Connection Issues

- Verify SSH key is correctly added to GitHub Secrets as `SSH_PRIVATE_KEY` (include full key with headers)
- Check that the public key is in `~/.ssh/authorized_keys` on the server
- Test SSH connection manually: `ssh -i ~/.ssh/hetzner_deploy your-user@your-hetzner-ip`

### Docker Login Issues

- Verify `GHCR_TOKEN` has `read:packages` permission
- Check that the repository package is set to public or the token has access
- Test login manually: `echo "your-token" | docker login ghcr.io -u your-username --password-stdin`

### Container Not Starting

- Check Docker Compose logs: `docker-compose logs nextjs-app`
- Verify environment variables in `.env` file
- Ensure database directory has correct permissions: `chmod -R 755 /opt/juice-website/data`

### Image Pull Issues

- Verify image was pushed successfully in GitHub Actions
- Check image exists: `docker images | grep ghcr.io`
- Ensure network connectivity on server

## Security Best Practices

1. **Use a dedicated SSH key** for deployments (not your personal key)
2. **Restrict SSH access** by IP if possible
3. **Use strong SESSION_SECRET** (generate with `openssl rand -base64 32`)
4. **Keep secrets secure** - never commit them to the repository
5. **Use environment-specific secrets** for different environments
6. **Regularly rotate** your GitHub PAT and SSH keys
7. **Enable firewall** on Hetzner server (only allow necessary ports)

## Firewall Configuration

If you have a firewall enabled, make sure to allow:

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow your application port (if exposed directly)
sudo ufw allow 3000/tcp

# Or if using a reverse proxy
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

## Optional: Set Up Reverse Proxy (Nginx)

If you want to use a domain name with SSL:

1. Install Nginx: `sudo apt install nginx`
2. Install Certbot: `sudo apt install certbot python3-certbot-nginx`
3. Configure Nginx to proxy to your app on port 3000
4. Set up SSL: `sudo certbot --nginx -d yourdomain.com`

## Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Review server logs: `docker-compose logs`
3. Verify all secrets are correctly set in GitHub
4. Test each step manually on the server

