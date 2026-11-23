package com.aimcc.blog.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka 注册中心。
 *
 * 它只做一件事：保存「谁在线、在哪、还活着吗」这份名册，供网关查询。
 * 请求流量不经过这里——网关把名册拉到自己内存里，直连后端实例。
 */
@EnableEurekaServer
@SpringBootApplication
public class EurekaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }
}
