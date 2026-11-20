package com.aimcc.blog.mapper;

import com.aimcc.blog.entity.Tag;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 管理服务自己的标签 Mapper：
 * 只保留后台写文章时会用到的两条连线操作，不包含前台的标签云查询
 */
@Mapper
public interface TagMapper extends BaseMapper<Tag> {

    /** 批量插入文章标签连线 */
    void insertArticleTags(@Param("articleId") Long articleId, @Param("tagIds") List<Long> tagIds);

    /** 删除某篇文章的所有标签关联 */
    void deleteArticleTags(@Param("articleId") Long articleId);
}
