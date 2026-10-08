package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.CategoryVO;
import com.aimcc.blog.mapper.CategoryMapper;
import com.aimcc.blog.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryMapper categoryMapper;
    @Override
    public List<CategoryVO> listCategories() {
        return categoryMapper.listCategories();
    }
}
