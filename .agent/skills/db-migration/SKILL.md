# 数据库变更 Skill

## 何时使用

当需要新增或修改数据库表结构时，必须阅读并应用本 skill。

## 规则

改表一律新增迁移文件：`server/src/main/resources/db/migration/V<下一个版本号>__<描述>.sql`

注意：版本号后是**双下划线**。

### 已执行的迁移文件永不修改

任何已经执行过的迁移文件（本地或线上），不能再改动内容。改了会导致 Flyway checksum mismatch，应用启动直接失败。

如果发现迁移有问题：
- 正确做法：新增一个迁移文件修正
- 错误做法：改旧文件再跑一遍

### Flyway 工作方式

应用每次启动，Flyway 会自动检查 `flyway_schema_history` 表，执行所有未跑过的迁移。本地/线上自动同步，不用手动 SQL。

### 新增迁移文件

版本号递增：V5、V6、V7...

文件名示例：
- `V5__add_article_summary.sql`
- `V6__create_tag_table.sql`

### checksum mismatch 怎么办

报错 `Migration checksum mismatch` 说明旧迁移文件被改过了：
1. 改回原始内容
2. 或者本地开发环境可以 `DROP DATABASE` 重建
3. 线上环境用 `flyway repair` 修复
