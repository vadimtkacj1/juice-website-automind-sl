# DEPLOYMENT_URL - What It's For

## Purpose

`DEPLOYMENT_URL` is used to **verify that your deployment worked** after the workflow completes.

## What It Does

After deploying your application to Hetzner, the workflow:
1. Waits 10 seconds for the app to start
2. Makes a request to: `DEPLOYMENT_URL/api/health`
3. Checks if the app responds with HTTP 200
4. If successful, confirms deployment worked ✅

## Example

If your `DEPLOYMENT_URL` is `https://yourdomain.com`, the workflow will:
```bash
curl -f https://yourdomain.com/api/health
```

This checks if your app is actually running and accessible.

## Is It Required?

**No, it's optional!** 

- ✅ **If you provide it:** The workflow will verify your app is running
- ⚪ **If you don't provide it:** The workflow will skip the health check, but deployment still happens

## When to Use It

**Use it if:**
- ✅ You want automatic verification that deployment worked
- ✅ Your app is publicly accessible
- ✅ You have a domain name or public IP

**Skip it if:**
- ⚪ Your app is behind a firewall
- ⚪ You don't have a public URL yet
- ⚪ You prefer to verify manually

## Example Values

```
https://yourdomain.com
http://123.45.67.89:3000
https://app.yourdomain.com
http://your-server-ip:3000
```

## What Happens Without It

If you don't set `DEPLOYMENT_URL`:
- ✅ Deployment still happens
- ✅ Your app still gets deployed
- ⚪ No automatic health check
- ⚪ You'll need to verify manually

## Manual Verification

If you skip `DEPLOYMENT_URL`, you can verify manually:

```bash
# SSH into your server
ssh user@your-server-ip

# Check if container is running
docker-compose ps

# Check logs
docker-compose logs nextjs-app

# Test health endpoint manually
curl http://localhost:3000/api/health
```

## Summary

- **Purpose:** Automatic health check after deployment
- **Required:** No (optional)
- **What it does:** Verifies your app is running and accessible
- **When to use:** If you want automatic verification
- **When to skip:** If you prefer manual verification or app isn't publicly accessible

