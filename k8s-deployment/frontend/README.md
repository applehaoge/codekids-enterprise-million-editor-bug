
# ✅ CodeKids Enterprise · Kubernetes 前端部署与 Ingress 配置文档

本节记录 CodeKids Enterprise 项目的前端服务在 Kubernetes 中的部署配置，包含镜像部署、服务暴露、Ingress 路由说明。

---

## 🧱 前端服务配置

**路径：** `k8s-deployment/frontend/frontend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: applehaoge/codekids-frontend:latest
          ports:
            - containerPort: 80  # Nginx 容器监听 80 端口
```

---

## 🌐 对应 Service 配置

**路径：** `k8s-deployment/frontend/frontend-service-fixed.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

---

## 🚪 Ingress 配置（整合所有服务）

**路径：** `k8s-deployment/frontend/codekids-ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: codekids-ingress
  annotations:
    # nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: codekids.local
      http:
        paths:
          - path: /api/
            pathType: Prefix
            backend:
              service:
                name: java-backend
                port:
                  number: 8080

          - path: /py/
            pathType: Prefix
            backend:
              service:
                name: python-backend
                port:
                  number: 5000

          - path: /ai/
            pathType: Prefix
            backend:
              service:
                name: ai-service
                port:
                  number: 8000

          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

---

## 🧪 部署与测试命令

```bash
kubectl apply -f k8s-deployment/frontend/codekids-ingress.yaml
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx
```

---

## 🧭 本地访问说明

确保你已经将域名 `codekids.local` 添加到本地 hosts 文件：

```
127.0.0.1 codekids.local
```

访问地址测试：

- http://codekids.local/
- http://codekids.local/api/
- http://codekids.local/py/
- http://codekids.local/ai/
