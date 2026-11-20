package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.dto.CategoryVO;
import com.aimcc.blog.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categorys")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    /** 分类列表（侧边栏用，每个分类带文章数） */
    @GetMapping
    public ApiResult<List<CategoryVO>> listCategories() {
        return ApiResult.ok(categoryService.listCategories());
    }

}
