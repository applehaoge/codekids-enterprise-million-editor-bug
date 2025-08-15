快速启动（5 分钟）

先决条件：已安装 Docker 和 Docker Compose，已安装 pnpm（可选，容器内会安装）。

1) 克隆仓库并进入目录
   git clone <repo> && cd codekids-enterprise-million-v2

2) 配置环境（可选）
   - 检查 frontend/.env，确保：
     VITE_WS_HOST=localhost
     VITE_WS_PORT=8081
     VITE_WS_PATH=/api/ws
     VITE_API_BASE_URL=http://localhost:8081/api

3) 启动全部服务
   docker compose up -d --build --pull=false

4) 前端（开发）
   - 本地开发：pnpm --prefix frontend install && pnpm --prefix frontend dev
   - 或使用容器运行（已映射端口 5173）: http://localhost:5173

5) 后端
   - Java 后端（容器映射 8081）: http://localhost:8081
   - Python 后端（容器映射 5000）: http://localhost:5000/health

6) 常见命令
   - 停止并移除容器与卷：docker compose down -v
   - 查看容器日志：docker logs -f <container>

7) 其他注意事项
   - 构建时优先使用本地镜像：docker compose build --pull=false
   - 如果需要拉取远程镜像，会先询问

IMPORTANT: 禁止在组件中直接使用 new WebSocket()，请使用 frontend/src/wsClient.js 提供的接口（connect/send/on/close）。

示例：
import wsClient from './src/wsClient'
await wsClient.connect()
const off = wsClient.on('run_result', data => console.log(data))
wsClient.send('run', { student_code: 'print(1)' })
// 取消订阅
off()

