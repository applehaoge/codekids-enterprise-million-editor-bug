package com.codekids;  // 确保包路径与 ApiController 一致

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // 启动 Spring Boot 应用
public class JavaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaBackendApplication.class, args);  // 启动应用
    }
}
