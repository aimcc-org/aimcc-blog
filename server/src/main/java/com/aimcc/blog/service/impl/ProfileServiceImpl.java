package com.aimcc.blog.service.impl;

import com.aimcc.blog.entity.Profile;
import com.aimcc.blog.mapper.ProfileMapper;
import com.aimcc.blog.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 个人资料服务实现
 */
@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileMapper profileMapper;

    @Override
    public Profile getProfile() {
        return profileMapper.selectOne(null);
    }
}
