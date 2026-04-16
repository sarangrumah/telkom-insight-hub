# ── Panel Backend Dockerfile ────────────────────────────────────────────────────
# Multi-stage build for the Express.js backend server
# ────────────────────────────────────────────────────────────────────────────────

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# Copy only package files for caching
COPY package.json package-lock.json* ./

# Install production dependencies only (skip devDependencies)
RUN npm ci --omit=dev --ignore-scripts 2>/dev/null || npm install --omit=dev --ignore-scripts

# Stage 2: Production runner
FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init wget

# Security: non-root user
RUN addgroup --system --gid 1001 panelgroup && \
    adduser --system --uid 1001 paneluser

WORKDIR /app

# Copy production node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy server code
COPY server/ ./server/

# Create storage directory for file uploads
RUN mkdir -p /app/storage && chown -R paneluser:panelgroup /app/storage

# Environment
ENV NODE_ENV=production
ENV PORT=4000

# Switch to non-root user
USER paneluser

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=15s \
    CMD wget -qO- http://localhost:4000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
