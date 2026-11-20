-- 1. 建分类表
CREATE TABLE category
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名',
    sort        INT         NOT NULL DEFAULT 0 COMMENT '排序号，小的排前面',
    create_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. article 表加分类字段
ALTER TABLE article
    ADD COLUMN category_id BIGINT NULL COMMENT '分类id' AFTER title;

-- 3. 初始分类数据（设计稿上的 5 个，按 sort 排序）
INSERT INTO category (name, sort)
VALUES ('Project', 1),
       ('AI 研究札记', 2),
       ('前端工程', 3),
       ('工具效率', 4),
       ('生活摄影', 5);