package com.aimcc.blog.controller;

import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.entity.Profile;
import com.aimcc.blog.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/about")
@RequiredArgsConstructor
public class AboutController {
    private final ProfileService profileService;

    /** 获取博主资料（关于我卡片数据） */
    @GetMapping
    public ApiResult<Profile> about() {
        return ApiResult.ok(profileService.getProfile());
    }

}
