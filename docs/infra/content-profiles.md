# 内容 Profile 扩展约定

`front/blog-web` 当前只构建 `main`，但保留了 profile/content owner 机制，方便后续扩展新的站点或内容分类。

## 当前约定

- 独立构建 profile：`main`
- 共享回退内容：`shared`
- 内容根目录：`front/blog-web/content/<owner>/`
- profile 配置：`front/blog-web/profiles.config.mjs`
- 内容类型：`front/blog-web/src/types/profile.ts`
- 内容解析：`front/blog-web/src/content/posts.ts`
- 构建脚本：`front/blog-web/package.json`

`shared` 只作为共享内容 owner，不作为独立构建 profile。

## 新增独立构建 Profile

新增 profile 时至少同步这些位置：

1. 在 `front/blog-web/content/<profile>/` 下创建内容目录。
2. 在 `profiles.config.mjs` 新增 profile，并让 `content.owners` 先包含自身，再包含 `shared`。
3. 在 `src/types/profile.ts` 更新 `ProfileName` 和 `ContentOwner`。
4. 在 `src/env.d.ts` 更新 `ImportMetaEnv.SITE_PROFILE`。
5. 在 `src/content/posts.ts` 更新 owner 白名单。
6. 在 `front/blog-web/package.json` 增加 `dev:<profile>`、`build:<profile>`，并更新 `build:all`。
7. 更新 `README.md`、`front/README.md` 和 `ARCHITECTURE.md` 中的可见命令与目录说明。

新增或删除 profile 前，先阅读 `.agent/skills/content-category/SKILL.md`。

## 不要提前恢复复杂层

只有当第二个 profile 确实需要不同页面外观时，再引入这些扩展：

- 多布局 registry
- 多模板 registry
- 多主题目录

在此之前，页面直接使用 `src/layouts/base/BaseLayout.astro` 和 `src/components/` 中的组件。
