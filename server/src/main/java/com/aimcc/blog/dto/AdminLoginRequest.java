package com.aimcc.blog.dto;

import lombok.Data;

/**
 * 登录请求体：前端 POST 过来的 JSON 就长这样
 */
@Data
public class AdminLoginRequest {

    /** 登录名 */
    private String username;

    /** 明文密码（只在请求瞬间存在，永不落库、永不进日志） */
    private String password;
}
