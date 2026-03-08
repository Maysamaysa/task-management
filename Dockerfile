# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (layer cache)
COPY package*.json ./

# Install ALL deps (including devDependencies — needed to compile TypeScript)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production deps only
RUN npm ci --omit=dev

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

EXPOSE 3000

CMD ["node", "dist/main"]
