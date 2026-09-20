package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.ArticleDetailVO;
import com.aimcc.blog.dto.ArticleListVO;
import com.aimcc.blog.entity.Article;
import com.aimcc.blog.exception.BizException;
import com.aimcc.blog.mapper.ArticleMapper;
import com.aimcc.blog.service.ArticleService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleMapper articleMapper;

    @Override
    public Page<ArticleListVO> listArticles(int page, int size, String sort) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, 1);
        if ("recommend".equals(sort)) {
            wrapper.eq(Article::getIsTop, 1);          // 推荐 = 只取精选文章
        }

        // 排序现状说明：new（最新）和 hot（热门）暂同，均按发布时间倒序——
        // 热门排序等详情接口做完、view_count 有真实数据积累后再改造
        wrapper.orderByDesc(Article::getPublishedAt);

        Page<Article> articlePage = articleMapper.selectPage(new Page<>(page, size), wrapper);

        // 查出来的是 Page<Article>，要换成 Page<ArticleListVO> 再交给上层：
        // records（数据本体）逐条转 VO，分页信息（第几页/每页几条/总数）原样照搬
        Page<ArticleListVO> voPage = new Page<>(articlePage.getCurrent(), articlePage.getSize(), articlePage.getTotal());
        voPage.setRecords(articlePage.getRecords().stream().map(this::toListVO).toList());
        return voPage;
    }

    @Override
    public ArticleDetailVO getArticleById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getStatus() != 1) {
            throw new BizException(404, "文章不存在");
        }
        // 浏览量+1：让数据库自己加（view_count = view_count + 1），不读回 Java 再写回
        articleMapper.update(null,
                new LambdaUpdateWrapper<Article>()
                        .eq(Article::getId, id)
                        .setSql("view_count = view_count + 1"));
        return toDetailVO(article);
    }

    /** entity → 列表 VO，手动逐字段赋值 */
    private ArticleListVO toListVO(Article article) {
        ArticleListVO vo = new ArticleListVO();
        vo.setId(article.getId());
        vo.setTitle(article.getTitle());
        vo.setSummary(article.getSummary());
        vo.setCoverImage(article.getCoverImage());
        vo.setReadingMinutes(article.getReadingMinutes());
        vo.setIsTop(article.getIsTop());
        vo.setPublishedAt(article.getPublishedAt());
        return vo;
    }

    /** entity → 详情 VO（列表 VO 的字段 + 正文） */
    private ArticleDetailVO toDetailVO(Article article) {
        ArticleDetailVO vo = new ArticleDetailVO();
        vo.setId(article.getId());
        vo.setTitle(article.getTitle());
        vo.setSummary(article.getSummary());
        vo.setCoverImage(article.getCoverImage());
        vo.setContent(article.getContent());
        vo.setReadingMinutes(article.getReadingMinutes());
        vo.setIsTop(article.getIsTop());
        vo.setViewCount(article.getViewCount());
        vo.setPublishedAt(article.getPublishedAt());
        return vo;
    }
}
