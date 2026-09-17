package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.service.DemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 目录结构验证用 demo；后续放 ArticleController 等业务接口
 */
@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {

    private final DemoService demoService;

    /** 验证 Controller → Service → Mapper → MySQL 整条链路 */
    @GetMapping("/ping")
    public ApiResult<Integer> ping() {
        return ApiResult.ok(demoService.pingDatabase());
    }
}
