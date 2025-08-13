# ✅ CodeKids Kong 路由配置修复包

## 含 `/api` `/py` `/ai` 的路由全部修复（strip-path=false）

### ✅ 步骤：

1. 应用修复后的 Ingress
```
kubectl apply -f codekids-api-ingress.yaml
```

2. 添加 hosts（如未添加）
```
127.0.0.1 codekids.local
```

3. 通过 NodePort 测试访问：
```
http://codekids.local:<KONG_NODEPORT>/api
http://codekids.local:<KONG_NODEPORT>/py
http://codekids.local:<KONG_NODEPORT>/ai
http://codekids.local:<KONG_NODEPORT>/
```

请根据实际 NodePort 替换 `<KONG_NODEPORT>`（如 30507）
