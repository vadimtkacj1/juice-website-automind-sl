# Where to Put Your SSH Keys

You have two keys:
1. **PUBLIC KEY** (`hetzner_deploy.pub`) - Safe to share
2. **PRIVATE KEY** (`hetzner_deploy`) - Keep secret!

---

## Step 1: Put PUBLIC KEY on Your Server

**Your PUBLIC KEY:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOXwkgWOEFxfJsDG5oyMnHaQpgBegcEiSeMnv6OXpGpQ user@DESKTOP-HTO0GOL
```

### How to Add It to Server:

**Option A: Using ssh-copy-id (Easiest)**

```powershell
ssh-copy-id -i "$env:USERPROFILE\.ssh\hetzner_deploy.pub" root@104.21.60.73
```

**Option B: Manual Copy**

1. **SSH to your server:**
   ```powershell
   ssh root@104.21.60.73
   ```

2. **On the server, run these commands:**
   ```bash
   # Create .ssh directory if it doesn't exist
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   
   # Add your public key
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOXwkgWOEFxfJsDG5oyMnHaQpgBegcEiSeMnv6OXpGpQ user@DESKTOP-HTO0GOL" >> ~/.ssh/authorized_keys
   
   # Set correct permissions
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **Verify it was added:**
   ```bash
   cat ~/.ssh/authorized_keys
   ```

**Option C: One-Line Command**

```powershell
Get-Content $env:USERPROFILE\.ssh\hetzner_deploy.pub | ssh root@104.21.60.73 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

---

## Step 2: Put PRIVATE KEY in GitHub Secrets

**Your PRIVATE KEY:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDl8JIFjhBcXybAxuaMjJx2kKYAXoHBIknjJ7+jl6RqUAAAAJjC12CHwtdg
hwAAAAtzc2gtZWQyNTUxOQAAACDl8JIFjhBcXybAxuaMjJx2kKYAXoHBIknjJ7+jl6RqUA
AAAEBVpWH4U2YHJY6xjb+DAlShUUvYo+Lg+KPND1k09s1yY+XwkgWOEFxfJsDG5oyMnHaQ
pgBegcEiSeMnv6OXpGpQAAAAFHVzZXJAREVTS1RPUC1IVE8wR09MAQ==
-----END OPENSSH PRIVATE KEY-----
```

### How to Add It to GitHub:

1. **Go to your GitHub repository**
2. **Click:** Settings (top menu)
3. **Click:** Secrets and variables → Actions (left sidebar)
4. **Click:** New repository secret
5. **Fill in:**
   - **Name:** `SSH_PRIVATE_KEY`
   - **Value:** Paste the ENTIRE private key (including `-----BEGIN...` and `-----END...`)
6. **Click:** Add secret

**Important:** Copy the ENTIRE private key including:
- `-----BEGIN OPENSSH PRIVATE KEY-----`
- All the lines in between
- `-----END OPENSSH PRIVATE KEY-----`

---

## Step 3: Test Connection

**Test if it works:**

```powershell
ssh -i "$env:USERPROFILE\.ssh\hetzner_deploy" root@104.21.60.73
```

**If it connects without asking for password:** ✅ Success!

---

## Quick Summary

| Key | Where It Goes | Location |
|-----|---------------|----------|
| **PUBLIC KEY** | Hetzner Server | `~/.ssh/authorized_keys` |
| **PRIVATE KEY** | GitHub Secrets | `SSH_PRIVATE_KEY` |

---

## Complete Copy-Paste Instructions

### 1. Add Public Key to Server

**Run this in PowerShell:**
```powershell
Get-Content $env:USERPROFILE\.ssh\hetzner_deploy.pub | ssh root@104.21.60.73 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'Public key added successfully!'"
```

### 2. Add Private Key to GitHub

1. Copy this entire block:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDl8JIFjhBcXybAxuaMjJx2kKYAXoHBIknjJ7+jl6RqUAAAAJjC12CHwtdg
hwAAAAtzc2gtZWQyNTUxOQAAACDl8JIFjhBcXybAxuaMjJx2kKYAXoHBIknjJ7+jl6RqUA
AAAEBVpWH4U2YHJY6xjb+DAlShUUvYo+Lg+KPND1k09s1yY+XwkgWOEFxfJsDG5oyMnHaQ
pgBegcEiSeMnv6OXpGpQAAAAFHVzZXJAREVTS1RPUC1IVE8wR09MAQ==
-----END OPENSSH PRIVATE KEY-----
```

2. Go to: GitHub → Repository → Settings → Secrets → Actions
3. New repository secret
4. Name: `SSH_PRIVATE_KEY`
5. Value: Paste the entire block above
6. Add secret

### 3. Test

```powershell
ssh -i "$env:USERPROFILE\.ssh\hetzner_deploy" root@104.21.60.73 "echo 'SSH key works!'"
```

---

## After Setup

Once both keys are in place:
1. ✅ Re-run your GitHub Actions workflow
2. ✅ It should authenticate successfully
3. ✅ Deployment should work!

