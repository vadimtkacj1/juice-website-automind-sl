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

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

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

# Ensure server.js exists (it's in the standalone output)
RUN test -f server.js || (echo "Error: server.js not found in standalone output" && exit 1)

# Create data directory for database
RUN mkdir -p /app/data /app/public/uploads && \
    chown -R nextjs:nodejs /app/data /app/public/uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application using standalone server
CMD ["node", "server.js"]
