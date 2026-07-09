FROM node:22-slim AS build

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server-dist ./server-dist

EXPOSE 3000
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then((response)=>process.exit(response.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server-dist/index.js"]
