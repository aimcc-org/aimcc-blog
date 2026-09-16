# 前端结构 Skill

## 何时使用

在创建、移动、编辑或审查前端代码、Astro 配置、前端依赖、内容、主题、布局、模板、profile 配置或前端构建脚本之前，必须阅读并应用本 skill。

## 强应用边界

`front/` 是前端 Rush 工作区根目录。

**所有前端所属文件都必须放在 `front/` 下。** 这包括：

- 前端 `package.json` 与前端依赖；
- Astro/Vite/TypeScript/格式化工具配置；
- `src/`、`public/`、`content/`；
- 前端脚本与构建输出配置；
- 主题、布局、模板、注册表与 profile 定义。

不要在仓库根目录创建前端应用文件。尤其不要在根目录创建前端专用的 `src/`、`pages/`、`components/`、`content/`、`public/`、`astro.config.*`、`vite.config.*` 或前端专用构建配置。

本仓库预期包含同级应用：

```text
repo/
├── front/
└── server/
```

不要把服务端代码放到 `front/` 下，也不要把前端代码放到 `server/` 下。

`front/blog-web/` 是当前博客前端页面应用。`front/packages/` 存放前端公共包。

仓库根目录下的 `.agent/`、`.husky/`、commitlint 配置和 Git 治理规则属于跨应用基础设施，允许保留在根目录。

## 前端架构

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
│   └── src/
│       ├── components/
│       ├── config/
│       ├── content/
│       ├── layouts/
│       ├── pages/
│       ├── styles/
│       └── types/
└── packages/
    └── mdx-component/
```

### 内容

- 个人内容当前放在 `front/blog-web/content/main/**`。
- 共享内容可以放在 `front/blog-web/content/shared/**`。
- 由 profile 决定一次构建中哪些内容所有者可见。
- 所有者目录是构建期作用域，不能自动变成 URL 前缀。
- 文章资源优先与文章目录放在一起。
- 新增、删除或重命名内容分类/profile 时，必须阅读 `.agent/skills/content-category/SKILL.md`。
- 关键扩展约定记录在 `docs/infra/content-profiles.md`，避免后续新增 profile 时遗漏同步点。

### 主题

样式 token 放在 `front/blog-web/src/styles/`。在出现真实多 profile 视觉差异前，不新增多主题 registry。

### 布局

布局负责页面的宏观几何结构，例如居中、侧边栏、宽屏结构。布局应暴露 slot，并保持与具体内容无关。

### 模板

页面类型组合优先放在 `front/blog-web/src/components/` 中。只有当第二个 profile 确实需要不同页面实现时，才重新引入 templates/registry 层。

### Profile

Profile 选择集中在 `front/blog-web/profiles.config.mjs`。不要在组件中散落 `if (profile === "...")` 之类的判断。

### 注册表

注册表把稳定的字符串 key 映射到具体主题、布局和模板。优先使用显式注册表，而不是任意动态导入。

### 页面

Astro 路由文件必须保持轻量。它们主要应该：

1. 加载/过滤内容；
2. 读取当前激活的 profile；
3. 解析所需布局/模板；
4. 渲染。

不要直接在 `front/blog-web/src/pages` 中实现大块页面 UI。

## 差异决策顺序

当两个 profile 存在差异时，优先按以下顺序表达：

1. 主题 token/CSS；
2. 布局选择；
3. 模板选择；
4. 可复用组件变体；
5. 仅在最后才使用组件覆盖。

除非路由或产品行为已经根本分化，否则不要为每个作者复制整棵页面树。

## 命令

Rush 工作区命令属于 `front/package.json`。博客应用命令属于 `front/blog-web/package.json`。

在 `front/blog-web/` 下运行：

```bash
pnpm dev:main
pnpm build:main
pnpm build:all
pnpm check
pnpm format:check
```

不要把前端构建别名添加到仓库根目录的 package scripts 中。
