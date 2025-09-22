FROM oven/bun:1 AS base

WORKDIR /app

# 依存関係のみ先にインストール（ビルドキャッシュ最適化）
COPY package.json bun.lock* ./
RUN bun install

# アプリ本体をコピー（docker-composeのボリュームで上書きされる想定）
COPY . .

EXPOSE 3000

# docker-compose.yml で command: bun dev を指定しているため、
# ここでの CMD はデフォルトとして同一に設定
CMD ["bun", "dev"]
