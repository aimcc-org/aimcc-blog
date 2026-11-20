package com.aimcc.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 管理员账号表
 */
@TableName("admin_user")
@Data
public class AdminUser {

    /** 主键（Sa-Token 的 loginId） */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 登录名 */
    private String username;

    /** BCrypt 密文，永不存明文 */
    private String passwordHash;

    /** 显示名 */
    private String nickname;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
