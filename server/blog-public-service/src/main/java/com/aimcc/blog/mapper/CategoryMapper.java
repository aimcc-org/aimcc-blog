package com.aimcc.blog.mapper;

import com.aimcc.blog.dto.CategoryVO;
import com.aimcc.blog.entity.Category;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
    /**
     * 列出分类
     */
    List<CategoryVO> listCategories();
}