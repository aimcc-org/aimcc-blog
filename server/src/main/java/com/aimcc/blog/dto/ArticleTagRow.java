package com.aimcc.blog.dto;

import lombok.Data;

/**
 * 联表查询的行形状：哪篇文章 + 哪个标签（内部组装用，不出接口）
 */
@Data
public class ArticleTagRow {

    /** 文章 id（Java 里按它归堆） */
    private Long articleId;

    /** 标签 id */
    private Long tagId;

    /** 标签名 */
    private String tagName;
}
