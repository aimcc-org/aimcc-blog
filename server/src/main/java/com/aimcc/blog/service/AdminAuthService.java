package com.aimcc.blog.service;

import com.aimcc.blog.dto.AdminLoginRequest;
import com.aimcc.blog.dto.AdminRegisterRequest;

/**
 * 管理端认证服务
 */
public interface AdminAuthService {

    /** 登录：验明正身，通过则返回 token */
    String login(AdminLoginRequest request);

    /** 注册：创建新管理员账号（受保护），返回新账号 id */
    Long register(AdminRegisterRequest request);
}