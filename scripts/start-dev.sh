#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# 启动后端容器（数据库、消息队列、后端服务、nginx）
docker compose up -d mysql redis rabbitmq mongodb minio java-backend python-backend ai-service nginx
# 安装并启动前端本地开发服务器
pnpm --prefix frontend install --frozen-lockfile || pnpm --prefix frontend install
pnpm --prefix frontend dev
