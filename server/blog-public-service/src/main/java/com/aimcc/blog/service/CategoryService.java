package com.aimcc.blog.service;

import com.aimcc.blog.dto.CategoryVO;

import java.util.List;

/**
 * 分类
 */

public interface CategoryService {
    /**
     * 列出分类
     */
    List<CategoryVO> listCategories();
}
