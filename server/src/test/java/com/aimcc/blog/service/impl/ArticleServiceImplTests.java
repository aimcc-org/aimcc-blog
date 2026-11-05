package com.aimcc.blog.service.impl;

import com.aimcc.blog.entity.Article;
import com.aimcc.blog.exception.BizException;
import com.aimcc.blog.mapper.ArticleMapper;
import com.aimcc.blog.mapper.TagMapper;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ArticleServiceImplTests {
    private final ArticleMapper articleMapper = mock(ArticleMapper.class);
    private final StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> valueOps = mock(ValueOperations.class);
    private final ArticleServiceImpl service =
            new ArticleServiceImpl(articleMapper, mock(TagMapper.class), redisTemplate);

    @Test
    void detailReturnsViewCountAfterIncrement() {
        Article article = publishedArticle(11);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(true);
        when(articleMapper.selectById(1L)).thenReturn(article);
        when(articleMapper.update(isNull(), any())).thenReturn(1);

        var detail = service.getArticleById(1L, "127.0.0.1");

        assertEquals(11, detail.getViewCount());
        assertEquals("# 正文", detail.getContent());
    }

    @Test
    void missingArticleReturns404WithoutIncrement() {
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(true);
        when(articleMapper.update(isNull(), any())).thenReturn(0);

        assertEquals(404, assertThrows(BizException.class,
                () -> service.getArticleById(1L, "127.0.0.1")).getCode());
    }

    @Test
    void repeatVisitDoesNotIncrement() {
        Article article = publishedArticle(11);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false); // 重复访问
        when(articleMapper.selectById(1L)).thenReturn(article);

        var detail = service.getArticleById(1L, "127.0.0.1");

        assertEquals(11, detail.getViewCount());
        // 重复访问不应该执行 update
        verify(articleMapper, never()).update(isNull(), any());
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
