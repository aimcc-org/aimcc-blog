package com.aimcc.blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 管理服务启动类：后台读写接口 + 登录鉴权 + 数据库迁移
 *
 * 端口 8082，context-path 仍是 /api，所以对外路径形如 /api/admin/articles
 * 本服务是唯一执行 Flyway 迁移的进程
 */
@SpringBootApplication
public class AdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminApplication.class, args);
    }

}
