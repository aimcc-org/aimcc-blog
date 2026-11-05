package com.aimcc.blog.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * IP 工具：兼容本地直连和 nginx 反向代理两种场景
 */
public class IpUtils {

    public static String getClientIp(HttpServletRequest request) {
        // nginx 代理时会把真实 IP 放到这个头里
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For 可能有多个 IP（多层代理），取第一个
            int comma = ip.indexOf(',');
            return comma > 0 ? ip.substring(0, comma).trim() : ip;
        }
        // 拿不到就用 TCP 连接的 IP（本地直连时就是这个）
        return request.getRemoteAddr();
    }
}
