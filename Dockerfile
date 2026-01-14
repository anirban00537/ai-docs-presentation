# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install essentials for Prisma
RUN apk add --no-cache openssl git

COPY package.json yarn.lock* ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev) for build
RUN yarn install --frozen-lockfile || yarn install

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (this doesn't need DATABASE_URL)
RUN npx prisma generate

# Build NestJS (skip prisma migrate which needs DATABASE_URL)
RUN npx rimraf dist && npx nest build

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Create uploads directory and set permissions BEFORE switching user
RUN mkdir -p /app/public/uploads /app/uploads /app/storage/logs && \
    chown -R nestjs:nodejs /app

COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3001
ENV PORT=3001

CMD ["node", "--experimental-require-module", "dist/main.js", "-p", "3001"]
