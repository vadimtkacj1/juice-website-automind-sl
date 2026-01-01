# Deployment Setup Checklist

Use this checklist to ensure everything is configured correctly for Hetzner deployment.

## ✅ GitHub Secrets Setup

Go to: **Repository → Settings → Secrets and variables → Actions**

- [ ] **SSH_PRIVATE_KEY** - Your private SSH key (full key with headers)
- [ ] **SSH_USER** - SSH username (e.g., `root`, `ubuntu`)
- [ ] **SSH_HOST** - Server IP or domain (e.g., `123.45.67.89`)
- [ ] **GHCR_TOKEN** - GitHub Personal Access Token with `read:packages` scope
- [ ] **DEPLOYMENT_URL** - Your app URL (e.g., `https://yourdomain.com`)
- [ ] **GHCR_USER** (optional) - GitHub username (defaults to workflow actor)
- [ ] **APP_PATH** (optional) - Application path (default: `/opt/juice-website`)

## ✅ Hetzner Server Setup

- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Application directory created (`/opt/juice-website` or custom path)
- [ ] `docker-compose.yml` file copied to server
- [ ] `.env` file created with environment variables
- [ ] Data directories created (`data/`, `public/uploads/`)
- [ ] SSH public key added to server's `~/.ssh/authorized_keys`
- [ ] Firewall configured (ports 22, 3000, or 80/443 if using reverse proxy)

## ✅ GitHub Container Registry

- [ ] Repository packages are enabled
- [ ] Workflow permissions allow package write access
- [ ] Personal Access Token created with `read:packages` scope
- [ ] Token added as `GHCR_TOKEN` secret

## ✅ Environment Variables on Server

Create `.env` file in `/opt/juice-website/` with:

- [ ] `PORT=3000`
- [ ] `NODE_ENV=production`
- [ ] `RAPYD_ACCESS_KEY=...` (if using payments)
- [ ] `RAPYD_SECRET_KEY=...` (if using payments)
- [ ] `TELEGRAM_BOT_TOKEN=...` (if using Telegram)
- [ ] `SESSION_SECRET=...` (generate with `openssl rand -base64 32`)
- [ ] `GITHUB_REPOSITORY=your-username/your-repo-name`
- [ ] `DATABASE_PATH=/app/data/juice_website.db`

## ✅ Docker Compose Configuration

Verify `docker-compose.yml` on server has:

- [ ] Correct image name: `ghcr.io/your-username/your-repo-name:latest`
- [ ] Environment variables configured
- [ ] Volume mounts for `data/` and `public/uploads/`
- [ ] Port mapping configured
- [ ] Network configuration

## ✅ Workflow File

Verify `.github/workflows/ci-cd.yml`:

- [ ] File exists and is committed
- [ ] Uses correct secret names (no `HETZNER_` prefix)
- [ ] Triggers on push to `main` or `master` branch
- [ ] All jobs are properly configured

## ✅ Test Deployment

- [ ] Push a commit to `main` or `master` branch
- [ ] Check GitHub Actions tab for workflow run
- [ ] Verify all jobs complete successfully:
  - [ ] Lint and Test
  - [ ] Build
  - [ ] Build and Push Docker Image
  - [ ] Deploy to Hetzner
- [ ] Check application is running on server:
  ```bash
  ssh user@server "cd /opt/juice-website && docker-compose ps"
  ```
- [ ] Verify health endpoint:
  ```bash
  curl https://yourdomain.com/api/health
  ```

## 🔧 Troubleshooting Commands

If something goes wrong, use these commands:

### Check Docker on Server
```bash
ssh user@server
docker ps
docker images | grep ghcr.io
docker-compose logs nextjs-app
```

### Test SSH Connection
```bash
ssh -i ~/.ssh/your_key user@server
```

### Test GHCR Login
```bash
echo "YOUR_GHCR_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Check GitHub Actions Logs
- Go to: Repository → Actions tab
- Click on the failed workflow run
- Check each job's logs for errors

## 📚 Documentation References

- **Main Deployment Guide:** `HETZNER_DEPLOYMENT.md`
- **GHCR Token Setup:** `SETUP_GHCR_TOKEN.md`
- **This Checklist:** `DEPLOYMENT_CHECKLIST.md`

## ✅ Final Verification

Once everything is checked:

1. [ ] All secrets are set in GitHub
2. [ ] Server is configured and accessible
3. [ ] Docker images are building successfully
4. [ ] Deployment workflow completes without errors
5. [ ] Application is accessible at your domain
6. [ ] Health check endpoint returns 200 OK

## 🎉 Ready to Deploy!

If all items are checked, you're ready! Just push to your main branch and watch the magic happen.

---

**Need Help?** Check the troubleshooting sections in `HETZNER_DEPLOYMENT.md` or review GitHub Actions logs for specific error messages.

