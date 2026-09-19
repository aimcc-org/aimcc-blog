package com.aimcc.blog.service.impl;

import com.aimcc.blog.entity.Article;
import com.aimcc.blog.mapper.ArticleMapper;
import com.aimcc.blog.service.ArticleService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleMapper articleMapper;

    @Override
    public Page<Article> listArticles(int page, int size, String sort) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, 1);
        if ("recommend".equals(sort)) {
            wrapper.eq(Article::getIsTop, 1);          // 推荐 = 只取精选文章
        }

        // 排序现状说明：new（最新）和 hot（热门）暂同，均按发布时间倒序——
        // 热门排序等详情接口做完、view_count 有真实数据积累后再改造
        wrapper.orderByDesc(Article::getPublishedAt);

        return articleMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public Article getArticleById(Long id) {
        return null;
    }
}
