package com.aimcc.blog.service;

/**
 * 目录结构验证用 demo 接口；后续放 ArticleService 等业务接口
 */
public interface DemoService {

    /** 探活数据库，返回 SELECT 1 的结果 */
    Integer pingDatabase();
}
