# 构建阶段
FROM node:20 as builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install && pnpm build:client


# 部署阶段
FROM node:20
WORKDIR /app
COPY --from=builder /app .
RUN corepack enable && corepack prepare pnpm@latest --activate
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]
