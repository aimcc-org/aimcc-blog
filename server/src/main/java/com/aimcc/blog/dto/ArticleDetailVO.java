package com.aimcc.blog.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文章详情 VO：详情页用，比列表 VO 多一个正文 content
 */
@Data
public class ArticleDetailVO {

    /** 文章 id */
    private Long id;

    /** 标题 */
    private String title;

    /** 摘要 */
    private String summary;

    /** 封面图 URL */
    private String coverImage;

    /** 正文 Markdown */
    private String content;

    /** 阅读时长（分钟） */
    private Integer readingMinutes;

    /** 是否精选：0否 1是 */
    private Integer isTop;

    /** 浏览量 */
    private Integer viewCount;

    /** 发布时间 */
    private LocalDateTime publishedAt;
}
