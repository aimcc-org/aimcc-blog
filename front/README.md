# 前端

`front/` 是前端 Rush 工作区根目录。博客页面应用位于 `blog-web/`，公共包位于 `packages/`。

## 安装

```bash
nvm install
nvm use
# pnpm install 优先下面的，能够所有目录安装
pnpm install:all
```

## 开发

```bash
pnpm --dir blog-web dev:main
```

## 构建

```bash
pnpm --dir blog-web build:main
pnpm --dir blog-web build:all
```

构建输出按 profile 隔离在 `blog-web/dist/<profile>/` 下。

## 样式

管理后台使用 Tailwind CSS 4，通过 `@tailwindcss/vite` 接入 Astro。样式直接写在组件的工具类中；`src/styles/tailwind.css` 将现有设计 token 映射为 Tailwind 主题。不引入 Preflight，沿用站点已有的全局基础样式。

## 管理后台

- 访问 `/admin/`，使用已有管理员账号登录；登录成功后解锁「发布文章」菜单。
- `/admin/publish/` 提供左侧 Markdown 编辑、右侧实时预览，支持 GFM 表格、任务列表和代码块；窄屏使用上下布局。
- 草稿按管理员账号保存在当前浏览器，支持多篇草稿的新建、切换、刷新恢复和回收站恢复；旧版单篇草稿会自动迁移，原数据保留。草稿不会跨设备同步。
- 文章信息支持标题、摘要、分类、逗号分隔的标签、文章链接和封面图片地址；「检查文章」可校验标题、正文、链接格式及封面地址。
- 支持导入 `.md` / `.markdown` 文件（最大 2 MB），每次导入都会创建新草稿，不覆盖已有草稿。普通 Markdown 会从首行一级标题或文件名提取文章标题。
- 导出的 `.md` 文件使用 JSON 格式的 YAML frontmatter 保存文章信息，重新导入可恢复这些信息；其他格式的 frontmatter 保留在正文中。尚未接入文章写入接口，发布按钮暂不可用。
- 浏览器存储不可用、空间不足或其他标签页修改草稿时，会停止自动保存并提示导出备份，避免覆盖已有数据。
- 登录 token 保存在当前标签页的 `sessionStorage`，通过服务端 `/api/admin/session` 校验，退出会调用 `/api/admin/logout` 撤销登录。

开发时 `/api` 自动代理到 `http://47.96.92.202:8080`，可用 `API_PROXY_TARGET` 覆盖目标。生产部署需将同源 `/api` 反向代理到后端；如设置 `PUBLIC_API_BASE_URL` 为跨域地址，后端须允许该前端来源及 `satoken` 请求头。前后端需一起更新以提供新增的登录状态、退出接口。

后台页面已从 sitemap 和搜索索引排除，并标记为禁止搜索引擎索引。

## 架构

- `blog-web/content/<owner>/`：按所有者隔离的内容
- `blog-web/src/layouts/`：页面宏观结构
- `blog-web/profiles.config.mjs`：站点组合/构建 profile
- `blog-web/src/content/`：内容查询和 profile 过滤
- `blog-web/src/components/`：页面组件
- `packages/mdx-component/`：公共 MDX 组件包

## 布局与组件迁移

当前 `front` 以原 `front-bak` 为基础。迁移前的完整项目（包含未提交组件变更）保存在仓库根目录 `front-backup-20261008/`，该目录作为本地备份忽略，不参与构建。

左侧 `ArticleRail` 使用 `CategoryIndex` 展示一级分类与数量，`ProfileCard` 使用 `SidebarUserProfile`。右侧 `HomeAside` 分别使用 `NowCard`、`QuickLinks`、`AmbientCard`。共享源码和 Storybook 位于 `packages/react-component`，站点的数据加载与路由仍由 Astro 包装组件提供。

博客导航保留原 `front-bak` 的 Header 样式与交互；共享玻璃 `Header` 仍保留在组件库和 Storybook。归档继续使用文章 list API 的 `ArticleTimeline`。
