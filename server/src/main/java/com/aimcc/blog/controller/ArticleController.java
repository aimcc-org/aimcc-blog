package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.dto.ArticleDetailVO;
import com.aimcc.blog.dto.ArticleListVO;
import com.aimcc.blog.enums.ArticleSort;
import com.aimcc.blog.exception.BizException;
import com.aimcc.blog.service.ArticleService;
import com.aimcc.blog.util.IpUtils;
import com.aimcc.blog.util.RateLimiter;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
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
    private final RateLimiter rateLimiter;

    /** 文章分页列表（tagId 可选：只返回挂了该标签的文章, categoryId 可选：只返回该分类下的文章） */
    @GetMapping
    public ApiResult<Page<ArticleListVO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "NEW") ArticleSort sort,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            HttpServletRequest request) {
        // 限流：每个 IP 每分钟最多 10 次
        String ip = IpUtils.getClientIp(request);
        if (!rateLimiter.tryAcquire(ip, 10)) {
            throw new BizException(429, "请求太频繁，稍后再试");
        }
        // 防止恶意传 ?size=10000 一次读穿数据库
        if (size > 50) size = 50;
        return ApiResult.ok(articleService.listArticles(page, size, sort, categoryId, tagId));
    }

    /** 文章详情 */
    @GetMapping("/{id}")
    public ApiResult<ArticleDetailVO> detail(@PathVariable Long id, HttpServletRequest request) {
        String ip = IpUtils.getClientIp(request);
        return ApiResult.ok(articleService.getArticleById(id, ip));
    }
}
