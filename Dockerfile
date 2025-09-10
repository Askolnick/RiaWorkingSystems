# Multi-stage Docker build for Next.js application

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN pnpm build

# Stage 3: Runner
FROM node:18-alpine AS runner
RUN apk add --no-cache dumb-init
RUN corepack enable

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy built application
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set the correct permission for prerender cache
RUN mkdir -p /app/apps/web/.next
RUN chown nextjs:nodejs /app/apps/web/.next

# Copy built files with correct permissions
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy package.json for dependencies
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/web/server.js"]