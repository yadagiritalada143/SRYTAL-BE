# ==== Build stage: install deps and compile TypeScript ====
FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Compile TypeScript to dist/
RUN npm run build

# ==== Runtime stage: run the compiled app ====
FROM node:20-slim AS runtime

WORKDIR /app

# System libraries required by Puppeteer's bundled Chromium (used for generated
# documents/overviews). Not needed for the core LMS APIs.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libasound2 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Compiled code, dependencies and Puppeteer's Chromium download (kept whole so
# runtime behavior matches your local install).
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /root/.cache/puppeteer /root/.cache/puppeteer

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]