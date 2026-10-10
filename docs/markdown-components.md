# Markdown 阅读与编辑组件

## 选型调研

| 包                                                                                                                  | 适合的用途                                  | 本项目判断                                             |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) | 将 Markdown 转为 React 元素，插件扩展 GFM   | 选用于阅读，兼容服务端渲染，直接复用主题变量           |
| [marked](https://github.com/markedjs/marked)                                                                        | 将 Markdown 转为 HTML 字符串                | 需要额外 HTML 清理和 React 注入，不采用                |
| [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor)                                                    | Markdown 源码编辑、工具栏、键盘快捷键、预览 | 选用于编辑；预览替换为共享阅读器                       |
| [Milkdown](https://github.com/Milkdown/milkdown)                                                                    | ProseMirror 驱动的可扩展所见即所得编辑      | 当前需求为 Markdown 源码写作，接入复杂度更高，暂不采用 |

## API 与接入

```tsx
import { MarkdownReader } from "@aimcc/react-component/markdown";
import { MarkdownEditor } from "@aimcc/react-component/markdown-editor";
import "@aimcc/react-component/markdown.css";
import "@aimcc/react-component/markdown-editor.css";

<MarkdownReader source={content} />;
<MarkdownEditor value={content} onChange={setContent} />;
```

阅读器支持 GFM 表格、任务列表、删除线、代码块和图片。默认不渲染原始 HTML；链接使用 react-markdown 的默认 URL 校验。标题使用 rehype-slug，ID 带 `md-` 前缀，重复标题自动编号。博客本地文章目录使用同样前缀。

编辑器为受控组件，支持 `disabled`、`previewOnly`、`placeholder`、`height`、`className`、`previewHeader`（文章元信息）和 `emptyPreview`。第三方编辑器在浏览器挂载后动态加载，SSR 输出加载提示；文章页通过阅读子路径导入，不需加载编辑器。工具栏和编辑正文由 UIW 提供，预览由 MarkdownReader 提供。代码以等宽字体显示，目前没有代码块语法着色。

正文样式只作用于 `.aimcc-markdown`；编辑器样式只作用于 `.aimcc-markdown-editor`。颜色、字体、边框、圆角复用宿主的 `--color-*`、`--font-*` 和 `--radius-*`，支持现有深色主题。阅读器样式已包含在组件库 `styles.css` 中，编辑器样式可按需导入。

Astro 中 `@aimcc/react-component` 是导出 TSX/CSS 源码的工作区包，需通过 `vite.ssr.noExternal` 交给 Vite 转换。管理页面保留草稿、封面、导入导出和账号业务逻辑；共享编辑器不依赖这些业务。

## 编辑页修复与验证

- 草稿 ID 创建兼容不提供 `crypto.randomUUID()` 的 HTTP 环境，使用 `crypto.getRandomValues()` 生成 UUID v4；回归测试覆盖初次初始化、唯一性及持久化恢复。
- Astro 将组件库源码交由 Vite 处理，避免 Node 直接加载 CSS。Vite 去重 React，并预优化组件库中的 UIW 动态依赖，避免开发模式依赖重新优化导致 Hook 调用异常。
- 管理业务通过本地临时测试页面验证编辑、中文工具栏、实时预览和草稿刷新恢复；测试页面在验证后删除。

## 自动编辑缓存

编辑缓存按管理员账号隔离，使用 version 2 格式：`latestKey` 指向最新新建文章的 key，`entries[key]` 保存 `status`、`snapshots` 和发布后的 `publishedArticleId`。文章 key 与本地草稿 ID 一致；新建时记录第一份快照，编辑时同步追加快照，相同快照不重复追加。旧单快照缓存会自动迁移，已有本地草稿一并保留。

恢复只检查最新新建的 key，并使用其最后一份快照。该 key 已发布、为空或已移除时停止检测，不向前寻找其他 key。编辑或发布旧 key 不会改变新建顺序：最新 A 发布后不会提示 B；旧 B 发布而最新 A 仍是草稿时，继续提示恢复 A。发布保留快照历史并标记该 key 为已发布，后续本地修改不会撤销发布标记。

默认进入编辑页时标题、摘要、分类、标签和正文保持空白，未确认前不保存空白页面、不新增缓存 key，也不改变原有快照。检测到最新未发布草稿时显示行内恢复提示，点击「恢复草稿」后才填充，点击「暂不恢复」继续空白写作。文章管理页点击「继续编辑」属于明确选择，可直接打开指定文章。恢复后保留快照历史；如果需恢复比当前草稿更旧的版本，保留原草稿并创建独立草稿。缓存写入检查其他标签页是否已经更新，避免直接覆盖；缓存不可用时显示备份提示。

文章管理保持本地草稿的编辑、筛选、回收站和恢复交互，合并缓存中的最新快照，并显示「草稿 / 已发布」状态。每篇文章标记「本地缓存」，悬停提示清理浏览器缓存后本地草稿会丢失，请及时发布。内容不跨设备同步。

编辑页保留轻量的「管理草稿 / 新建文章」入口，切换草稿和回收站操作统一放在文章管理页。
