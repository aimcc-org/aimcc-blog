-- 补充查询索引：优化按标签、按分类筛选文章的性能

-- 标签筛选：按 tag_id 查 article_tag
-- 现有联合主键是 (article_id, tag_id)，按 tag_id 单独查时用不上，会全表扫
ALTER TABLE article_tag ADD KEY idx_tag_id (tag_id);

-- 分类筛选：article.category_id 之前没建索引
ALTER TABLE article ADD KEY idx_category (category_id);
