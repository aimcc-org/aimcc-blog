package com.aimcc.blog.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Redis 限流工具：按 key 计数，每分钟最多 maxCount 次
 */
@Component
@RequiredArgsConstructor
public class RateLimiter {

    private final StringRedisTemplate redisTemplate;

    /**
     * 尝试获取请求许可
     * @param key 限流标识（比如 IP）
     * @param maxCount 每分钟最多多少次
     * @return true=放行，false=超过限制
     */
    public boolean tryAcquire(String key, int maxCount) {
        String redisKey = "rate:" + key;
        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count != null && count == 1) {
            // 第一次请求，设置 1 分钟后过期
            redisTemplate.expire(redisKey, Duration.ofMinutes(1));
        }
        return count != null && count <= maxCount;
    }
}
