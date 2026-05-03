# ─── Stage 1: Builder ──────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# Install all dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# ─── Stage 2: Production ───────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]