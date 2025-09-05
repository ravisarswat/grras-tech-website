# ---- Build stage ----
FROM node:20-slim AS build
WORKDIR /app
ENV CI=false
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# optional: prerender if script exists
RUN if [ -f scripts/production-build.js ]; then node scripts/production-build.js; else echo "no prerender"; fi

# ---- Run stage (static) ----
FROM node:20-slim
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/build ./build
ENV PORT=8080
EXPOSE 8080
# use $PORT from Railway (fallback 8080)
CMD ["sh", "-c", "serve -s build -l 0.0.0.0:${PORT-8080}"]