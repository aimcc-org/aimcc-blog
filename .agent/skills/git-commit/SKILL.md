# Git 提交 Skill

## 何时使用

在本仓库中准备或创建 Git 提交之前，必须阅读并应用本 skill。

## 必需提交格式

每条提交消息都必须符合：

```text
type(scope): subject
```

`scope` 必填，并且必须为小写。

推荐类型：

- `feat`：新增行为或能力
- `fix`：修复问题
- `refactor`：不带功能/修复语义的结构调整
- `docs`：仅文档变更
- `style`：仅格式/样式变更
- `test`：测试
- `build`：构建、依赖或工具链变更
- `ci`：CI 变更
- `chore`：仓库维护
- `perf`：性能优化

有效示例：

```text
feat(front): add profile-aware post renderer
feat(theme): add minimal theme
feat(content-main): add Astro article
fix(layout): correct sidebar overflow
build(front): add Pagefind build step
feat(server): add article query endpoint
```

无效示例：

```text
feat: add page
update blog
feat(Front): add page
feat(front) add page
```

## Scope 指引

优先选择有意义且范围最窄的 scope，例如：

- `front`, `server`
- `theme`, `layout`, `template`, `profile`
- `content-main`, `content`
- `deps`, `hooks`, `agent`

当变更属于共享基础设施时，不要发明按个人区分的 scope。

## 提交流程

提交前：

1. 检查 `git status`；
2. 检查已暂存 diff；
3. 确认未包含无关变更；
4. 将逻辑上独立的工作拆成不同提交；
5. 选择最窄且准确的 `type` 和 `scope`；
6. 编写简洁的祈使句 subject；
7. 针对变更应用运行相关检查；
8. 正常提交，并允许 hooks 执行。

如果涉及前端变更，也要阅读 `../frontend-structure/SKILL.md`。

## 禁止事项

- 除非用户针对已诊断的 hook 失败明确要求，否则绝不要使用 `--no-verify` 绕过仓库 hooks。
- 绝不要为了让工作区看起来干净而暂存无关的用户变更。
- 除非明确要求，否则绝不要 amend、squash、rebase、force-push 或重写已有提交。
- 除非检查确实成功运行，否则绝不要声称检查已通过。

## Hooks

仓库根目录的 Husky hooks 会强制提交消息格式和暂存文件检查。它们刻意保留在仓库根目录，因为它们同时治理 `front/` 和未来的 `server/` 应用。
