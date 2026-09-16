# 仓库架构

## 1. 应用边界

本仓库是多应用仓库，不是单一前端项目：

```text
repo/
├── front/
├── server/            # 后端开发开始后加入
├── .agent/
├── .husky/
├── commitlint.config.cjs
└── package.json       # 仅用于仓库级 Git 工具
```

`front/` 是完整的前端项目，必须保持可独立理解、独立构建。`server/` 是同级应用，而不是嵌套在 `front/` 中或与 `front/` 强耦合。

## 2. 前端架构

```text
front/
├── rush.json
├── common/
│   └── config/
│       └── rush/
├── blog-web/
│   ├── content/
│   │   ├── main/
│   │   └── shared/
│   ├── public/
│   ├── scripts/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── content/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── types/
│   ├── astro.config.mjs
│   ├── package.json
│   ├── prettier.config.mjs
│   ├── profiles.config.mjs
│   └── tsconfig.json
└── packages/
    └── mdx-component/
```

### Profile

Profile 选择一个站点的内容范围和功能开关。当前仅包含 `main` 独立构建。新增内容分类或独立构建 profile 时，必须同步使用 `.agent/skills/content-category/` 中的规则，并参考 `docs/infra/content-profiles.md`。

### 内容

- `blog-web/content/main/**`：主站内容。
- `blog-web/content/shared/**`：可选共享内容。
- 所有者目录名是构建作用域，不是 URL 前缀。
- 在可行时，文章专用资源应与文章放在同一目录。

### 布局与组件

- **Layout**：页面宏观结构和 slots。
- **Component**：页面内可复用 UI，例如文章列表、归档列表、文章正文。
- **Page**：轻量的路由/数据边界，负责读取内容并组合布局与组件。

在出现第二个 profile 的真实差异前，不提前恢复多主题、多模板或 registry 层。

## 3. 构建输出

在 `front/blog-web/` 下运行：

```bash
pnpm build:main
pnpm build:all
```

Profile 构建脚本会把各 profile 的独立输出写入 `front/blog-web/dist/<profile>/`。

`front/` 使用 Rush 管理多包结构。公共组件包放在 `front/packages/` 下，当前已有 `front/packages/mdx-component/`。

`front/scripts/install-all.mjs` 是前端一键安装入口。它先安装 `front/` 工作区根依赖，再使用本地 `@microsoft/rush` 执行 `rush update`，避免要求开发者预先全局安装 Rush。

## 4. 仓库治理

Git hooks 位于仓库级，因为它们同时适用于 `front/` 和 `server/` 的贡献。

提交消息必须符合：

```text
type(scope): subject
```

示例：

```text
feat(front): add profile-aware renderer
feat(layout): simplify blog layout
feat(content-main): add Astro architecture article
fix(server): handle empty token
```

`scope` 必填。AI agent 在进行前端结构性工作或提交变更前，必须阅读 `.agent/skills/` 下的 skills。
