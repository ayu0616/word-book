FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js をビルド
RUN bun run build

FROM oven/bun:1 AS runner
WORKDIR /app

# Next.js standalone 出力と public/.next/static をコピー
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]

# 開発用ターゲット（docker-compose.yml から build.target: dev で利用）
FROM oven/bun:1 AS dev
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["bun", "dev"]
