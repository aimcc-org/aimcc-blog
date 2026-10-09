package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.AdminArticleRequest;
import com.aimcc.blog.entity.Article;
import com.aimcc.blog.mapper.ArticleMapper;
import com.aimcc.blog.mapper.TagMapper;
import com.aimcc.blog.service.AdminArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminArticleServiceImpl implements AdminArticleService {

    private final ArticleMapper articleMapper;

    private final TagMapper tagMapper;

    @Override
    public Long createArticle(AdminArticleRequest request) {
        Article article = new Article();

        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setCoverImage(request.getCoverImage());
        article.setReadingMinutes(request.getReadingMinutes());
        article.setIsTop(request.getIsTop());
        article.setCategoryId(request.getCategoryId());
        article.setContent(request.getContent());
        article.setStatus(1);  // 默认已发布
        article.setPublishedAt(LocalDateTime.now());  // 默认当前时间

        articleMapper.insert(article);

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            tagMapper.insertArticleTags(article.getId(), request.getTagIds());
        }

        return article.getId();
    }
}
