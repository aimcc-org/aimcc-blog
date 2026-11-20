package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.TagVO;
import com.aimcc.blog.mapper.TagMapper;
import com.aimcc.blog.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.List;
/**
 * 标签服务（标签云带 Redis 缓存：读多写少场景）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagMapper tagMapper;
    private final StringRedisTemplate redisTemplate; //操作Redis对象
    private final ObjectMapper objectMapper;

    /** 缓存键：项目名 + 数据含义，避免和其他缓存撞名 */
    private static final String TAG_CLOUD_CACHE_KEY = "blog:cache:tagCloud";

    /** 缓存有效期 5 分钟 */
    private static final Duration TAG_CLOUD_CACHE_TTL = Duration.ofSeconds(300);

    @Override
    public List<TagVO> getTagCloud() {
        // 一、先查缓存：命中就直接返回（数据库完全不碰）
        try {
            String cached = redisTemplate.opsForValue().get(TAG_CLOUD_CACHE_KEY);
            if (cached != null) {
                log.info("标签云：缓存命中");
                return objectMapper.readValue(cached, new TypeReference<>() {});
            }
        } catch (Exception e) {
            // 缓存挂了不能拖垮业务：记日志，回退数据库查询
            log.warn("读取标签云缓存失败，回退数据库查询", e);
        }

        // 二、未命中：查数据库（原有逻辑）
        List<TagVO> list = tagMapper.selectTagCloud();

        // 三、回填缓存：写失败也不影响本次返回（下次再试）
        try {
            String json = objectMapper.writeValueAsString(list);
            redisTemplate.opsForValue().set(TAG_CLOUD_CACHE_KEY, json, TAG_CLOUD_CACHE_TTL);
            log.info("标签云：已回填缓存，条数 {}", list.size());
        } catch (Exception e) {
            log.warn("写入标签云缓存失败（不影响本次返回）", e);
        }
        return list;
    }
}
