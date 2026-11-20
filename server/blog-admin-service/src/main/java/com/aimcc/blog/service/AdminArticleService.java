package com.aimcc.blog.service;

import com.aimcc.blog.dto.AdminArticleRequest;

public interface AdminArticleService {
    /**
     * 创建文章
     */
    Long createArticle(AdminArticleRequest request);

    /**
     * 更新文章
     */
    Long updateArticle(AdminArticleRequest request);

    /**
     * 删除文章
     */
    void deleteArticle(Long id);
}
