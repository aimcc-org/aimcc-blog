package com.aimcc.blog.service;

import com.aimcc.blog.dto.StatsVO;

/**
 * 站点统计服务
 */
public interface StatsService {

    /** 站点统计：已发布文章数 + 博主年限 */
    StatsVO getStats();
}
