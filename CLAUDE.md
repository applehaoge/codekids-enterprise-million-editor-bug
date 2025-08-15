# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

- 启动全部服务（开发/演示）
  - docker-compose up -d
- 停止并移除服务
  - docker compose down

- 前端
  - 安装依赖: pnpm --prefix frontend install
  - 本地开发: pnpm --prefix frontend dev
  - 单独运行 Vite 客户端: pnpm --prefix frontend dev:client
  - 构建: pnpm --prefix frontend build

- Java 后端（Maven）
  - 构建可运行 jar: mvn -f java-backend clean package
  - 运行（在项目 java-backend 目录）: mvn spring-boot:run

- Python 服务
  - 使用 docker-compose 管理，或进入 python-backend 目录查看 README

- 全库辅助
  - 在仓库根目录查看 README.md 了解端口与服务

## 高级架构概览

- 组件
  - frontend/: React + Vite 前端（TypeScript），使用 Monaco 编辑器、Tailwind、axios。
  - java-backend/: Spring Boot (Java 17) 后端，提供 /api 和 websocket 服务，使用 MySQL、Actuator。
  - python-backend/: 提供代码执行/AI 辅助等（通过 docker-compose 暴露在 5000 端口）。
  - ai-service/: 单独的 AI 服务（8000 端口）。
  - nginx-gateway/: Nginx 作为反向代理，统一暴露 8080 端口。
  - infra services: redis、rabbitmq、mongodb、mysql、minio（由 docker-compose 管理）。

- 运行流
  - docker-compose up -d 会启动所有依赖（mysql、redis、mongodb、rabbitmq、minio）以及应用服务（frontend、java-backend、python-backend、ai-service、nginx）。
  - 前端默认构建输出到 dist/static 并由 nginx 代理。
  - Java 后端在容器内监听 8080，外部映射为 8081。

- 配置
  - Java 后端通过环境变量配置数据库连接（SPRING_DATASOURCE_URL / USER / PASSWORD）。
  - 前端使用 vite 配置和 .env 文件（参考 frontend/.env）。

## 如何快速开始开发

1. 启动依赖服务
   - docker-compose up -d
2. 前端开发
   - pnpm --prefix frontend install
   - pnpm --prefix frontend dev
   - 在浏览器访问 http://localhost:5173 （或通过 nginx 访问编译后的 frontend）
3. 后端开发（Java）
   - cd java-backend
   - mvn spring-boot:run
   - 访问后端健康检查: http://localhost:8080/actuator/health

## 测试与 lint

- 前端: 本仓库未包含测试命令。若新增测试，请在 frontend/package.json 中添加对应脚本。
- Java: 使用 mvn test 运行测试。

## 代码位置要点

- Java 应用入口: java-backend/src/main/java/com/codekids/JavaBackendApplication.java:9
- 前端主要入口: frontend/src/main.tsx:1
- Docker 配置与服务定义: docker-compose.yml:1
- 仓库根 README 包含端口与服务映射: README.md:4

## 注意事项

- 仓库包含构建输出与数据库数据目录在 `.gitignore` 中。不要提交敏感配置或凭证。
- 任何对 Docker Compose 或数据库凭证的更改都应同步更新 README 和 deploy 文档。


