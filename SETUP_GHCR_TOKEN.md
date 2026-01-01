# Quick Guide: Setting Up GHCR_TOKEN

This guide will help you create a GitHub Personal Access Token (PAT) for pulling Docker images from GitHub Container Registry.

## Step-by-Step Instructions

### 1. Go to GitHub Token Settings

**Direct Link:** https://github.com/settings/tokens/new

Or navigate manually:
- Click your profile picture (top right) → **Settings**
- Scroll down → **Developer settings**
- Click **Personal access tokens** → **Tokens (classic)**
- Click **Generate new token** → **Generate new token (classic)**

### 2. Configure the Token

Fill in the form:

- **Note:** `Hetzner Deployment` or `GHCR Token` (any name you prefer)
- **Expiration:** 
  - Recommended: `90 days` (good balance of security and convenience)
  - Or `1 year` if you don't want to rotate often
  - Or `No expiration` (less secure but convenient)

### 3. Select Scopes

**Required:**
- ✅ **`read:packages`** - This is the only scope you need!

**Optional (if you want to push images too):**
- ⚪ `write:packages` - Only if you need to push images manually

**Do NOT select:**
- ❌ `repo` - Not needed (too broad)
- ❌ `admin:org` - Not needed
- ❌ Other scopes - Not needed

### 4. Generate Token

1. Scroll down and click **Generate token**
2. **IMPORTANT:** Copy the token immediately! It looks like:
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. You won't be able to see it again after you leave this page!

### 5. Add to GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Fill in:
   - **Name:** `GHCR_TOKEN`
   - **Value:** Paste the token you copied
6. Click **Add secret**

### 6. Verify Setup

Your secrets should now include:
- ✅ `SSH_PRIVATE_KEY`
- ✅ `SSH_USER`
- ✅ `SSH_HOST`
- ✅ `GHCR_TOKEN` ← **You just added this!**
- ✅ `DEPLOYMENT_URL`
- ⚪ `GHCR_USER` (optional)
- ⚪ `APP_PATH` (optional)

## Testing the Token

You can test if your token works by trying to pull an image manually:

```bash
# On your Hetzner server
echo "YOUR_TOKEN_HERE" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

If it works, you'll see:
```
Login Succeeded
```

## Troubleshooting

### Token Not Working?

1. **Check expiration:** Make sure the token hasn't expired
2. **Check scope:** Verify `read:packages` is selected
3. **Check repository:** Make sure the token has access to your repository
   - For private repos: Token needs access
   - For public repos: Should work automatically

### "Unauthorized" Error?

- Verify you copied the entire token (starts with `ghp_`)
- Make sure there are no extra spaces
- Check that the token hasn't been revoked

### "Permission Denied" Error?

- Verify `read:packages` scope is enabled
- Check that your repository package visibility allows access
- For private repos, ensure the token has repository access

## Security Best Practices

1. ✅ Use the minimum required scope (`read:packages` only)
2. ✅ Set an expiration date (90 days recommended)
3. ✅ Never commit the token to your repository
4. ✅ Rotate the token periodically
5. ✅ Revoke old tokens when creating new ones

## What This Token Does

The `GHCR_TOKEN` allows your Hetzner server to:
- Authenticate with GitHub Container Registry
- Pull Docker images from your repository
- Access private package repositories (if applicable)

It's used in the deployment workflow at this step:
```bash
echo '${GHCR_TOKEN}' | docker login ghcr.io -u ${GHCR_USER} --password-stdin
docker pull ${IMAGE_TAG}
```

## Next Steps

Once you've added `GHCR_TOKEN`:
1. ✅ All required secrets should be set
2. ✅ Push a commit to trigger the workflow
3. ✅ Watch the deployment in GitHub Actions
4. ✅ Verify your app is running on Hetzner

## Need Help?

If you encounter issues:
1. Check GitHub Actions logs for specific error messages
2. Verify all secrets are correctly named (case-sensitive!)
3. Test the token manually on your server
4. Review the main deployment guide: `HETZNER_DEPLOYMENT.md`

