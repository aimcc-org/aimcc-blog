package com.aimcc.blog.service.impl;

import com.aimcc.blog.entity.Article;
import com.aimcc.blog.exception.BizException;
import com.aimcc.blog.mapper.ArticleMapper;
import com.aimcc.blog.mapper.TagMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArticleServiceImplTests {
    private final ArticleMapper articleMapper = mock(ArticleMapper.class);
    private final ArticleServiceImpl service =
            new ArticleServiceImpl(articleMapper, mock(TagMapper.class));

    @Test
    void detailReturnsViewCountAfterIncrement() {
        Article before = publishedArticle(10);
        Article after = publishedArticle(11);
        when(articleMapper.selectById(1L)).thenReturn(before, after);

        var detail = service.getArticleById(1L);

        assertEquals(11, detail.getViewCount());
        assertEquals("# 正文", detail.getContent());
        var order = inOrder(articleMapper);
        order.verify(articleMapper).selectById(1L);
        order.verify(articleMapper).update(isNull(), any(com.baomidou.mybatisplus.core.conditions.Wrapper.class));
        order.verify(articleMapper).selectById(1L);
    }

    @Test
    void missingArticleReturns404WithoutIncrement() {
        when(articleMapper.selectById(1L)).thenReturn(null);
        assertEquals(404, assertThrows(BizException.class,
                () -> service.getArticleById(1L)).getCode());
        verify(articleMapper).selectById(1L);
        verifyNoMoreInteractions(articleMapper);
    }

    @Test
    void unpublishedArticleReturns404WithoutIncrement() {
        Article draft = publishedArticle(10);
        draft.setStatus(0);
        when(articleMapper.selectById(1L)).thenReturn(draft);
        assertEquals(404, assertThrows(BizException.class,
                () -> service.getArticleById(1L)).getCode());
        verify(articleMapper).selectById(1L);
        verifyNoMoreInteractions(articleMapper);
    }

    private Article publishedArticle(int viewCount) {
        Article article = new Article();
        article.setId(1L);
        article.setStatus(1);
        article.setContent("# 正文");
        article.setViewCount(viewCount);
        return article;
    }
}
