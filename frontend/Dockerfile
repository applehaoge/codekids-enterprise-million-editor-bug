# 构建阶段
FROM node:20 as builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install && pnpm build:client


# 部署阶段
FROM nginx:1.21-alpine
COPY --from=builder /app/dist/static /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
