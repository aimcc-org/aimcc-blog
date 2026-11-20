package com.aimcc.blog.enums;

/**
 * 文章列表排序方式（GET /articles 的 sort 参数取值范围）
 *
 * <p>常量名即接口传值：Spring 用 {@code Enum.valueOf} 绑定，大小写敏感，
 * 所以 {@code ?sort=NEW} 合法、{@code ?sort=new} 会报 400。
 */
public enum ArticleSort {

    /** 最新：按发布时间倒序 */
    NEW,

    /** 推荐：只取精选文章（is_top = 1），再按发布时间倒序 */
    RECOMMEND
}
