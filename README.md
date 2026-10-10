# AIMCC Blog

这是一个按应用边界拆分的博客仓库：

```text
repo/
├── front/       # 当前 Fuwari 风格前端 Rush 工作区
├── front-bak/   # 布局回退前的前端源码备份
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

当前 `front/` 恢复到 `1eaab39` 的 Fuwari 风格最后一版。`front-bak/` 保留回退前的阅读布局、个人资料页和 Tailwind 管理后台；两套工作区独立安装依赖，启动备份版本时可将上述命令中的 `front/` 替换为 `front-bak/`。

## Server（后端）

技术栈：Spring Boot 4.1.1（JDK 25）+ MyBatis-Plus 3.5.17 + MySQL 8+ + Flyway + Sa-Token + Redis。

> AI 协作注意：本项目基于 **Spring Boot 4.1.1**（不是 3.x/2.x），配置项和异常类按此版本给，不要给旧版写法。例如找不到路径时抛的是 `NoResourceFoundException`（不是 `NoHandlerFoundException`），404 配置用 `spring.web.resources.add-mappings=false`。

### 本地启动

1. 准备本地 MySQL（**无需手动建表**：应用启动时 Flyway 自动执行 `server/src/main/resources/db/migration/` 下的版本化 SQL，空库一路迁移到最新）
2. 配置环境变量 `DB_PASSWORD`（值为你的 MySQL 密码）：IDEA 菜单「运行 → 编辑配置...（Edit Configurations）→ ServerApplication → 修改选项（Modify options）→ 环境变量」
3. 启动：运行 `ServerApplication`（或在 `server/` 目录下执行 `./mvnw spring-boot:run`）
4. 验证：访问 <http://localhost:8080/api/about>，返回 JSON 即成功

更多贡献规则见 `.agent/skills/`。
