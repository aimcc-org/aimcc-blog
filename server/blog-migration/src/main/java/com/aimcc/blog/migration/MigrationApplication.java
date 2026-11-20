package com.aimcc.blog.migration;

import org.flywaydb.core.Flyway;

/**
 * 一次性数据库迁移任务：执行完 migrate 就退出，不常驻。
 * 由部署编排保证「迁移成功之后才启动业务服务」。
 */
public final class MigrationApplication {

    private static final String DEFAULT_URL =
            "jdbc:mysql://localhost:3306/aimcc_blog?serverTimezone=Asia/Shanghai&characterEncoding=utf8";

    private MigrationApplication() {
    }

    public static void main(String[] args) {
        String url = readEnv("DB_URL", DEFAULT_URL);
        String username = readEnv("DB_USERNAME", "blog");
        String password = readEnv("DB_PASSWORD", "");

        System.out.println("迁移目标：" + url);

        Flyway flyway = Flyway.configure()
                .dataSource(url, username, password)
                .locations("classpath:db/migration")
                // 存量库没有 history 表时，把已有结构当作 V1 已完成，从 V2 开始
                .baselineOnMigrate(true)
                .baselineVersion("1")
                // MySQL 容器可能还没就绪：最多重试 10 次，每次间隔 3 秒
                .connectRetries(10)
                .connectRetriesInterval(3)
                .load();

        int executed = flyway.migrate().migrationsExecuted;
        System.out.println("迁移结束，本次执行 " + executed + " 个脚本");
    }

    private static String readEnv(String key, String fallback) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
