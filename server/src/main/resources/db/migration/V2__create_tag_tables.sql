-- ============================================================
-- V2：标签体系——tag 表 + article_tag 中间表 + 测试数据
-- tag.name 加 UNIQUE 约束；article_tag 用联合主键防重复连线
-- ============================================================

-- 标签表（name 唯一约束：标签云不允许重复标签名）
CREATE TABLE IF NOT EXISTS tag (
    id         BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
    name       VARCHAR(64) NOT NULL                COMMENT '标签名（唯一）',
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tag_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT '标签表';

-- 文章-标签中间表（多对多连线；联合主键 = 同一组合只许出现一次，无自增 id）
CREATE TABLE IF NOT EXISTS article_tag (
    article_id BIGINT NOT NULL COMMENT '文章 id（逻辑关联 article.id）',
    tag_id     BIGINT NOT NULL COMMENT '标签 id（逻辑关联 tag.id）',
    PRIMARY KEY (article_id, tag_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT '文章-标签关系表';

-- 测试数据：4 个标签 + 已发布 3 篇文章的挂载关系
INSERT INTO tag (name) VALUES ('Java'), ('后端'), ('建站'), ('踩坑');

INSERT INTO article_tag (article_id, tag_id) VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 1), (2, 2),
    (3, 2), (3, 4);
