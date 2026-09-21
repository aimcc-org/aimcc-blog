package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.dto.ArticleDetailVO;
import com.aimcc.blog.dto.ArticleListVO;
import com.aimcc.blog.service.ArticleService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 文章接口：列表（最新/热门/推荐三个页签共用）+ 详情
 */
@RestController
@RequestMapping("/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    /** 文章分页列表（tagId 可选：只返回挂了该标签的文章） */
    @GetMapping
    public ApiResult<Page<ArticleListVO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "new") String sort,
            @RequestParam(required = false) Long tagId) {
        return ApiResult.ok(articleService.listArticles(page, size, sort, tagId));
    }

    /** 文章详情 */
    @GetMapping("/{id}")
    public ApiResult<ArticleDetailVO> detail(@PathVariable Long id) {
        return ApiResult.ok(articleService.getArticleById(id));
    }
}
