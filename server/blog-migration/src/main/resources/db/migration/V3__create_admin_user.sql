-- ============================================================
-- V3：管理员账号表——登录认证（模块 6）
-- 第一批管理员由此种下；后续账号走受保护的 /api/admin/register 接口
-- password_hash 为 BCrypt 密文（60 字符），明文密码永不入库
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_user (
    id            BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键（Sa-Token 的 loginId）',
    username      VARCHAR(64) NOT NULL                COMMENT '登录名',
    password_hash VARCHAR(60) NOT NULL                COMMENT 'BCrypt 密文，永不存明文',
    nickname      VARCHAR(64) NOT NULL                COMMENT '显示名（将来文章 created_by 用）',
    created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_admin_username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT '管理员账号表';

INSERT INTO admin_user (username, password_hash, nickname)
VALUES ('ck', '$2a$10$iQPAdIfKSXvMnwtqWgD8ou0uBx4hBscMg6Hhzg4AJB8krYtzEUlg2', '初号凯');
