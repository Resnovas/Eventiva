FROM node:20-alpine AS base

# Install pnpm
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME/bin:$PATH
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build
RUN pnpm nx run platforms-postgresql:build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 eventiva

COPY --from=builder /app/dist/packages/platforms/postgresql /app

# Copy Prisma schema for migrations
COPY --from=builder /app/packages/platforms/postgresql/prisma /app/prisma

# Change ownership
RUN chown -R eventiva:nodejs /app

USER eventiva

EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "/app/packages/platforms/postgresql/src/index.js"]