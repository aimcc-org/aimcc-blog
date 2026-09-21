package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.ArticleDetailVO;
import com.aimcc.blog.dto.ArticleListVO;
import com.aimcc.blog.dto.ArticleTagRow;
import com.aimcc.blog.dto.TagItemVO;
import com.aimcc.blog.entity.Article;
import com.aimcc.blog.exception.BizException;
import com.aimcc.blog.mapper.ArticleMapper;
import com.aimcc.blog.mapper.TagMapper;
import com.aimcc.blog.service.ArticleService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleMapper articleMapper;
    private final TagMapper tagMapper;

    @Override
    public Page<ArticleListVO> listArticles(int page, int size, String sort, Long tagId) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, 1);                     // 只看已发布
        if ("recommend".equals(sort)) {
            wrapper.eq(Article::getIsTop, 1);                  // 推荐 = 只取精选文章
        }
        if (tagId != null) {
            // 标签过滤：id 在（挂了该标签的文章 id）里——中间表两跳接力的子查询写法
            wrapper.inSql(Article::getId, "select article_id from article_tag where tag_id = " + tagId);
        }
        // 排序现状说明：new（最新）和 hot（热门）暂同，均按发布时间倒序——
        // 热门排序等 view_count 有真实数据积累后再改造
        wrapper.orderByDesc(Article::getPublishedAt);

        Page<Article> articlePage = articleMapper.selectPage(new Page<>(page, size), wrapper);

        // entity → VO 逐个转换
        List<ArticleListVO> voRecords = new ArrayList<>();
        for (Article article : articlePage.getRecords()) {
            voRecords.add(toListVO(article));
        }
        Page<ArticleListVO> voPage = new Page<>(articlePage.getCurrent(), articlePage.getSize(), articlePage.getTotal());
        voPage.setRecords(voRecords);

        // 批量组装标签：两条查询 + 内存归堆（避免循环单查的 N+1）
        // 第一步：收集这一页文章的 id（查标签连线的"购物清单"）
        List<Long> articleIds = new ArrayList<>();
        for (ArticleListVO vo : voRecords) {
            articleIds.add(vo.getId());
        }
        if (!articleIds.isEmpty()) {
            // 第二步：一次查回所有连线行（articleId, tagId, tagName）
            List<ArticleTagRow> rows = tagMapper.selectTagsByArticleIds(articleIds);
            // 第三步：按文章 id 归堆
            Map<Long, List<TagItemVO>> tagsByArticle = new HashMap<>();
            for (ArticleTagRow row : rows) {
                List<TagItemVO> pile = tagsByArticle.get(row.getArticleId());
                if (pile == null) {                            // 该文章第一次出现 → 先建空堆
                    pile = new ArrayList<>();
                    tagsByArticle.put(row.getArticleId(), pile);
                }
                pile.add(new TagItemVO(row.getTagId(), row.getTagName()));
            }
            // 第四步：每篇文章认领自己的堆；没标签的给空列表（不给 null，防前端渲染炸）
            for (ArticleListVO vo : voRecords) {
                vo.setTags(tagsByArticle.getOrDefault(vo.getId(), List.of()));
            }
        } else {
            // 空页跳过查询（in () 空括号是 SQL 语法错误），但 tags 仍给空列表
            for (ArticleListVO vo : voRecords) {
                vo.setTags(List.of());
            }
        }
        return voPage;
    }

    @Override
    public ArticleDetailVO getArticleById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null || article.getStatus() != 1) {
            throw new BizException(404, "文章不存在");
        }
        // 浏览量+1：让数据库自己加（原子操作），不读回 Java 再写回
        LambdaUpdateWrapper<Article> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Article::getId, id);
        updateWrapper.setSql("view_count = view_count + 1");
        articleMapper.update(null, updateWrapper);
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
