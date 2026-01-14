# Telegram Bot Service

Standalone service for handling Telegram bot operations. This service runs independently from the main Next.js application, providing better separation of concerns and performance.

## Benefits

- ✅ **Independent Scaling** - Run on separate process/server
- ✅ **Non-Blocking** - Doesn't affect website performance
- ✅ **Isolated Errors** - Bot errors don't crash the main app
- ✅ **Easy Monitoring** - Separate logs and health checks
- ✅ **Better Resource Management** - Can be restarted independently

## Architecture

```
┌─────────────────┐         HTTP Request          ┌──────────────────┐
│   Next.js App   │ ───────────────────────────> │ Telegram Service │
│   (Port 3000)   │                               │   (Port 3001)    │
└─────────────────┘                               └──────────────────┘
                                                           │
                                                           ▼
                                                   ┌──────────────┐
                                                   │ Telegram API │
                                                   └──────────────┘
```

## Usage

### Option 1: Run Service Separately (Recommended)

**Terminal 1 - Main App:**
```bash
npm run dev
```

**Terminal 2 - Telegram Service:**
```bash
npm run telegram:service
```

### Option 2: Run Both Together

```bash
npm run dev:all
```

This uses `concurrently` to run both services in one terminal.

### Option 3: Production

**Start Main App:**
```bash
npm run build
npm start
```

**Start Telegram Service:**
```bash
node services/telegram-bot-service.js
```

Or use a process manager like PM2:
```bash
pm2 start services/telegram-bot-service.js --name telegram-bot
pm2 start npm --name nextjs-app -- start
```

## Configuration

### Environment Variables

Create a `.env.local` file (optional):

```env
# Telegram Service URL (default: http://localhost:3001)
TELEGRAM_SERVICE_URL=http://localhost:3001

# Telegram Service Port (default: 3001)
TELEGRAM_SERVICE_PORT=3001
```

### Service Endpoints

- **POST** `/notify-order` - Send order notification
  ```json
  {
    "orderId": 123
  }
  ```

- **GET** `/health` - Health check
  ```json
  {
    "status": "ok",
    "polling": true,
    "bot_configured": true
  }
  ```

## Fallback Behavior

If the Telegram service is not available, the main app will automatically fall back to direct notification using the integrated bot. This ensures notifications still work even if the service is down.

## Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

### Logs

The service logs all operations with `[Telegram Service]` prefix:
- Bot initialization
- Polling status
- Errors and warnings
- Order notifications

## Troubleshooting

### Service Won't Start

1. Check if port 3001 is available
2. Verify database file exists (`juice_website.db`)
3. Check bot settings in admin panel
4. Verify API token is valid

### Notifications Not Working

1. Check service is running: `curl http://localhost:3001/health`
2. Verify bot is configured in admin panel
3. Check service logs for errors
4. Ensure couriers are added and active

### Service Keeps Restarting

1. Check bot API token is valid
2. Verify database connection
3. Check for too many polling errors (service stops after 5 errors)

## Development

The service automatically:
- Connects to the same database as the main app
- Reads bot settings from database
- Handles graceful shutdown (Ctrl+C)
- Restarts polling on errors (up to 5 times)

## Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start services/telegram-bot-service.js --name telegram-bot
pm2 start npm --name nextjs-app -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using Docker

Create a `Dockerfile.telegram`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY services/ ./services/
COPY juice_website.db ./
CMD ["node", "services/telegram-bot-service.js"]
```

### Using systemd (Linux)

Create `/etc/systemd/system/telegram-bot.service`:
```ini
[Unit]
Description=Telegram Bot Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/app
ExecStart=/usr/bin/node services/telegram-bot-service.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
```

