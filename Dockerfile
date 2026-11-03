# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- Install production dependencies and generate the Prisma client --------
FROM base AS deps
COPY package*.json ./
COPY src/prisma ./src/prisma
RUN npm ci --omit=dev --ignore-scripts \
  && npx --yes prisma@5.22.0 generate

# --- Runtime image ---------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
RUN mkdir -p src/media && chown -R node:node src/media
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Apply pending migrations, then start the API.
CMD ["sh", "-c", "npx --yes prisma@5.22.0 migrate deploy && node src/index.js"]
