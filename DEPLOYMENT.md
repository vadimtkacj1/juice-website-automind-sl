# Deployment Instructions

This guide explains how to deploy the Juice Website application on a server using Docker.

## Prerequisites

- Docker and Docker Compose installed on the server
- Access to the GitHub Container Registry (ghcr.io)
- Environment variables configured

## Important Files

### Database Initialization

The `init-database.sql` file is included in the Docker image and needs to be executed manually after the first deployment.

**Why manual execution?**
- The SQL file cannot be auto-executed via volume mount when using pre-built images from the registry
- The file is included in the Docker image at `/app/init-database.sql`

## Deployment Steps

### 1. Clone or Copy Files

```bash
# Copy these files to your server:
- docker-compose.yml
- .env (with your configuration)
```

### 2. Configure Environment Variables

Create a `.env` file with your production settings:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=juice_website
MYSQL_USER=juice_user
MYSQL_PASSWORD=your_secure_password
MYSQL_EXTERNAL_PORT=3307

# Application Configuration
RAPYD_ACCESS_KEY=your_rapyd_key
RAPYD_SECRET_KEY=your_rapyd_secret
PAYPLUS_API_KEY=your_payplus_key
PAYPLUS_SECRET_KEY=your_payplus_secret
PAYPLUS_PAGE_UID=your_page_uid
PAYPLUS_TEST_MODE=false
TELEGRAM_BOT_TOKEN=your_telegram_token
SESSION_SECRET=your_session_secret
DEPLOYMENT_URL=https://yourdomain.com

# Email Configuration (optional)
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=Juice Website <noreply@yourdomain.com>

# GitHub Container Registry
GITHUB_REPOSITORY=vadimtkacj1/juice-website-automind-sl
```

### 3. Start the Containers

```bash
docker-compose up -d
```

### 4. Initialize the Database (First Time Only)

**Option A: Run SQL script from inside the container**

```bash
# Execute the SQL initialization script
docker exec -i juice-website npm run init-sql
```

**Option B: Run SQL file directly with mysql client**

```bash
# Copy SQL file from container (if needed)
docker cp juice-website:/app/init-database.sql ./init-database.sql

# Execute SQL file
docker exec -i juice-website-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < init-database.sql
```

**Option C: Execute from host machine**

If you have the `init-database.sql` file locally:

```bash
docker exec -i juice-website-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < ./init-database.sql
```

### 5. Create Admin User

After database initialization, create an admin user:

```bash
docker exec -it juice-website npm run create-admin
```

### 6. Seed Data (Optional)

You can optionally seed demo data:

```bash
# Seed menu items
docker exec -it juice-website npm run seed-menu

# Seed locations
docker exec -it juice-website npm run seed-locations

# Seed contacts
docker exec -it juice-website npm run seed-contacts

# Seed news
docker exec -it juice-website npm run seed-news
```

### 7. Verify Deployment

```bash
# Check container logs
docker logs juice-website
docker logs juice-website-mysql

# Check container health
docker ps

# Test the application
curl http://localhost:3000
```

## File Persistence

The following directories are persisted on the host:

- `./mysql-data` - MySQL database files
- `./mysql-backups` - Automated MySQL backups
- `./public/uploads` - User uploaded files

These directories will be created automatically when you start the containers.

## Database Backups

Automated backups are configured to run daily at 3 AM:

- Backup location: `./mysql-backups`
- Retention: 7 days
- Compression: gzip level 9

To manually backup:

```bash
docker exec juice-website-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} | gzip > backup-$(date +%Y%m%d).sql.gz
```

## Updating the Application

To update to a new version:

```bash
# Pull the latest image
docker-compose pull nextjs-app

# Restart the container
docker-compose up -d nextjs-app

# Check logs
docker logs juice-website
```

## Troubleshooting

### Database connection issues

```bash
# Check MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker logs juice-website-mysql

# Test connection
docker exec -it juice-website-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD}
```

### Application issues

```bash
# Check application logs
docker logs juice-website -f

# Restart the application
docker-compose restart nextjs-app

# Check environment variables
docker exec juice-website env | grep MYSQL
```

### Init SQL file not found

If you get "SQL file not found" error:

```bash
# Verify file exists in image
docker exec juice-website ls -la /app/init-database.sql

# If missing, you may be using an old image
docker-compose pull nextjs-app
docker-compose up -d
```

## Security Notes

1. Never commit `.env` file to version control
2. Use strong passwords for database
3. Ensure `SESSION_SECRET` is a random string
4. Consider using Docker secrets for sensitive data in production
5. Set up firewall rules to restrict database access
6. Regularly update Docker images for security patches

## Support

For issues or questions, please check:
- Application logs: `docker logs juice-website`
- MySQL logs: `docker logs juice-website-mysql`
- Container status: `docker ps -a`
