package com.aimcc.blog.service;

import com.aimcc.blog.dto.TagVO;

import java.util.List;

/**
 * 标签服务
 */
public interface TagService {

    /** 标签云：所有标签 + 文章数，按文章数降序 */
    List<TagVO> getTagCloud();
}
