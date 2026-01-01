# SSH Key Guide for GitHub Actions

## Can You Use Two Private Keys?

**Yes!** You can use:
1. **An existing SSH key** you already have
2. **A new SSH key** created specifically for GitHub Actions (recommended)

## Option 1: Use Existing SSH Key (If You Have One)

### Where to Find Your Existing Private Key

SSH keys are usually stored in `~/.ssh/` directory:

**On Windows:**
```
C:\Users\YourUsername\.ssh\
```

**On Linux/Mac:**
```
~/.ssh/
```

### Common Key Names:
- `id_rsa` (private key) / `id_rsa.pub` (public key)
- `id_ed25519` (private key) / `id_ed25519.pub` (public key)
- `id_ecdsa` (private key) / `id_ecdsa.pub` (public key)

### How to Check If You Have Keys:

**On Windows (PowerShell):**
```powershell
dir $env:USERPROFILE\.ssh
```

**On Linux/Mac:**
```bash
ls -la ~/.ssh
```

### If You Find Existing Keys:

1. **Copy the PRIVATE key** (the one WITHOUT `.pub`):
   ```bash
   # Windows PowerShell
   Get-Content $env:USERPROFILE\.ssh\id_rsa
   
   # Linux/Mac
   cat ~/.ssh/id_rsa
   ```

2. **Copy the entire output** including:
   - `-----BEGIN OPENSSH PRIVATE KEY-----` or
   - `-----BEGIN RSA PRIVATE KEY-----`
   - All lines in between
   - `-----END OPENSSH PRIVATE KEY-----` or
   - `-----END RSA PRIVATE KEY-----`

3. **Add it as `SSH_PRIVATE_KEY` in GitHub Secrets**

---

## Option 2: Create New SSH Key (Recommended)

Creating a dedicated key for GitHub Actions is **safer** and **recommended**.

### Step 1: Generate New SSH Key

**On Windows (PowerShell):**
```powershell
# Navigate to .ssh directory
cd $env:USERPROFILE\.ssh

# Generate new key
ssh-keygen -t ed25519 -C "github-actions-hetzner" -f hetzner_deploy
```

**On Linux/Mac:**
```bash
# Generate new key
ssh-keygen -t ed25519 -C "github-actions-hetzner" -f ~/.ssh/hetzner_deploy
```

**What this does:**
- Creates `hetzner_deploy` (private key)
- Creates `hetzner_deploy.pub` (public key)
- Uses Ed25519 algorithm (modern and secure)

### Step 2: When Prompted

- **"Enter passphrase":** Press Enter (no passphrase needed for automation)
- **"Enter same passphrase again":** Press Enter

### Step 3: Copy the Private Key

**On Windows:**
```powershell
Get-Content $env:USERPROFILE\.ssh\hetzner_deploy
```

**On Linux/Mac:**
```bash
cat ~/.ssh/hetzner_deploy
```

**Copy the ENTIRE output** - this is your `SSH_PRIVATE_KEY`

### Step 4: Copy Public Key to Hetzner Server

**On Windows:**
```powershell
Get-Content $env:USERPROFILE\.ssh\hetzner_deploy.pub
```

**On Linux/Mac:**
```bash
cat ~/.ssh/hetzner_deploy.pub
```

**Then add it to your Hetzner server:**
```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/hetzner_deploy.pub user@your-server-ip

# Or manually:
ssh user@your-server-ip
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the public key content
chmod 600 ~/.ssh/authorized_keys
```

---

## Important: Private Key vs Public Key

### ❌ DO NOT Use Public Key
- Public key ends with `.pub`
- Public key looks like: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...`
- This is NOT what you need!

### ✅ Use Private Key
- Private key has NO `.pub` extension
- Private key starts with: `-----BEGIN OPENSSH PRIVATE KEY-----`
- This is what goes in GitHub Secrets!

---

## Using Multiple Keys

You can have multiple SSH keys for different purposes:

```
~/.ssh/
├── id_rsa              # Your personal key
├── id_rsa.pub
├── hetzner_deploy      # Key for GitHub Actions → Hetzner
├── hetzner_deploy.pub
└── github_key          # Another key for something else
```

**Each key is independent** - you can use them for different purposes.

---

## Quick Decision Guide

### Use Existing Key If:
- ✅ You already have an SSH key
- ✅ You're comfortable using it for automation
- ✅ You want to keep things simple

### Create New Key If:
- ✅ You want better security (dedicated key)
- ✅ You want to revoke it independently
- ✅ You're following best practices
- ✅ You don't have an existing key

---

## Step-by-Step: Create New Key (Recommended)

### 1. Open Terminal/PowerShell

### 2. Generate Key

**Windows:**
```powershell
ssh-keygen -t ed25519 -C "github-actions" -f $env:USERPROFILE\.ssh\hetzner_deploy
```

**Linux/Mac:**
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/hetzner_deploy
```

### 3. Press Enter Twice (no passphrase)

### 4. Copy Private Key
```powershell
# Windows
Get-Content $env:USERPROFILE\.ssh\hetzner_deploy
```

```bash
# Linux/Mac
cat ~/.ssh/hetzner_deploy
```

### 5. Add to GitHub Secrets
- Name: `SSH_PRIVATE_KEY`
- Value: Paste the entire private key

### 6. Copy Public Key to Server
```powershell
# Windows - show public key
Get-Content $env:USERPROFILE\.ssh\hetzner_deploy.pub
```

```bash
# Linux/Mac - show public key
cat ~/.ssh/hetzner_deploy.pub
```

Then add it to your Hetzner server's `~/.ssh/authorized_keys`

---

## Testing Your Key

After setting up, test the connection:

```bash
# Test SSH connection
ssh -i ~/.ssh/hetzner_deploy user@your-server-ip

# Or if using existing key
ssh -i ~/.ssh/id_rsa user@your-server-ip
```

If it works without asking for a password, you're good! ✅

---

## Security Notes

1. **Never share your private key** - it's like a password
2. **Never commit private keys** to Git
3. **Use different keys** for different purposes (best practice)
4. **Revoke keys** if compromised
5. **Private key stays on your machine** - only public key goes to server

---

## Troubleshooting

### "Permission denied (publickey)" Error

- Make sure you copied the **private key** (not public)
- Verify public key is in server's `~/.ssh/authorized_keys`
- Check file permissions on server: `chmod 600 ~/.ssh/authorized_keys`

### "No such file or directory" When Generating Key

- Create `.ssh` directory first: `mkdir ~/.ssh` or `mkdir $env:USERPROFILE\.ssh`
- Then generate the key

### Key Not Working in GitHub Actions

- Verify you copied the ENTIRE key including headers
- Check for extra spaces or line breaks
- Make sure secret name is exactly `SSH_PRIVATE_KEY` (case-sensitive)

---

## Summary

**You can use:**
- ✅ Existing SSH key (if you have one)
- ✅ New SSH key (recommended - create one specifically for this)

**Where to find/create:**
- Existing: `~/.ssh/id_rsa` or `~/.ssh/id_ed25519`
- New: Generate with `ssh-keygen` command

**What to add to GitHub:**
- The **PRIVATE key** (no `.pub` extension)
- Include the full key with headers

Need help with a specific step? Let me know!

