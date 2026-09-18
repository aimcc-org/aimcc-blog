package com.aimcc.blog.service;

import com.aimcc.blog.entity.Profile;

/**
 * 个人资料服务
 */
public interface ProfileService {

    /** 查询站点个人资料（单行表，永远只有一行） */
    Profile getProfile();
}

