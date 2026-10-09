package com.aimcc.blog.service;

import com.aimcc.blog.dto.AdminArticleRequest;

public interface AdminArticleService {
    /**
     * 创建文章
     */
    Long createArticle(AdminArticleRequest request);
}
