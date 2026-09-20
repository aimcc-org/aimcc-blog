package com.aimcc.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文章表
 */
@TableName("article")
@Data
public class Article {

    /** 主键，数据库自增 */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 标题 */
    private String title;

    /** 摘要（列表卡片用） */
    private String summary;

    /** 封面图 URL */
    private String coverImage;

    /** 正文 Markdown */
    private String content;

    /** 阅读时长（分钟） */
    private Integer readingMinutes;

    /** 是否精选：0否 1是 */
    private Integer isTop;

    /** 浏览量（详情页访问时自增） */
    private Integer viewCount;

    /** 状态：0草稿 1已发布 */
    private Integer status;

    /** 发布时间 */
    private LocalDateTime publishedAt;

    /** 创建时间（数据库自动维护） */
    private LocalDateTime createdAt;

    /** 更新时间（数据库自动维护） */
    private LocalDateTime updatedAt;
}
