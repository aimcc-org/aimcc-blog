package com.aimcc.blog.dto;

import lombok.Data;

/**
 * 分类列表
 */
@Data
public class CategoryVO {
    /**
     * 分类ID
     */
    private Long id;
    /**
     * 分类名称
     */
    private String name;
    /**
     * 文章数量
     */
    private Integer articleCount;
}
