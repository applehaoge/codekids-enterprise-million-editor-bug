#!/bin/bash

echo "=== 🚀 CodeKids Enterprise 网络连通性+API健康检查开始 ==="
echo ""

# 服务列表
declare -A services=(
  [MySQL]="codekids-enterprise-million-v2-mysql-1:3306"
  [Redis]="codekids-enterprise-million-v2-redis-1:6379"
  [MongoDB]="codekids-enterprise-million-v2-mongodb-1:27017"
  [RabbitMQ]="codekids-enterprise-million-v2-rabbitmq-1:5672"
  [MinIO]="codekids-enterprise-million-v2-minio-1:9000"
  [JavaBackend]="codekids-enterprise-million-v2-java-backend-1:8080"
  [PythonBackend]="codekids-enterprise-million-v2-python-backend-1:5000"
  [AIService]="codekids-enterprise-million-v2-ai-service-1:8000"
  [Frontend]="codekids-enterprise-million-v2-frontend-1:3000"
  [Nginx]="codekids-enterprise-million-v2-nginx-1:80"
)

# 网络端口检查
echo "=== 🔗 网络端口连通性检查 ==="
for name in "${!services[@]}"; do
    host="${services[$name]%:*}"
    port="${services[$name]#*:}"
    echo -n "Checking $name ($host:$port) ... "
    nc -z -w 3 $host $port && echo "✅ OK" || echo "❌ FAILED"
done

echo ""
echo "=== 🧠 API 健康检查 ==="

# API 健康检查
declare -A api_endpoints=(
  [JavaBackend]="http://codekids-enterprise-million-v2-java-backend-1:8080/api/actuator/health"
  [PythonBackend]="http://codekids-enterprise-million-v2-python-backend-1:5000/health"
  [AIService]="http://codekids-enterprise-million-v2-ai-service-1:8000/health"
  [Frontend]="http://codekids-enterprise-million-v2-frontend-1:3000"
  [Nginx]="http://codekids-enterprise-million-v2-nginx-1"
)

for name in "${!api_endpoints[@]}"; do
    url="${api_endpoints[$name]}"
    echo -n "Checking API $name ($url) ... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [[ "$status" == "200" || "$status" == "302" ]]; then
        echo "✅ HTTP $status OK"
    else
        echo "❌ HTTP $status FAILED"
    fi
done

echo ""
echo "=== 🏁 检查完成 ==="
