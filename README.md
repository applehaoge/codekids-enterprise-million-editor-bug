# CodeKids 企业级平台（MVP 简明说明）

概述
- 儿童编程学习与协作平台，包含在线编辑器、可视化运行面板、课程体系、家长观战与虚拟经济。

总体技术栈（MVP 推荐）
- 前端：React + TypeScript + Vite；Tailwind；Monaco Editor；Zustand；原生 WebSocket（单业务通道）；自定义 Yjs Provider
- 后端：API 服务（Spring Boot / Node 可选）+ WS-gateway（高并发优化）
- 执行：隔离沙箱服务（容器化，禁网、cgroups、超时回收）
- 存储：MinIO（对象）+ MongoDB（快照/元数据）+ MySQL（关系数据）
- 弹性：RabbitMQ + KEDA
- 网关与入口：Kong（统一对外流量）
- 监控：Prometheus + Grafana；日志 ELK
- AI：AI Router（厂商熔断/限额/降级）；TTS/ASR 按需接入

可视化与实时约定（简要）
- 消息主题：viz.frame（二进制帧）、viz.event（键鼠）、viz.ctrl（控制）、viz.meta（统计）
- 帧编码（MVP）：关键帧 PNG + 差分（RLE/LZ4）
- 背压策略：per-connection in-flight 窗口 + 全局令牌桶，拥塞优先丢旧帧
- 录制/回放：关键帧 + 差分索引写入 MinIO，元数据入 Mongo

快速启动（本地开发）
- 前端：cd frontend && pnpm install && pnpm dev
- 后端：参见各服务目录（api / ws-gateway / exec-sandbox）的启动说明
- 网关（Kong）与 k8s 目录：参见 k8s-deployment/kong-gateway

贡献与部署
- 所有对外路由通过 Kong 管理；变更前请同步 API 文档与网关配置。

更多细节请参见：frontend/README.md 与 k8s-deployment/kong-gateway/kong-gateway-final-readme.md
