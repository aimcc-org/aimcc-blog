package com.aimcc.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 文章卡片上的小标签（只要 id 和名字，卡片不需要文章数）
 */
@Data
@AllArgsConstructor
public class TagItemVO {

    /** 标签 id */
    private Long id;

    /** 标签名 */
    private String name;
}
