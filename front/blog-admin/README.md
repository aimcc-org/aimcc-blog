# Blog Admin

React + Vite + Ant Design 管理后台，端口 4322。依赖由 `front/` 下的 Rush 工作区管理。

## 目录与职责

| 目录                      | 职责                                       |
| ------------------------- | ------------------------------------------ |
| `src/layout/`             | 后台顶部导航、页面容器、公共布局样式       |
| `src/pages/`              | 登录、草稿管理、文章发布页面的组合         |
| `src/components/publish/` | 发布操作栏、反馈、文章信息、编辑预览和目录 |
| `src/components/editor/`  | Markdown 编辑器与封面设置及相关样式        |
| `src/components/drafts/`  | 草稿筛选界面和列表表格                     |
| `src/hooks/`              | 共享会话、草稿状态、持久化与操作           |
| `src/services/`           | 统一 HTTP 请求、登录会话和文章接口         |
| `src/utils/`              | 跨组件共用的草稿、缓存与 Markdown 文件工具 |
| `src/types/`              | 领域类型和组件使用的类型                   |

## 组件目录规范

每个组件或页面有独立目录，通过 `index.ts` 暴露入口，关联文件按性质归类：

```text
layout/AdminLayout/
├── index.ts
├── components/AdminLayout.tsx
├── styles/layout.css
└── types/index.ts

components/editor/SourceEditor/
├── index.ts
├── components/SourceEditor.tsx
├── styles/index.css
├── types/index.ts
└── utils/editor-commands.ts
```

- `components/`：组件实现；`styles/`：样式；`types/`：属性与关联类型。
- `utils/`：仅该组件使用的工具；`hooks/`：仅该组件或页面使用的状态逻辑。
- 有演示时放在同级 `demos/`；没有演示或其他关联文件时不创建空目录。
- 共享业务工具留在 `src/utils/`，请求统一放在 `src/services/`。
- 发布专用 hook 位于 `pages/PublishPage/hooks/`；相关样式跟随各自的发布组件。

## 结构约束

- `Layout` 只在 `layout/` 中使用，页面通过统一布局容器展示。
- 页面负责组合区域；组件负责渲染和交互，业务状态由 hook 管理。
- 工具层不依赖组件或 hook，请求层不依赖页面、组件或 hook。
- HTTP 请求统一经 `services/request.ts`，接口定义在 `services/auth.ts` 和 `services/articles.ts`。
- 单个 TypeScript/TSX 文件不超过 250 行，接近上限时按职责拆分。
- `pnpm check` 和 `pnpm build` 会执行架构检查；也可运行 `pnpm check:architecture`。

## 验证

```bash
pnpm check
pnpm test
pnpm build
```

草稿恢复需用户确认；编辑事件同步写入缓存；跨标签页冲突不覆盖原数据。发布成功与删除草稿会清理对应缓存，其他草稿保留。
