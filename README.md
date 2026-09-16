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
pnpm --dir front install
pnpm --dir front rush:update
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

更多架构和贡献规则见 `ARCHITECTURE.md` 与 `.agent/skills/`。
