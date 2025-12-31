# Telegram Bot Setup Guide

## Quick Setup Steps

### Step 1: Create a Bot with BotFather

1. Open Telegram app
2. Search for **@BotFather**
3. Start a chat and send: `/newbot`
4. Follow the instructions:
   - Choose a name for your bot (e.g., "My Juice Delivery Bot")
   - Choose a username (must end with "bot", e.g., "myjuicedelivery_bot")
5. BotFather will give you a **token** that looks like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
   ```
6. **Copy this token** - you'll need it!

### Step 2: Configure in Admin Panel

1. Go to Admin Panel → **Telegram Delivery**
2. Click **"Configure"** button
3. Paste the **API Token** you got from BotFather
   - The Bot ID will be **automatically filled** (you don't need to enter it)
4. Set **Reminder Interval** (how often to remind couriers, in minutes)
5. **Enable** the bot (check the checkbox)
6. Click **"Save"**

### Step 3: Add Couriers

1. In the **"Delivery Accounts"** section, click **"Add Courier"**
2. To get your Telegram ID:
   - Open Telegram
   - Search for **@userinfobot**
   - Start a chat - it will show your ID (a number like `123456789`)
3. Enter:
   - **Telegram ID**: Your ID from @userinfobot
   - **Name**: Your name (e.g., "John Doe")
4. Make sure **"Active"** is checked
5. Click **"Create"**

### Step 4: Initialize Bot

1. Click **"Initialize Bot"** button
2. The bot should start and be ready to receive orders

### Step 5: Test

1. Click **"Test Order"** button
2. Check your Telegram - you should receive a notification!

## Important Notes

### API Token Format
- ✅ Correct: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- ❌ Wrong: `dsa:dads` (this is not a real token)
- ❌ Wrong: Just the bot username

### Bot ID
- **You don't need to enter Bot ID manually**
- It's automatically extracted from the API token
- Bot ID is the number before the colon in the token (e.g., `123456789`)

### Common Errors

**"404 Not Found" or "Invalid Token"**
- The token is wrong or incomplete
- Make sure you copied the **entire token** from BotFather
- Token should have format: `number:letters_and_numbers`

**"No active couriers found"**
- Add at least one courier in the admin panel
- Make sure the courier is marked as "Active"

**"Bot is not configured"**
- Make sure you saved the settings
- Make sure "Enable Bot" checkbox is checked

## Troubleshooting

### Bot Not Receiving Messages?

1. Make sure you started a conversation with your bot:
   - Search for your bot by username in Telegram
   - Click "Start" or send `/start`
2. Check that your Telegram ID is correct (use @userinfobot)
3. Make sure the bot is enabled in admin panel

### Still Not Working?

1. Click **"Diagnose"** button - it will show what's wrong
2. Check server console logs for detailed errors
3. Verify:
   - ✅ Token is valid (from @BotFather)
   - ✅ Bot is enabled
   - ✅ At least one active courier exists
   - ✅ You started a chat with the bot

