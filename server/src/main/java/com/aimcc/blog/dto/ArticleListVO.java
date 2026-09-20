package com.aimcc.blog.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文章列表 VO：首页卡片用，刻意不含正文 content（列表页用不到，省流量）
 */
@Data
public class ArticleListVO {

    /** 文章 id */
    private Long id;

    /** 标题 */
    private String title;

    /** 摘要 */
    private String summary;

    /** 封面图 URL */
    private String coverImage;

    /** 阅读时长（分钟） */
    private Integer readingMinutes;

    /** 是否精选：0否 1是 */
    private Integer isTop;

    /** 发布时间 */
    private LocalDateTime publishedAt;
}
