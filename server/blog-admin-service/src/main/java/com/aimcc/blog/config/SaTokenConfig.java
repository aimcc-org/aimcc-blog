package com.aimcc.blog.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 拦截器配置：管理端接口上锁
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    /**
     * /admin/** 全部验 token，登录接口和接口文档免刷卡。
     * 文档放行是因为 Swagger UI 不会带 token；生产环境用 SPRINGDOC_ENABLED=false 把文档整体关掉，
     * 所以这里放行不会把管理接口暴露到线上。
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/admin/**")
                .excludePathPatterns(
                        "/admin/login",
                        "/admin/v3/api-docs",
                        "/admin/v3/api-docs/**",
                        "/admin/swagger-ui.html",
                        "/admin/swagger-ui/**");
    }
}