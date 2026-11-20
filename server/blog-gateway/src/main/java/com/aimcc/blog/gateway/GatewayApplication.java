package com.aimcc.blog.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 网关启动类：全局唯一入口（8080）
 *
 * 按路径前缀分流：
 *   /api/admin/**  -> 管理服务 8082
 *   /api/**        -> 公开服务 8081
 * 两个服务都自带 context-path=/api，所以网关不做 StripPrefix，路径原样透传
 */
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

}
