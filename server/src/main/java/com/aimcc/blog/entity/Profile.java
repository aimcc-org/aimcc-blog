package com.aimcc.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 个人资料表（单行表）：全站只有一行，存博主自己的信息
 */
@Data
@TableName("profile")
public class Profile {

    /** 主键，数据库自增 */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 昵称 */
    private String nickname;

    /** 头像图片 URL */
    private String avatar;

    /** 一句话签名 */
    private String bio;

    /** 座右铭 */
    private String quote;

    /** 开发年限 */
    private Integer yearsOfDev;

    /** GitHub 主页 */
    private String githubUrl;

    /** X(Twitter) 主页 */
    private String xUrl;

    /** B站主页 */
    private String bilibiliUrl;

    /** 联系邮箱 */
    private String email;

    /** 创建时间（数据库自动维护） */
    private LocalDateTime createdAt;

    /** 更新时间（数据库自动维护） */
    private LocalDateTime updatedAt;
}