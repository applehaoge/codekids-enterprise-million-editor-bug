FROM python:3.10-slim

# 安装基础依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl && \
    rm -rf /var/lib/apt/lists/*

# 工作目录
WORKDIR /app

# 拷贝代码
COPY . /app

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 容器端口
EXPOSE 5000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# 启动命令
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
