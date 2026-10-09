package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.dto.AdminArticleRequest;
import com.aimcc.blog.service.AdminArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {
    private final AdminArticleService adminArticleService;

    @PostMapping
    public ApiResult<Long> create (@RequestBody AdminArticleRequest request) {
        return ApiResult.ok(adminArticleService.createArticle(request));
    }
}
