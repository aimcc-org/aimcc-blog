package com.aimcc.blog.mapper;

import com.aimcc.blog.dto.TagVO;
import com.aimcc.blog.entity.Tag;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TagMapper extends BaseMapper<Tag> {

    /**
     * 标签云：所有标签 + 各自挂载的文章数（联表查询，SQL 在 resources/mapper/TagMapper.xml）
     */
    List<TagVO> selectTagCloud();
}
