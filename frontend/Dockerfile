# ---- Build stage ----
FROM node:20-slim AS build
WORKDIR /app

# warnings pe build fail na ho
ENV CI=false
# local binaries resolve ho jaayen (react-scripts etc.)
ENV PATH=/app/node_modules/.bin:$PATH

# Install deps
COPY package*.json ./
RUN npm ci || npm install

# App code
COPY . .

# Agar react-scripts missing ho to image ke andar dev-dep ke tarah add kar do
RUN if ! command -v react-scripts >/dev/null 2>&1; then npm i -D react-scripts@5; fi

# Normal build agar script defined hai
RUN if npm run | grep -qE '^  build$'; then npm run build; else echo "no package.json build script"; fi

# Prerender (yehi step pe pehle crash ho raha tha)
RUN if [ -f scripts/production-build.js ]; then node scripts/production-build.js; else echo "no prerender"; fi

# ---- Run stage (static) ----
FROM node:20-slim
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/build ./build
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "serve -s build -l 0.0.0.0:${PORT-8080}"]