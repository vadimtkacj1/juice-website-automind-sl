# Multi-stage Dockerfile for Next.js application

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
# Use npm install to handle lock file sync issues gracefully
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Set build-time environment variables (can be overridden)
ARG RAPYD_ACCESS_KEY
ARG RAPYD_SECRET_KEY
ARG PAYPLUS_API_KEY
ARG PAYPLUS_SECRET_KEY
ARG PAYPLUS_PAGE_UID
ARG PAYPLUS_TEST_MODE=false
ARG TELEGRAM_BOT_TOKEN
ARG SESSION_SECRET
ARG NODE_ENV=production

ENV NODE_ENV=$NODE_ENV
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner (production image)
FROM node:18-alpine AS runner
WORKDIR /app

ARG PAYPLUS_API_KEY
ARG PAYPLUS_SECRET_KEY
ARG PAYPLUS_PAGE_UID
ARG PAYPLUS_TEST_MODE=false

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies needed for sharp and native modules
RUN apk add --no-cache \
    su-exec \
    shadow \
    vips-dev \
    python3 \
    make \
    g++

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Next.js standalone build output
# The standalone output includes server.js and all necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy scripts and services directories
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src/services ./services

# Persist PayPlus credentials for tools expecting a nano file (requested)
RUN printf "PAYPLUS_API_KEY=%s\nPAYPLUS_SECRET_KEY=%s\nPAYPLUS_PAGE_UID=%s\nPAYPLUS_TEST_MODE=%s\n" \
    "$PAYPLUS_API_KEY" "$PAYPLUS_SECRET_KEY" "$PAYPLUS_PAGE_UID" "$PAYPLUS_TEST_MODE" > /app/nano \
    && chmod 600 /app/nano

# Ensure sharp is available - copy from builder's node_modules if needed
# The standalone build should include it, but we ensure it's there
RUN if [ ! -d "node_modules/sharp" ]; then \
    echo "Installing sharp in runner stage..."; \
    npm install sharp@^0.32.6 --production --no-save || true; \
    fi

# Ensure server.js exists (it's in the standalone output)
RUN test -f server.js || (echo "Error: server.js not found in standalone output" && exit 1)

# Copy entrypoint and startup scripts
COPY --from=builder --chown=root:root /app/docker-entrypoint.sh /usr/local/bin/
COPY --from=builder --chown=nextjs:nodejs /app/start-all-services.sh /app/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh /app/start-all-services.sh

# Create data directory for database
RUN mkdir -p /app/data /app/public/uploads && \
    chown -R nextjs:nodejs /app/data /app/public/uploads

# Set entrypoint (will switch to nextjs user inside the script)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Default to root user so entrypoint can fix permissions
# Entrypoint will switch to nextjs user before starting the app
USER root

# Expose port
EXPOSE 80

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start both Next.js and Telegram bot service
CMD ["sh", "/app/start-all-services.sh"]
