package com.aimcc.blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 公开服务启动类：面向前台博客的只读接口
 *
 * 端口 8081，context-path 仍是 /api，所以对外路径形如 /api/articles
 * 不引入 Sa-Token：公开接口不校验登录态
 */
@SpringBootApplication
public class PublicApplication {

    public static void main(String[] args) {
        SpringApplication.run(PublicApplication.class, args);
    }

}
