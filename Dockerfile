# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for Prisma and Puppeteer in Alpine
RUN apk add --no-cache \
    openssl \
    libnss3 \
    libnspr4 \
    at-spi2-core \
    libcups \
    libdrm \
    libxkbcommon \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    librandr \
    mesa-gbm \
    alsa-lib \
    pango \
    ca-certificates \
    font-noto \
    pixman \
    git

COPY package.json package-lock.json* yarn.lock* ./
COPY prisma ./prisma/

# Using npm install instead of ci
RUN npm install --no-package-lock && npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache \
    openssl \
    libnss3 \
    libnspr4 \
    at-spi2-core \
    libcups \
    libdrm \
    libxkbcommon \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    librandr \
    mesa-gbm \
    alsa-lib \
    pango \
    ca-certificates \
    font-noto

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 3001
ENV PORT=3001

CMD ["node", "--experimental-require-module", "dist/main.js", "-p", "3001"]
