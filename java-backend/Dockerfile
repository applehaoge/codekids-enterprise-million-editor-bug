# 使用 OpenJDK 作为基础镜像
FROM openjdk:17-jdk-slim

# 安装 curl（容器健康检查需要）
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 JAR 文件到容器内
COPY target/java-backend-1.0*.jar /app/codekids-backend.jar



# 复制配置文件（🔥 推荐！）
COPY src/main/resources/application.yml /app/application.yml

# 健康检查：调用 Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["java", "-jar", "/app/codekids-backend.jar", "--spring.config.location=file:/app/application.yml", "--server.port=8080"]
