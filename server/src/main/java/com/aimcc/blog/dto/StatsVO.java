package com.aimcc.blog.dto;

import lombok.Data;

/**
 * 站点统计 VO：首页统计区出参
 */
@Data
public class StatsVO {

    /** 已发布文章数（实时 COUNT） */
    private Long articleCount;

    /** 博主开发年限（来自 profile 表） */
    private Integer yearsOfDev;
}
