# AIMCC Blog

这是一个按应用边界拆分的博客仓库：

```text
repo/
├── front/       # 前端 Rush 工作区
├── server/      # 后端应用
├── .agent/      # 仓库级 AI 工程规则
├── .husky/      # 仓库级 Git hooks
└── ...          # 仓库级治理配置
```

## 边界规则

**所有前端应用代码、前端构建配置、前端依赖、内容、主题、布局和模板都放在 `front/` 下。**

仓库根目录不放前端 `src/`、`content/`、`public/`、Astro 配置、前端格式化配置或前端构建脚本。

根目录 Node 工具只用于仓库级 Git 治理，例如 `husky`、`commitlint` 和 `lint-staged`。它不是前端包。

## 安装

仓库 Git 工具：

```bash
pnpm install
```

前端 Rush 工作区依赖：

```bash
cd front
nvm install
nvm use
pnpm install:all
```

## 前端命令

在 `front/blog-web/` 下运行：

```bash
cd front/blog-web
pnpm dev:main
pnpm build:main
pnpm build:all
```

也可以不切换目录直接运行：

```bash
pnpm --dir front/blog-web build:main
```

`front/` 使用 Rush 管理多包结构：`front/blog-web` 是博客前端页面，`front/packages/mdx-component` 是公共 MDX 组件包。

## Server（后端）

技术栈：Spring Boot 4 + MyBatis-Plus + MySQL 8+ + Flyway（数据库迁移）。

### 本地启动

1. 准备本地 MySQL（**无需手动建表**：应用启动时 Flyway 自动执行 `server/src/main/resources/db/migration/` 下的版本化 SQL，空库一路迁移到最新）
2. 配置环境变量 `DB_PASSWORD`（值为你的 MySQL 密码）：IDEA 菜单「运行 → 编辑配置...（Edit Configurations）→ ServerApplication → 修改选项（Modify options）→ 环境变量」
3. 启动：运行 `ServerApplication`（或在 `server/` 目录下执行 `./mvnw spring-boot:run`）
4. 验证：访问 <http://localhost:8080/api/about>，返回 JSON 即成功

### 已有接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/about` | 个人资料（关于我卡片） |
| GET | `/api/articles` | 文章分页列表（`?page=&size=&sort=new\|hot\|recommend`） |
| GET | `/api/articles/{id}` | 文章详情（浏览量 +1） |
| GET | `/api/tags` | 标签云（标签名 + 实时文章数） |
| GET | `/api/stats` | 站点统计（已发布文章数 + 博主年限） |

### 数据库变更规范

改表一律新增迁移文件：`server/src/main/resources/db/migration/V<下一个版本号>__<描述>.sql`（注意版本号后是**双下划线**）。**已执行过的迁移文件永不修改**；应用每次启动，Flyway 会在每个环境自动补齐未执行的迁移。

更多架构和贡献规则见 `ARCHITECTURE.md` 与 `.agent/skills/`。
