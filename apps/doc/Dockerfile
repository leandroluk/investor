FROM node:20-alpine AS base
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo prune --scope=@apps/web-global --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/turbo.json ./turbo.json
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm install

FROM base AS builder
WORKDIR /work
COPY --from=installer /app/ /work/
COPY --from=pruner   /app/out/full/ /work/
RUN \
  --mount=type=cache,target=/root/.local/share/pnpm/store \
  --mount=type=cache,target=/root/.cache/turbo \
  pnpm dlx turbo build --filter=@apps/web-global && \
  APP_DIR="/work/apps/web-global" OUT="/out" && \
  mkdir -p "$OUT" && \
  cp -R "$APP_DIR/.next/standalone/"* "$OUT/" && \
  mkdir -p "$OUT/apps/web-global/.next" && \
  cp -R "$APP_DIR/.next/static" "$OUT/apps/web-global/.next/static" && \
  mkdir -p "$OUT/apps/web-global" && \
  cp -R "$APP_DIR/public" "$OUT/apps/web-global/public" && \
  test -f "$OUT/apps/web-global/server.js"

FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner
WORKDIR /app
ENV \
  NODE_ENV=production \
  HOST=0.0.0.0 \
  NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /out/ ./
USER nonroot
CMD ["apps/web-global/server.js"]
