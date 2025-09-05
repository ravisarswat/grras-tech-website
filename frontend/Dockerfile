# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (CI-friendly, lockfile respected)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Prerender temporarily disabled due to HTML structure corruption issue
# RUN [ -f scripts/production-build.js ] && node scripts/production-build.js || echo "no prerender"
RUN echo "prerender disabled - using clean build for now"

# ---- Run stage (static serve) ----
FROM node:20-alpine AS run
WORKDIR /app

# Lightweight static server
RUN npm i -g serve@14

# Copy built assets
COPY --from=build /app/build ./build

# Railway will inject PORT; fallback 3000 for local
ENV PORT=3000
EXPOSE 3000

# Serve on the injected port (serve expects scheme or plain port)
CMD ["sh","-c","serve -s build -l tcp://0.0.0.0:${PORT:-3000}"]