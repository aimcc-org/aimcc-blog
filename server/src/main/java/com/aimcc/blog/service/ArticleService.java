package com.aimcc.blog.service;

import com.aimcc.blog.entity.Article;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * 文章服务
 */
public interface ArticleService {

    /**
     * 分页查询文章列表（仅已发布）
     *
     * @param page 页码（从 1 开始）
     * @param size 每页条数
     * @param sort 排序：new 最新 / hot 热门 / recommend 推荐
     */
    Page<Article> listArticles(int page, int size, String sort);

    /** 按 id 查询文章详情 */
    Article getArticleById(Long id);
}
