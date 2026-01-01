# Fix SSH Key Generation Command

## The Problem

You ran:
```bash
ssh-keygen -t ed25519 -C 'github-actions' -f /.ssh/hetzner-deploy
```

**Error:** `/.ssh/hetzner-deploy: No such file or directory`

The issue is the path `/.ssh/` - this tries to create the key in the root filesystem, not your home directory.

## The Fix

Since you're logged in as `root`, use one of these:

### Option 1: Use Home Directory (Recommended)
```bash
ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/hetzner_deploy
```

### Option 2: Use Full Path
```bash
ssh-keygen -t ed25519 -C 'github-actions' -f /root/.ssh/hetzner_deploy
```

### Option 3: Create Directory First, Then Generate
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Generate the key
ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/hetzner_deploy
```

## Complete Steps

1. **Create .ssh directory (if needed):**
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   ```

2. **Generate the key:**
   ```bash
   ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/hetzner_deploy
   ```

3. **When prompted:**
   - "Enter passphrase": Press **Enter** (leave empty)
   - "Enter same passphrase again": Press **Enter**

4. **Copy the private key:**
   ```bash
   cat ~/.ssh/hetzner_deploy
   ```
   Copy the entire output (this is your `SSH_PRIVATE_KEY`)

5. **Copy the public key:**
   ```bash
   cat ~/.ssh/hetzner_deploy.pub
   ```
   Add this to your Hetzner server's `~/.ssh/authorized_keys`

## Key Differences

❌ **Wrong:** `/.ssh/hetzner-deploy` (root filesystem)
✅ **Correct:** `~/.ssh/hetzner_deploy` (home directory)

Note: Also changed `hetzner-deploy` to `hetzner_deploy` (underscore instead of hyphen - both work, but underscore is more common)

