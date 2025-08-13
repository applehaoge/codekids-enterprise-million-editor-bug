# 🚀 CodeKids · Kong 网关部署说明（整理最终版）

本目录包含 CodeKids 平台在 Kubernetes 中使用 Kong 网关的完整配置，已通过验证并稳定运行。

---

## ✅ 文件说明

| 文件名                      | 作用说明 |
|-----------------------------|----------|
| `kong-values.yaml`          | Helm 安装 Kong 的配置参数，定义 NodePort 等设置 |
| `kong-helm-install.sh`      | 一键部署 Kong 网关的 Shell 脚本 |
| `ingress-class.yaml`        | 注册 `IngressClass` 为 kong，确保 Kong 能识别 Ingress |
| `mock-services.yaml`        | 模拟 `/api` `/py` `/ai` `/` 路由的测试服务，方便本地验证 |
| `codekids-api-ingress.yaml` | 业务 Ingress 配置，包含 `/api` `/py` `/ai` `/` 路由 |
| `README.md`                 | 当前文档，操作说明 |

---

## 📦 一键部署步骤

### 1️⃣ 安装 Kong 网关（仅需一次）

```bash
helm repo add kong https://charts.konghq.com
helm repo update
./kong-helm-install.sh
```

### 2️⃣ 注册 IngressClass

```bash
kubectl apply -f ingress-class.yaml
```

---

### 3️⃣ 部署模拟服务（返回测试响应）

```bash
kubectl apply -f mock-services.yaml
```

服务响应：
- `/api` → Hello from Java API
- `/py` → Hello from Python API
- `/ai` → Hello from AI Service
- `/`   → Hello from Frontend

---

### 4️⃣ 应用稳定版 Ingress 路由配置

```bash
kubectl apply -f codekids-api-ingress.yaml
```

---

### 5️⃣ 配置本地域名（本地测试用）

编辑 hosts 文件：
```
C:\Windows\System32\drivers\etc\hosts
```

添加：
```
127.0.0.1 codekids.local
```

---

### 6️⃣ 浏览器访问测试

替换下方端口为你实际的 NodePort（如 30507）：

```
http://codekids.local:30507/api
http://codekids.local:30507/py
http://codekids.local:30507/ai
http://codekids.local:30507/
```

---

## ✅ 说明

- 如果遇到 `no peer from ring-balancer`，请重启 Kong 网关：
```bash
kubectl rollout restart deployment -n kong kong-kong
```

- 所有配置已按企业级部署标准处理，无需图形界面即可管理所有流量。

---

CodeKids 平台 Kong 网关配置完成 ✅
如需继续配置 TLS、CI/CD，请查看下一阶段说明。
