package com.aimcc.blog.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 管理员文章请求参数
 */
@Data
public class AdminArticleRequest {

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

    /** 分类ID */
    private Long categoryId;

    /** 发布时间 */
    private LocalDateTime publishedAt;

    /** 标签列表 */
    private List<Long> tagIds;

    /** 文章内容 */
    private String content;

}
