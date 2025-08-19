# CodeKids - 儿童编程学习平台（前端）

概述
- 该目录为前端代码（React + TypeScript + Vite），负责编辑器、可视化运行面板、课程页与家长端展示。

技术栈（MVP 推荐）
- React + TypeScript + Vite
- Tailwind CSS
- 状态管理：Zustand
- 编辑器：Monaco Editor
- 动画：Framer Motion + Lottie
- 媒体：ReactPlayer、PDF.js
- 实时：原生 WebSocket（单业务通道）+ 自定义 Yjs Provider（topic=collab.*，灰度启用 y-websocket）

快速启动
- 安装依赖：pnpm install
- 本地开发：pnpm dev

API 客户端
- baseURL 通过环境变量配置：VITE_API_BASE_URL
- 主要 API 文件：src/api/index.ts（axios client），src/api/auth.ts，src/api/courses.ts（包含 runCode/saveCode/getProgress）

编辑器与可视化要点
- 编辑器：MonacoCodeEditor（支持保存快捷键与 onChange 回调）
- 可视化：按固定步长渲染，frame 流走 viz.frame（二进制），控制命令走 viz.ctrl，事件上行 viz.event，元数据 viz.meta
- 帧编码（MVP）：关键帧 PNG + 差分（RLE/LZ4）

安全与后端约定（简要）
- 代码执行通过后端 /execute（或等价服务）并在隔离沙箱中运行（禁网、cgroups 限制、超时回收）
- 存储：MinIO（对象）+ MongoDB（快照/元数据）+ MySQL（关系数据）

开发注意
- 前端仅保持单条业务 WS（除 HMR 外），如需协作可按 topic 协议复用同路连接
- 所有变更请对齐后端路由与网关（Kong）配置
