package com.aimcc.blog.service;

import com.aimcc.blog.dto.AdminLoginRequest;

/**
 * 管理端认证服务
 */
public interface AdminAuthService {

    /** 登录：验明正身，通过则返回 token */
    String login(AdminLoginRequest request);
}