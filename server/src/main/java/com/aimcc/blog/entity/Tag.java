package com.aimcc.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 标签表
 */
@TableName("tag")
@Data
public class Tag {

    /** 主键，数据库自增 */
    @TableId(type = IdType.AUTO)
    private Long id;

    /** 标签名（数据库层面唯一） */
    private String name;

    /** 创建时间 */
    private LocalDateTime createdAt;
}
