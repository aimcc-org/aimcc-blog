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

## 架构

- `blog-web/content/<owner>/`：按所有者隔离的内容
- `blog-web/src/layouts/`：页面宏观结构
- `blog-web/profiles.config.mjs`：站点组合/构建 profile
- `blog-web/src/content/`：内容查询和 profile 过滤
- `blog-web/src/components/`：页面组件
- `packages/mdx-component/`：公共 MDX 组件包
- `packages/react-component/`：公共 React 组件包（Header、PostCard、UserProfile、CategoryList、ArticleTimeline）

## 组件调试

```bash
pnpm --dir packages/react-component storybook
pnpm --dir packages/react-component build-storybook
```

Storybook 默认运行在 `http://localhost:6006`。组件 API 和接入说明见 [react-component/README.md](packages/react-component/README.md)。

归档页时间线在浏览器读取文章 list 接口。开发时启动 8080 端口的后端，Astro 会代理 `/api`；生产环境需配置 `/api` 反向代理或 `PUBLIC_API_BASE_URL`。

时间线与接口契约测试：`pnpm --dir packages/react-component test`、`pnpm --dir blog-web test`。
