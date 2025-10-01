FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["bun", "dev"]
