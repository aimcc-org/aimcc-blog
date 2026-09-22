package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.StatsVO;
import com.aimcc.blog.entity.Article;
import com.aimcc.blog.entity.Profile;
import com.aimcc.blog.mapper.ArticleMapper;
import com.aimcc.blog.mapper.ProfileMapper;
import com.aimcc.blog.service.StatsService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 站点统计服务实现
 */
@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final ProfileMapper profileMapper;
    private final ArticleMapper articleMapper;

    /** 站点统计：已发布文章数 + 博主年限 */
    @Override
    public StatsVO getStats() {
        // 数已发布的文章（status = 1，和列表接口口径一致）
        LambdaQueryWrapper<Article> countWrapper = new LambdaQueryWrapper<>();
        countWrapper.eq(Article::getStatus, 1);
        Long articleCount = articleMapper.selectCount(countWrapper);

        // 从 profile 单行表拿博主年限（selectOne(null) = 无条件查，单行表拿到的就是那一行）
        Profile profile = profileMapper.selectOne(null);

        // 组装出参
        StatsVO vo = new StatsVO();
        vo.setArticleCount(articleCount);
        vo.setYearsOfDev(profile.getYearsOfDev());
        return vo;
    }
}
