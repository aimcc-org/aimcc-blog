-- ============================================================
-- AIMCC Blog 数据库初始化脚本
-- 用法：在本地 MySQL 中执行本文件（DBeaver：连接上后新建 SQL 编辑器粘贴执行）
-- 注意：建库建表可重复执行（IF NOT EXISTS）；第 6 部分数据插入若重复执行会重复插行，
--       重复执行前请先 TRUNCATE TABLE profile, article, tag, article_tag;
-- ============================================================

-- 1. 建库（utf8mb4 支持完整 Unicode 含 emoji；unicode_ci 为大小写不敏感的排序规则）
CREATE DATABASE IF NOT EXISTS aimcc_blog
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE aimcc_blog;

-- 2. 个人资料表（单行表：全站只有博主自己这一行数据）
CREATE TABLE IF NOT EXISTS profile (
    id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    nickname     VARCHAR(64)  NOT NULL                COMMENT '昵称',
    avatar       VARCHAR(512) NULL                    COMMENT '头像图片 URL',
    bio          VARCHAR(256) NULL                    COMMENT '一句话签名',
    `quote`      VARCHAR(256) NULL                    COMMENT '座右铭',
    years_of_dev INT          NOT NULL DEFAULT 0      COMMENT '开发年限',
    github_url   VARCHAR(512) NULL                    COMMENT 'GitHub 主页',
    x_url        VARCHAR(512) NULL                    COMMENT 'X(Twitter) 主页',
    bilibili_url VARCHAR(512) NULL                    COMMENT 'B站主页',
    email        VARCHAR(512) NULL                    COMMENT '联系邮箱',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT '个人资料（单行表）';

-- 3. 文章表（与 Article entity 对应；idx_status_published 组合索引服务列表接口的过滤+排序）
CREATE TABLE IF NOT EXISTS article (
    id              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    title           VARCHAR(128) NOT NULL                COMMENT '标题',
    summary         VARCHAR(512) NULL                    COMMENT '摘要（列表卡片用）',
    cover_image     VARCHAR(512) NULL                    COMMENT '封面图 URL',
    content         MEDIUMTEXT   NULL                    COMMENT '正文 Markdown',
    reading_minutes INT          NOT NULL DEFAULT 1      COMMENT '阅读时长（分钟）',
    view_count      INT          NOT NULL DEFAULT 0      COMMENT '浏览量',
    is_top          TINYINT      NOT NULL DEFAULT 0      COMMENT '是否精选：0否 1是',
    status          TINYINT      NOT NULL DEFAULT 0      COMMENT '状态：0草稿 1已发布',
    published_at    DATETIME     NULL                    COMMENT '发布时间',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_status_published (status, published_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT '文章表';

-- 4. 标签表（name 唯一约束：标签云不允许重复标签名）
CREATE TABLE IF NOT EXISTS tag (
    id         BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键',
    name       VARCHAR(64) NOT NULL                COMMENT '标签名（唯一）',
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_tag_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT '标签表';

-- 5. 文章-标签中间表（多对多连线；联合主键 = 同一组合只许出现一次，无自增 id）
CREATE TABLE IF NOT EXISTS article_tag (
    article_id BIGINT NOT NULL COMMENT '文章 id（逻辑关联 article.id）',
    tag_id     BIGINT NOT NULL COMMENT '标签 id（逻辑关联 tag.id）',
    PRIMARY KEY (article_id, tag_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT '文章-标签关系表';

-- 6. 初始数据
-- 6.1 博主资料（记得换成自己的真实资料与链接）
INSERT INTO profile (nickname, avatar, bio, quote, years_of_dev, github_url, x_url, bilibili_url, email)
VALUES ('AIMCC',
        'https://avatars.githubusercontent.com/u/00000000',
        '前端开发者 / AI 探索者，记录技术与生活的数字花园。',
        '在代码之外，寻找更多可能。',
        6,
        'https://github.com/your-github',
        'https://x.com/your-x',
        'https://space.bilibili.com/000000',
        'me@aimcc.blog');

-- 6.2 文章测试数据（3 已发布其中 1 精选、1 草稿——草稿不会出现在列表接口，
--     精选那篇可用于验证 sort=recommend）
INSERT INTO article (title, summary, cover_image, content, reading_minutes, is_top, status, published_at)
VALUES ('用 Spring Boot 搭建个人博客：从零到第一个接口',
        '记录本项目从空目录到 /api/about 跑通的全过程：分层骨架、数据源接入、MyBatis-Plus 入门。',
        'https://placehold.co/1200x630?text=Spring+Boot',
        '# 从零到第一个接口\n\n本文记录搭博客服务端的第一步……',
        8, 1, 1, '2026-09-01 10:00:00'),
       ('MyBatis-Plus 分页插件原理：一条 SQL 是怎么被改写的',
        'selectPage 背后的拦截器机制：先 count 再 limit，以及 jsqlparser 的角色。',
        'https://placehold.co/1200x630?text=MyBatis-Plus',
        '# 分页插件原理\n\n一条 SQL 进了拦截器会发生什么……',
        6, 0, 1, '2026-09-10 20:30:00'),
       ('Java 新手踩坑记录：yaml 缩进、静默失效与防御性配置',
        'yaml 靠缩进表达层级，写错位置不报错但配置不生效——以及为什么改配置必须重启验证。',
        'https://placehold.co/1200x630?text=YAML',
        '# 静默失效\n\nyaml 的缩进就是语法本身……',
        5, 0, 1, '2026-09-15 09:00:00'),
       ('草稿：标签系统的设计构想（模块 3 预研）',
        'tag 与 article_tag 的表设计思路，联表查询怎么入门。',
        NULL,
        '# 标签系统构想\n\n（写作中……）',
        1, 0, 0, NULL);

-- 6.3 标签与连线（4 个标签；已发布 3 篇文章的挂载关系）
INSERT INTO tag (name) VALUES ('Java'), ('后端'), ('建站'), ('踩坑');

INSERT INTO article_tag (article_id, tag_id) VALUES
    (1, 1), (1, 2), (1, 3),
    (2, 1), (2, 2),
    (3, 2), (3, 4);
