package com.aimcc.blog.dto;

import lombok.Data;

/**
 * 标签云 VO：标签名 + 实时文章数
 */
@Data
public class TagVO {

    /** 标签 id */
    private Long id;

    /** 标签名 */
    private String name;

    /** 挂载的文章数（查询时实时 COUNT，非存储列） */
    private Integer articleCount;
}
