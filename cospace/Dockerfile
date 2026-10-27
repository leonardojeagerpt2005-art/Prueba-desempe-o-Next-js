# 1. Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 2. Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# 3. Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables dummy para que el build estático no falle si se compila sin DB activa
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=
ENV JWT_ACCESS_SECRET=f66ccfb0974049c821f6e34e79939e46b0a7ce0758ea0a3d0493cd3141bc2525244bf3354b572308c1060f2c042f1acbd02fb9bcade07dacfdafbcf581757410
ENV JWT_REFRESH_SECRET=89188221c427f618c134de5b955c76e9134b8c0a8cc6f69c9f3bf8b6a8ab75d770546f18b3dfa050422980d7f72238c53db6815a1a03a3f5c3a21faa033a0195
RUN npx prisma generate
RUN npm run build

# 4. Runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]