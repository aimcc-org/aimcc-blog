package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.dto.StatsVO;
import com.aimcc.blog.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 站点统计接口
 */
@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    /** 站点统计（已发布文章数 + 博主年限） */
    @GetMapping
    public ApiResult<StatsVO> getStats() {
        return ApiResult.ok(statsService.getStats());
    }
}
