---
name: content-category
description: 在 AIMCC Blog 中新增、删除或调整 blog-web 内容分类/profile 时使用，确保内容目录、profile 配置、类型和脚本保持一致。
---

# 内容分类 Skill

## 何时使用

当用户要求新增、删除、重命名或调整 `front/blog-web/content/<owner>/` 下的内容分类，或新增一个可独立构建的 profile 时，阅读并应用本 skill。

这里的“分类”指内容 owner/profile 级别的目录，例如当前的 `main`。不要把它和文章 frontmatter 里的 `category` 字段混淆；仅修改文章分类字段时不需要应用本 skill。

## 约定

- 博客应用位于 `front/blog-web/`。
- 内容目录位于 `front/blog-web/content/<owner>/`。
- `shared` 是共享回退内容，只作为 profile 的补充 owner，不作为独立构建 profile。
- 一个独立构建 profile 至少需要同步更新：
  - `front/blog-web/profiles.config.mjs`
  - `front/blog-web/src/types/profile.ts`
  - `front/blog-web/src/env.d.ts`
  - `front/blog-web/src/core/content/posts.ts`
  - `front/blog-web/package.json` 中的 `dev:<profile>`、`build:<profile>` 和 `build:all`
  - `front/blog-web/content/<profile>/pages/about.md`
  - 至少一篇 `front/blog-web/content/<profile>/posts/.../index.md`

## 新增独立构建分类

新增 profile 时：

1. 使用小写短横线命名，避免空格、下划线和大写字母。
2. 在 `profiles.config.mjs` 新增 profile 配置，并让 `content.owners` 优先包含自身，再包含 `shared`。
3. 在 `ProfileName`、`ImportMetaEnv.SITE_PROFILE` 和 `parseContentId` owner 白名单中加入该 key。
4. 在 `package.json` 增加对应 `dev:<key>`、`build:<key>`，并把它加入 `build:all`。
5. 创建对应内容目录，至少补齐 about 页面和一篇示例文章。
6. 同步更新 `README.md`、`ARCHITECTURE.md` 或 `front/README.md` 中可见的构建命令和目录说明。

## 删除分类

删除 profile 时必须一起移除对应内容目录、profile 配置、类型声明、owner 白名单、npm scripts 和文档说明。保留 `shared`，除非用户明确要求删除共享内容。
