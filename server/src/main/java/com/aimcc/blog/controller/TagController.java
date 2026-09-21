package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.dto.TagVO;
import com.aimcc.blog.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 标签接口
 */
@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    /** 标签云（标签名 + 实时文章数） */
    @GetMapping
    public ApiResult<List<TagVO>> tagCloud() {
        return ApiResult.ok(tagService.getTagCloud());
    }
}
