# 前端

`front/` 是前端 Rush 工作区根目录。博客页面应用位于 `blog-web/`，公共包位于 `packages/`。

## 安装

```bash
pnpm install
pnpm rush:update
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
- `blog-web/src/themes/`：视觉系统
- `blog-web/src/layouts/`：页面宏观结构
- `blog-web/src/templates/`：页面类型组合
- `blog-web/profiles.config.mjs`：站点组合/构建 profile
- `blog-web/src/registry/`：显式主题/布局/模板注册表
- `packages/mdx-component/`：公共 MDX 组件包
