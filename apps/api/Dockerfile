FROM node:20-alpine AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo prune --scope=@apps/api-deploy --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/turbo.json ./turbo.json
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install

FROM base AS builder
WORKDIR /work
COPY --from=installer /app/ /work/
COPY --from=pruner /app/out/full/ /work/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm dlx turbo build --filter=@apps/api-deploy && \
  pnpm deploy --filter @apps/api-deploy --prod --legacy /out

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /out/ ./
USER nonroot
CMD ["dist/main.js"]
