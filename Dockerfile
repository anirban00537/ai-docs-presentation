FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Set environment variables for build (these get baked into Next.js static files)
ENV NEXT_PUBLIC_API_URL=https://api.butterfast.com/api
ENV NEXT_PUBLIC_AUTH_URL=https://api.butterfast.com/api/auth
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=1056073814742-k3lvv78adgrscm1f1t1eu44b8i381abk.apps.googleusercontent.com
ENV NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=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
ENV BETTER_AUTH_URL=https://api.butterfast.com
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
