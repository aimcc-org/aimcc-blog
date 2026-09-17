package com.aimcc.blog.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * 目录结构验证用 demo；后续放 ArticleMapper、CategoryMapper 等业务 Mapper
 */
@Mapper
public interface DemoMapper {

    @Select("SELECT 1")
    Integer ping();
}
