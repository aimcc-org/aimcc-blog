# @aimcc/react-component

博客通用 React 组件，独立于 Astro、站点配置和服务端 API。目前包含：

- `Header`：品牌、导航链接、当前页标识和 `actions` 插槽；外层固定定位和滚动隐藏由应用负责。
- `PostCard`：文章摘要、封面、分类、标签及阅读统计；通过 `href` 传入文章链接。
- `ArticleTimeline`：文章按天聚合、倒序展示、加载/错误/空状态和分页入口。
- `CategoryList`：分类列表、可选文章数量、链接、当前分类与空状态。
- `UserProfile`：姓名、职业、位置、简介、头像与在线状态、技能标签，以及简历/GitHub/联系按钮。

这是 Rush 内部源码包，入口直接导出 TypeScript，交给 Astro/Vite 编译，修改组件后应用和 Storybook 都能热更新。`build` 生成 JS 和类型声明供检查；当前包不用于发布 npm。

## 开发与调试

在 `front/` 目录使用 Node 26：

```bash
pnpm install:all
pnpm --dir packages/react-component storybook
```

打开 http://localhost:6006。Controls 可以修改 props，工具栏切换 light/dark 主题；Stories 包含默认、带封面、长文本、技能溢出和头像等状态。`Mobile` Story 使用 375px 视口，可检查窄屏排版。

```bash
pnpm --dir packages/react-component check
pnpm --dir packages/react-component build
pnpm --dir packages/react-component build-storybook
```

静态 Storybook 输出到 `storybook-static/`，不提交构建产物。

## 应用中使用

```tsx
import {
  Header,
  PostCard,
  UserProfile,
  CategoryList,
} from "@aimcc/react-component";
import "@aimcc/react-component/tokens.css";
import "@aimcc/react-component/styles.css";

<PostCard
  href="/posts/hello/"
  post={{ title: "Hello", publishedAt: "2026-10-08", tags: ["React"] }}
/>;
```

样式使用共享 CSS 变量；`html.dark` 启用深色主题，宿主可覆盖变量。React/ReactDOM 为 peer dependencies，避免重复运行时。

`blog-web` 的 Astro 包装组件负责将 站点配置数据适配为 props。Header 的 `actions` 接收具名 Astro slot，原有 `HomeControls` 保持 `client:load`；文章和个人信息卡片静态服务端渲染，不增加客户端 hydration。

## UserProfile

必填 `name`；其他内容由 `role`、`location`、`bio`、`avatar`、`online`、`skills` 配置。`maxVisibleSkills` 默认 9，超出部分显示 `+N`，悬停或辅助技术可读取隐藏技能。`resumeHref`、`githubHref`、`contactHref` 控制三个按钮，没有地址的按钮不显示。

`blog-web/src/config/user-profile.ts` 集中维护站点的个人资料。未配置头像时显示姓名缩写；简历按钮暂指向关于页，联系按钮暂指向 GitHub Issues，可替换成实际简历地址和邮件链接。Storybook 的邮箱是演示地址。

## CategoryList

`categories` 接收 `{ name, count?, href?, active? }[]`，使用语义化 `ul/li` 列表。提供 `href` 时渲染链接，不提供时显示普通分类项；`count` 为 0 时仍显示。`title` 默认“分类”，`emptyMessage` 默认“暂无分类”。

```tsx
<CategoryList categories={[{ name: "前端开发", count: 12 }]} />
```

博客侧栏继续从文章数据计算分类数量。路由由宿主提供，组件不生成分类页面。

## ArticleTimeline

通过 `articles` 传入 `{ id, title, publishedAt, summary?, tags?, readingMinutes?, href? }[]`。默认按 `Asia/Shanghai` 日期聚合，同一天多篇文章合并展示，并按发布时间倒序排列、按 id 去重。支持 `timeZone`、`loading`、`error`、`hasMore`、`onLoadMore`、`onRetry`。无时区时间视为北京时间的本地日期；推荐提供带时区的 ISO 时间。

归档页的 `ArticleTimelineFeed` 在浏览器调用 `GET /api/articles?page=1&size=20&sort=new`，加载更多时追加下一页，重新聚合并去重。接口失败显示重试入口，不使用本地内容冒充接口数据。接口没有 slug，因此当前 API 文章只展示标题，不生成不存在的详情地址。Storybook 使用示例数据。

本地 Astro 开发服务将 `/api` 代理到 `http://localhost:8080`，需要启动后端。生产部署需将同源 `/api` 反向代理到后端，或设置 `PUBLIC_API_BASE_URL` 并配置对应 CORS。页面在客户端加载接口数据，不受静态站点构建时间限制。

```bash
pnpm --dir packages/react-component test
```
