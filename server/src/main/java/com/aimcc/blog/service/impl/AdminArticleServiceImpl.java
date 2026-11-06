package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.AdminArticleRequest;
import com.aimcc.blog.entity.Article;
import com.aimcc.blog.exception.BizException;
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

    @Override
    public Long updateArticle(AdminArticleRequest request) {
        Article existing = articleMapper.selectById(request.getId());
        if (existing == null) {
            throw new BizException(404, "文章不存在");
        }

        Article article = new Article();
        article.setId(request.getId());
        article.setTitle(request.getTitle());
        article.setSummary(request.getSummary());
        article.setCoverImage(request.getCoverImage());
        article.setReadingMinutes(request.getReadingMinutes());
        article.setIsTop(request.getIsTop());
        article.setCategoryId(request.getCategoryId());
        article.setContent(request.getContent());

        articleMapper.updateById(article);

        // 更新标签：先删旧的，再插新的
        tagMapper.deleteArticleTags(request.getId());
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            tagMapper.insertArticleTags(request.getId(), request.getTagIds());
        }

        return request.getId();
    }

    @Override
    public void deleteArticle(Long id) {
        Article existing = articleMapper.selectById(id);
        if (existing == null) {
            throw new BizException(404, "文章不存在");
        }

        // 先删标签关联，再删文章
        tagMapper.deleteArticleTags(id);
        articleMapper.deleteById(id);
    }
}
