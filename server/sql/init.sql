-- ============================================================
-- AIMCC Blog 数据库初始化脚本
-- 用法：在本地 MySQL 中执行本文件（DBeaver：连接上后新建 SQL 编辑器粘贴执行）
-- 注意：建库建表可重复执行（IF NOT EXISTS）；第 3 部分数据插入若重复执行会重复插行，
--       重复执行前请先 TRUNCATE TABLE profile;
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

-- 3. 初始数据（记得换成自己的真实资料与链接）
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
