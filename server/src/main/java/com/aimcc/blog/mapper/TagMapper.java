package com.aimcc.blog.mapper;

import com.aimcc.blog.dto.ArticleTagRow;
import com.aimcc.blog.dto.TagVO;
import com.aimcc.blog.entity.Tag;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TagMapper extends BaseMapper<Tag> {

    /**
     * 标签云：所有标签 + 各自挂载的文章数（联表查询，SQL 在 resources/mapper/TagMapper.xml）
     */
    List<TagVO> selectTagCloud();

    /**
     * 批量查若干文章的标签连线（联表 + foreach 动态 SQL，SQL 在 TagMapper.xml）
     *
     * @param articleIds 文章 id 列表；@Param 给参数起名，XML 的 foreach 靠名字取它
     */
    List<ArticleTagRow> selectTagsByArticleIds(@Param("articleIds") List<Long> articleIds);
}
