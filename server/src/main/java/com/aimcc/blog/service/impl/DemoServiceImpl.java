package com.aimcc.blog.service.impl;

import com.aimcc.blog.mapper.DemoMapper;
import com.aimcc.blog.service.DemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 目录结构验证用 demo 实现；业务实现类统一放 impl 包
 */
@Service
@RequiredArgsConstructor
public class DemoServiceImpl implements DemoService {

    private final DemoMapper demoMapper;

    @Override
    public Integer pingDatabase() {
        return demoMapper.ping();
    }
}
