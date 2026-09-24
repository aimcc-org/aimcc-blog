package com.aimcc.blog.dto;

import lombok.Data;

/**
 * 注册请求体：管理员邀请制（拦截器上线后仅登录管理员可调用）
 */
@Data
public class AdminRegisterRequest {

    /** 登录名（全表唯一） */
    private String username;

    /** 明文密码（写时加密，只在请求瞬间存在） */
    private String password;

    /** 显示名（将来文章 created_by 用） */
    private String nickname;
}
