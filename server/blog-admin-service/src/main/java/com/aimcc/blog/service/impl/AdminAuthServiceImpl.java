package com.aimcc.blog.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.aimcc.blog.dto.AdminLoginRequest;
import com.aimcc.blog.dto.AdminRegisterRequest;
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

    /** 注册：创建新管理员账号（受保护），返回新账号 id */
    @Override
    public Long register(AdminRegisterRequest request) {
        // 一、基础校验：非空 + 密码下限
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BizException(400, "用户名不能为空");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BizException(400, "密码不能为空");
        }
        if (request.getPassword().length() < 6) {
            throw new BizException(400, "密码至少 6 位");
        }

        // 二、用户名查重（数据库 UNIQUE 约束之外的代码侧提前拦截，报错更友好）
        LambdaQueryWrapper<AdminUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AdminUser::getUsername, request.getUsername());
        if (adminUserMapper.selectOne(wrapper) != null) {
            throw new BizException(400, "用户名已存在");
        }

        // 三、密码写时加密：明文在这一行变成密文，方法结束后即被丢弃
        String passwordHash = encoder.encode(request.getPassword());

        // 四、insert 首秀：入库
        AdminUser admin = new AdminUser();
        admin.setUsername(request.getUsername());
        admin.setPasswordHash(passwordHash);
        admin.setNickname(request.getNickname());
        adminUserMapper.insert(admin);
        return admin.getId();
    }
}
