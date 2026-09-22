package com.aimcc.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.aimcc.blog.dto.AdminLoginRequest;
import com.aimcc.blog.entity.AdminUser;
import com.aimcc.blog.exception.BizException;
import com.aimcc.blog.mapper.AdminUserMapper;
import com.aimcc.blog.service.AdminAuthService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 管理端认证服务实现
 */
@Service
@RequiredArgsConstructor
public class AdminAuthServiceImpl implements AdminAuthService {

    private final AdminUserMapper adminUserMapper;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /** 登录：验明正身，通过则返回 token */
    @Override
    public String login(AdminLoginRequest request) {
        // 一、按登录名找账号
        LambdaQueryWrapper<AdminUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminUser::getUsername, request.getUsername());
        AdminUser admin = adminUserMapper.selectOne(wrapper);

        // 二、BCrypt 校验：把你输入的密码现场加密，和库里的密文比对
        // 注意：错误提示统一说"用户名或密码错误"，不区分哪个错——防外人试探枚举
        boolean matched = admin != null && encoder.matches(request.getPassword(), admin.getPasswordHash());
        if (!matched) {
            throw new BizException(401, "用户名或密码错误");
        }

        // 三、验明正身 → Sa-Token 发 token（loginId 用账号 id）
        StpUtil.login(admin.getId());
        return StpUtil.getTokenValue();
    }
}
