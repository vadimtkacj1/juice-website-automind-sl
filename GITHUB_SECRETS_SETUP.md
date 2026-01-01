# GitHub Secrets - What to Add

This is a simple list of **exactly what you need to add** to your GitHub repository secrets.

## Where to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret** for each item below

---

## Required Secrets (Add These 3)

### 1. SSH_PRIVATE_KEY

**What it is:** Your private SSH key to access your Hetzner server

**How to get it:**
```bash
# On your local machine, generate SSH key if you haven't:
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/hetzner_deploy

# Copy the PRIVATE key (the one WITHOUT .pub):
cat ~/.ssh/hetzner_deploy
```

**What to add:**
- Copy the ENTIRE output including:
  - `-----BEGIN OPENSSH PRIVATE KEY-----`
  - All the lines in between
  - `-----END OPENSSH PRIVATE KEY-----`

**GitHub Secret Name:** `SSH_PRIVATE_KEY`

---

### 2. SSH_USER

**What it is:** Your SSH username on the Hetzner server

**Common values:**
- `root` (if you login as root)
- `ubuntu` (for Ubuntu servers)
- `admin` (if you created an admin user)
- Or whatever username you use to SSH

**How to find it:**
- It's the username you use when you SSH: `ssh username@your-server-ip`

**GitHub Secret Name:** `SSH_USER`

**Example value:** `root`

---

### 3. SSH_HOST

**What it is:** Your Hetzner server IP address or domain name

**How to find it:**
- Check your Hetzner Cloud dashboard
- Or use the IP/domain you use to SSH: `ssh user@123.45.67.89`

**GitHub Secret Name:** `SSH_HOST`

**Example values:**
- `123.45.67.89` (IP address)
- `yourdomain.com` (domain name)
- `server.yourdomain.com` (subdomain)

---

---

## Optional Secrets (Add If Needed)

### 4. GHCR_TOKEN (Optional)

**What it is:** GitHub Personal Access Token to pull Docker images

**When to add:**
- ✅ **Required for:** Private repositories
- ✅ **Required for:** Pulling private packages
- ⚪ **Not needed for:** Public repositories (can pull without auth)

**How to create it:**
1. Go to: https://github.com/settings/tokens/new
2. **Note:** `Hetzner Deployment`
3. **Expiration:** `90 days` (or your choice)
4. **Scopes:** Check ✅ `read:packages`
5. Click **Generate token**
6. **Copy the token immediately!** (starts with `ghp_`)

**GitHub Secret Name:** `GHCR_TOKEN`

**Example value:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Note:** If you don't add this, the workflow will try to pull without authentication (works for public packages).

---

### 5. DEPLOYMENT_URL (Optional)

**What it is:** Your application's public URL - used for automatic health check after deployment

**Purpose:** Verifies your app is running after deployment by checking `/api/health` endpoint

**When to add:**
- ✅ **Add if:** You want automatic verification that deployment worked
- ✅ **Add if:** Your app is publicly accessible
- ⚪ **Skip if:** App is behind firewall or you prefer manual verification

**GitHub Secret Name:** `DEPLOYMENT_URL`

**Example values:**
- `https://yourdomain.com`
- `http://123.45.67.89:3000` (if using IP directly)
- `https://app.yourdomain.com` (if using subdomain)

**Note:** If you don't add this, deployment still works, but there's no automatic health check. See `DEPLOYMENT_URL_EXPLANATION.md` for details.

---

### 6. GHCR_USER (Optional)

**What it is:** Your GitHub username

**When to add:**
- Only if your GitHub username is different from the repository owner
- Otherwise, it defaults to the workflow actor

**GitHub Secret Name:** `GHCR_USER`

**Example value:** `your-username`

---

### 7. APP_PATH (Optional)

**What it is:** Path where your app is installed on the server

**When to add:**
- Only if you're NOT using `/opt/juice-website`
- Default is `/opt/juice-website`

**GitHub Secret Name:** `APP_PATH`

**Example value:** `/opt/juice-website` or `/home/user/app`

---

## Quick Summary Checklist

**Required secrets (must add):**
- [ ] `SSH_PRIVATE_KEY` - Your private SSH key (full key)
- [ ] `SSH_USER` - SSH username (e.g., `root`)
- [ ] `SSH_HOST` - Server IP or domain

**Optional secrets (add if needed):**
- [ ] `GHCR_TOKEN` - GitHub PAT with `read:packages` (only for private repos)
- [ ] `DEPLOYMENT_URL` - Your app URL (for automatic health check)
- [ ] `GHCR_USER` - GitHub username (only if different from repo owner)
- [ ] `APP_PATH` - Custom app path (only if not `/opt/juice-website`)

---

## Verification

After adding all secrets, verify:

1. Go to: **Repository → Settings → Secrets and variables → Actions**
2. You should see at least the 3 required secrets listed
3. Secret names are **case-sensitive** - make sure they match exactly:
   - ✅ `SSH_PRIVATE_KEY` (correct)
   - ❌ `ssh_private_key` (wrong)
   - ❌ `SSH_PRIVATE_KEY_` (wrong - extra underscore)

---

## Common Mistakes to Avoid

❌ **Wrong:** Adding the public key (`id_rsa.pub`) instead of private key
✅ **Correct:** Add the private key (no `.pub` extension)

❌ **Wrong:** Secret name with typos like `SSH_PRIVTE_KEY`
✅ **Correct:** `SSH_PRIVATE_KEY` (exact spelling)

❌ **Wrong:** Adding token without `read:packages` scope
✅ **Correct:** Token must have `read:packages` permission

❌ **Wrong:** Using `GITHUB_TOKEN` instead of creating PAT
✅ **Correct:** Create a Personal Access Token with `read:packages`

---

## Need Help?

- **SSH Key Issues:** See `HETZNER_DEPLOYMENT.md` section 1.5
- **Token Issues:** See `SETUP_GHCR_TOKEN.md`
- **General Setup:** See `HETZNER_DEPLOYMENT.md`
- **Verification:** See `DEPLOYMENT_CHECKLIST.md`

---

## After Adding Secrets

Once required secrets are added:

1. ✅ Push a commit to `main` or `master` branch
2. ✅ Go to **Actions** tab to watch the workflow
3. ✅ Check that deployment completes successfully
4. ✅ Verify your app is running (manually or via `DEPLOYMENT_URL` if you set it)

That's it! You're ready to deploy! 🚀

