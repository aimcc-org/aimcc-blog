package com.aimcc.blog.service.impl;

import com.aimcc.blog.dto.TagVO;
import com.aimcc.blog.mapper.TagMapper;
import com.aimcc.blog.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagMapper tagMapper;

    @Override
    public List<TagVO> getTagCloud() {
        return tagMapper.selectTagCloud();
    }
}
