package com.aimcc.blog.service;

import com.aimcc.blog.dto.ArticleDetailVO;
import com.aimcc.blog.dto.ArticleListVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * 文章服务（对外只暴露 VO，不暴露 entity）
 */
public interface ArticleService {

    /**
     * 分页查询文章列表（仅已发布）
     *
     * @param page  页码（从 1 开始）
     * @param size  每页条数
     * @param sort  排序：new 最新 / hot 热门 / recommend 推荐
     * @param tagId 标签过滤（可选，null = 不过滤）
     */
    Page<ArticleListVO> listArticles(int page, int size, String sort, Long tagId);

    /** 按 id 查询文章详情 */
    ArticleDetailVO getArticleById(Long id);
}
