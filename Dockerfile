FROM node:22-slim AS builder

WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/backend/package.json apps/backend/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/news-domain/package.json packages/news-domain/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=3000

COPY --from=builder --chown=node:node /app/apps/frontend/dist ./apps/frontend/dist
COPY --from=builder --chown=node:node /app/apps/backend/dist ./apps/backend/dist

EXPOSE 3000
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then((response)=>process.exit(response.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/backend/dist/index.js"]
