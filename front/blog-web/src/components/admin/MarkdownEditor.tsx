import { Checkbox } from "@aimcc/react-component";
import { Input } from "@aimcc/react-component";
import {
  Button,
  NativeSelect,
  NativeSelectOption,
  Textarea,
} from "@aimcc/react-component";
import { useEffect, useRef, useState } from "react";
import { MarkdownEditor as SharedMarkdownEditor } from "@aimcc/react-component/markdown-editor";
import DraftManager from "./DraftManager";
import { adminRequest, AdminApiError } from "@/lib/admin-api";
import {
  fetchTaxonomyOptions,
  draftTaxonomy,
  articlePayload,
  publishArticle,
  type ArticleTaxonomy,
} from "@/lib/admin-publishing";
import { articleDetailHref } from "@/lib/article-detail";
import CoverSettings from "./CoverSettings";
import AdminIcon from "./AdminIcon";
import {
  readEditingCache,
  writeEditingCache,
  recoverEditingCache,
  readEditingCacheStore,
  mergeEditingCache,
} from "@/lib/admin-edit-cache";

import {
  createDraft,
  readDraftStore,
  validateDraft,
  isSafeCover,
  exportMarkdown,
  importMarkdown,
  type Draft,
  type DraftStore,
} from "@/lib/admin-drafts";

const sample = `## 从一个想法开始\n\n在左侧写下你的文字，右侧会实时呈现。\n\n### Markdown 写作\n\n- 用 **粗体** 强调重点\n- 用 *斜体* 表达语气\n- 添加 [链接](https://example.com)\n\n> 把值得记录的事情，慢慢写下来。\n\n\`\`\`javascript\nconst idea = "Hello, world!";\nconsole.log(idea);\n\`\`\`\n`;

export default function MarkdownEditor({
  accountId,
  mode = "edit",
}: {
  accountId: string;
  mode?: "edit" | "manage";
}) {
  const draftKey = `aimcc.admin.drafts.${accountId}`;
  const cacheKey = `aimcc.admin.edit-cache.${accountId}`;
  const [taxonomy, setTaxonomy] = useState<ArticleTaxonomy>({
    categories: [],
    tags: [],
  });
  const [taxonomyStatus, setTaxonomyStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [taxonomyAttempt, setTaxonomyAttempt] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const publishingLock = useRef(false);
  const [publishError, setPublishError] = useState("");
  const [recovery, setRecovery] = useState<Draft | null>(null);
  const [cacheError, setCacheError] = useState(false);
  const lastCached = useRef<string | null>(null);
  const [store, setStore] = useState<DraftStore>(() =>
    readDraftStore(null, null),
  );
  const [editorDraft, setEditorDraft] = useState<Draft>(() => createDraft());
  const [editingStarted, setEditingStarted] = useState(false);
  const draft =
    mode === "edit"
      ? editorDraft
      : store.drafts.find((item) => item.id === store.activeId)!;
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("正在读取草稿…");
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validation, setValidation] = useState<string[] | null>(null);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const lastSaved = useRef<string | null>(null);
  const visibleDrafts = store.drafts.filter((item) => !item.deletedAt);

  const selection = draftTaxonomy(draft, taxonomy);

  useEffect(() => {
    if (mode !== "edit") return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    setTaxonomyStatus("loading");
    const base =
      import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
    void Promise.all([
      fetchTaxonomyOptions(base, "/categorys", controller.signal),
      fetchTaxonomyOptions(base, "/tags", controller.signal),
    ])
      .then(([categories, tags]) => {
        if (active) {
          setTaxonomy({ categories, tags });
          setTaxonomyStatus("ready");
        }
      })
      .catch(() => {
        if (active) setTaxonomyStatus("error");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [mode, taxonomyAttempt]);

  async function publish() {
    if (
      publishingLock.current ||
      !loaded ||
      taxonomyStatus !== "ready" ||
      draft.publishedArticleId
    )
      return;
    setPublishError("");
    setMessage("");
    try {
      articlePayload(draft, taxonomy);
    } catch (cause) {
      setPublishError(
        cause instanceof Error ? cause.message : "请检查文章信息",
      );
      return;
    }
    publishingLock.current = true;
    setPublishing(true);
    try {
      const id = await publishArticle(draft, taxonomy, adminRequest<number>);
      setDraft({ ...draft, publishedArticleId: id });
      setMessage(`文章发布成功（ID：${id}），本地草稿已保留。`);
    } catch (cause) {
      setPublishError(
        cause instanceof AdminApiError && cause.code === 401
          ? "登录已过期，请重新登录后发布；本地草稿已保留。"
          : cause instanceof AdminApiError
            ? cause.message
            : "未能确认发布结果，请先查看博客确认是否已发布，再决定是否重试；本地草稿已保留。",
      );
    } finally {
      publishingLock.current = false;
      setPublishing(false);
    }
  }

  function cacheDraft(updated: Draft) {
    // Cache in the same input event: closing the page before effects run
    // must not lose the latest keystroke or article metadata.
    try {
      if (localStorage.getItem(cacheKey) !== lastCached.current) {
        throw new Error("另一标签页已更新编辑缓存");
      }
      writeEditingCache(localStorage, cacheKey, updated);
      lastCached.current = localStorage.getItem(cacheKey);
      setCacheError(false);
    } catch {
      setCacheError(true);
    }
    setRecovery(null);
  }

  function setDraft(value: Draft) {
    const updated = { ...value, updatedAt: new Date().toISOString() };
    cacheDraft(updated);
    setEditorDraft(updated);
    setEditingStarted(true);
    setStore((current) => ({
      ...current,
      activeId: updated.id,
      drafts: current.drafts.some((item) => item.id === updated.id)
        ? current.drafts.map((item) =>
            item.id === updated.id ? updated : item,
          )
        : [updated, ...current.drafts],
    }));
    setValidation(null);
  }

  useEffect(() => {
    let savedStore: DraftStore | undefined;
    let persistedStore: DraftStore | undefined;
    setEditingStarted(false);
    setEditorDraft(createDraft());
    try {
      const saved = localStorage.getItem(draftKey);
      lastSaved.current = saved;
      const legacy = saved
        ? null
        : localStorage.getItem(`aimcc.admin.draft.${accountId}`);
      savedStore = readDraftStore(saved, legacy);
      if (saved || legacy) persistedStore = savedStore;
      else setEditorDraft(savedStore.drafts[0]);
      setStore(savedStore);
    } catch {
      setStorageError(true);
      setSaveStatus("无法读取草稿，原数据已保留；请导出当前内容备份");
    }
    try {
      const raw = localStorage.getItem(cacheKey);
      lastCached.current = raw;
      const cache = readEditingCacheStore(raw, persistedStore);
      let merged = savedStore
        ? mergeEditingCache(savedStore, cache)
        : undefined;
      if (merged && !persistedStore && Object.keys(cache.entries).length) {
        const drafts = merged.drafts.filter((item) =>
          Object.hasOwn(cache.entries, item.id),
        );
        merged = {
          ...merged,
          drafts,
          activeId: cache.latestKey ?? drafts[0].id,
        };
      }
      if (merged) setStore(merged);
      if (mode === "edit") {
        const selectedId = new URLSearchParams(window.location.search).get(
          "draft",
        );
        const selected = selectedId
          ? merged?.drafts.find(
              (item) => item.id === selectedId && !item.deletedAt,
            )
          : undefined;
        // "Continue editing" in article management is an explicit selection.
        if (selected) {
          setEditorDraft(selected);
          setEditingStarted(true);
          setRecovery(null);
          if (merged) setStore({ ...merged, activeId: selected.id });
        } else setRecovery(readEditingCache(raw, persistedStore));
      }
      if (localStorage.getItem(cacheKey) !== raw) throw new Error("缓存已更新");
      const upgraded = JSON.stringify(cache);
      localStorage.setItem(cacheKey, upgraded);
      lastCached.current = upgraded;
    } catch {
      setCacheError(true);
    }
    setLoaded(true);
  }, [draftKey, accountId, cacheKey, mode]);

  useEffect(() => {
    if (!loaded || storageError || (mode === "edit" && !editingStarted)) return;
    try {
      if (localStorage.getItem(draftKey) !== lastSaved.current) {
        setStorageError(true);
        setSaveStatus("另一标签页已更新草稿，请导出当前内容后刷新，避免覆盖");
        return;
      }
      const saved = JSON.stringify(store);
      localStorage.setItem(draftKey, saved);
      lastSaved.current = saved;
      setSaveStatus("已保存到当前浏览器 · 草稿不会同步到其他设备");
    } catch {
      setStorageError(true);
      setSaveStatus("保存失败，请导出 Markdown 备份");
    }
  }, [store, draftKey, cacheKey, loaded, storageError, mode, editingStarted]);

  useEffect(() => {
    if (!storageError && !cacheError) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [storageError, cacheError]);

  useEffect(() => {
    setCoverFailed(false);
  }, [draft.cover]);

  function addDraft(value = createDraft()) {
    const url = new URL(window.location.href);
    url.searchParams.delete("draft");
    window.history.replaceState(null, "", url);
    setEditorDraft(value);
    setEditingStarted(true);
    cacheDraft(value);
    setStore((current) => ({
      ...current,
      activeId: value.id,
      drafts: [value, ...current.drafts],
    }));
    setValidation(null);
  }

  async function loadFile(file: File) {
    setImporting(true);
    setMessage("");
    try {
      if (!/\.(md|markdown)$/i.test(file.name))
        throw new Error("请选择 .md 或 .markdown 文件");
      if (file.size > 2 * 1024 * 1024)
        throw new Error("文件超过 2 MB，请缩小后导入");
      const value = importMarkdown(await file.text(), file.name);
      addDraft(value);
      setMessage(`已将「${file.name}」导入为新草稿，原草稿保留。`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "读取文件失败，请重试",
      );
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function download() {
    const content = exportMarkdown(draft);
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${draft.title.trim().replace(/[\\/:*?"<>|]/g, "-") || "未命名文章"}.md`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Markdown 文件已导出。");
  }

  function openEditor(id?: string) {
    if (!loaded || storageError || importing) return;
    const next = id
      ? { ...store, activeId: id }
      : (() => {
          const value = createDraft();
          return {
            ...store,
            activeId: value.id,
            drafts: [value, ...store.drafts],
          };
        })();
    try {
      if (localStorage.getItem(draftKey) !== lastSaved.current)
        throw new Error("conflict");
      const saved = JSON.stringify(next);
      localStorage.setItem(draftKey, saved);
      lastSaved.current = saved;
      cacheDraft(next.drafts.find((item) => item.id === next.activeId)!);
      window.location.assign(
        id
          ? `/admin/publish/?draft=${encodeURIComponent(id)}`
          : "/admin/publish/",
      );
    } catch {
      setStorageError(true);
      setSaveStatus("无法安全保存草稿，请刷新后重试；当前内容已保留。");
    }
  }

  if (mode === "manage")
    return (
      <DraftManager
        store={store}
        disabled={!loaded || storageError || importing || publishing}
        saveStatus={saveStatus}
        message={storageError ? "" : message}
        onNew={() => openEditor()}
        onEdit={openEditor}
        onTrash={(id) => {
          const remaining = visibleDrafts.filter((item) => item.id !== id);
          const next = remaining[0] ?? createDraft();
          setStore({
            ...store,
            activeId: store.activeId === id ? next.id : store.activeId,
            drafts: [
              ...(remaining.length ? [] : [next]),
              ...store.drafts.map((item) =>
                item.id === id
                  ? { ...item, deletedAt: new Date().toISOString() }
                  : item,
              ),
            ],
          });
          setMessage("草稿已移入回收站，可随时恢复。");
        }}
        onRestore={(id) => {
          setStore({
            ...store,
            drafts: store.drafts.map((item) =>
              item.id === id ? { ...item, deletedAt: undefined } : item,
            ),
          });
          setMessage("草稿已恢复，可在草稿列表继续编辑。");
        }}
      />
    );

  const headings = draft.content
    .split("\n")
    .filter((line) => /^#{1,3}\s/.test(line))
    .map((line) => ({
      level: line.match(/^#+/)![0].length,
      text: line.replace(/^#+\s+/, ""),
    }));
  const wordCount = draft.content.replace(/\s/g, "").length;

  return (
    <>
      {cacheError && (
        <p role="alert" className="admin-cache-warning">
          编辑缓存不可用或已被其他标签页更新。请导出 Markdown
          备份当前内容；原有缓存已保留。
        </p>
      )}
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">发布文章 / 新建文章</span>
          <h1>发布文章</h1>
          <p className="admin-intro">用文字记录思考，让想法更有迹可循。</p>
        </div>
        <div className="admin-header-actions">
          <span className="admin-save-indicator" title={saveStatus}>
            <i className={storageError ? "is-error" : ""} />
            {storageError
              ? "保存异常"
              : loaded
                ? editingStarted
                  ? "草稿已自动保存"
                  : "新文章"
                : "正在读取…"}
          </span>
          <input
            ref={fileInput}
            type="file"
            accept=".md,.markdown,text/markdown"
            hidden
            aria-label="选择 Markdown 文件"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void loadFile(file);
            }}
          />
          <Button
            variant="ghost"
            className="admin-action"
            onClick={() => fileInput.current?.click()}
            disabled={!loaded || storageError || importing || publishing}
          >
            {importing ? "正在导入…" : "导入 Markdown"}
          </Button>
          <Button
            variant="ghost"
            className="admin-action"
            disabled={!loaded || publishing}
            onClick={() => setValidation(validateDraft(draft))}
          >
            检查文章
          </Button>
          <Button
            variant="ghost"
            className="admin-action"
            onClick={download}
            disabled={!loaded || publishing}
          >
            导出 Markdown
          </Button>
          <Button
            variant="ghost"
            className="admin-button"
            disabled={publishing}
            onClick={() => setPreviewOnly(!previewOnly)}
            aria-pressed={previewOnly}
          >
            {previewOnly ? "返回编辑" : "预览"}
          </Button>
          <Button
            variant="ghost"
            className="admin-action-primary"
            disabled={
              !loaded ||
              importing ||
              publishing ||
              taxonomyStatus !== "ready" ||
              !!draft.publishedArticleId
            }
            onClick={() => void publish()}
          >
            {publishing
              ? "正在发布…"
              : draft.publishedArticleId
                ? "已发布"
                : "发布文章"}
          </Button>
        </div>
      </header>
      <p className="admin-publish-notice">
        写作内容会自动保存为本地草稿，点击发布后文章将公开展示。
      </p>
      {publishError && (
        <p className="admin-feedback-error" role="alert">
          {publishError}
        </p>
      )}
      {draft.publishedArticleId && (
        <p className="admin-feedback-pending">
          <a href={articleDetailHref(draft.publishedArticleId)}>
            查看已发布文章 ↗
          </a>{" "}
          · 再次发布请新建草稿。
        </p>
      )}
      {message && (
        <p className="admin-feedback-success" role="status">
          {message}
        </p>
      )}
      {validation && (
        <div
          className={
            validation.length ? "admin-error-notice" : "admin-feedback-success"
          }
          role="status"
        >
          {validation.length ? (
            <ul>
              {validation.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : (
            "文章信息检查通过。"
          )}
        </div>
      )}
      <div className="admin-editor-draft-bar">
        <span>
          {editingStarted
            ? `当前文章：${draft.title.trim() || "未命名文章"}`
            : "新文章 · 开始写作后自动保存"}
        </span>
        <div>
          <a href="/admin/">管理草稿</a>
          <Button
            variant="ghost"
            className="admin-inline-action"
            type="button"
            disabled={!loaded || storageError || importing || publishing}
            onClick={() => {
              addDraft();
              setMessage("");
              setPublishError("");
            }}
          >
            新建文章
          </Button>
        </div>
      </div>
      {recovery && (
        <aside
          className="admin-draft-recovery"
          role="status"
          aria-label="恢复草稿提示"
        >
          <div>
            <strong>有一篇未完成的草稿</strong>
            <p>
              {recovery.title.trim() || "未命名文章"}
              <span>
                {" "}
                ·{" "}
                {new Date(recovery.updatedAt).toLocaleString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
          <div className="admin-draft-recovery__actions">
            <Button
              variant="ghost"
              type="button"
              className="admin-button"
              onClick={() => setRecovery(null)}
            >
              暂不恢复
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="admin-button admin-button-primary"
              onClick={() => {
                const restored = recoverEditingCache(store, recovery);
                const recovered = restored.drafts.find(
                  (item) => item.id === restored.activeId,
                )!;
                cacheDraft(recovered);
                setEditorDraft(recovered);
                setEditingStarted(true);
                setStore(restored);
                setRecovery(null);
                setValidation(null);
                setMessage("已恢复草稿，可继续写作。");
              }}
            >
              恢复草稿
            </Button>
          </div>
        </aside>
      )}
      <div className="admin-publish-grid">
        <div className="admin-editor-main">
          <section
            className="admin-card admin-basic-info"
            aria-label="文章信息"
          >
            <h2>基本信息</h2>
            <label className="admin-field-caption" htmlFor="article-title">
              文章标题 <span className="admin-required">*</span>
              <span className="admin-field-count">
                {draft.title.length} / 200
              </span>
            </label>
            <Input
              id="article-title"
              className="admin-title-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="给这篇文章起个标题…"
              maxLength={200}
              disabled={!loaded || publishing}
            />
            <label
              className="admin-field-caption"
              htmlFor="article-description"
            >
              文章摘要{" "}
              <span className="admin-field-count">
                {draft.description.length} / 500
              </span>
            </label>
            <Textarea
              rows={3}
              className="admin-description"
              id="article-description"
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              placeholder="用一句话介绍这篇文章（选填）"
              maxLength={500}
              disabled={!loaded || publishing}
            />
            <div className="admin-taxonomy-fields">
              <label className="admin-taxonomy-fields__category">
                分类
                <NativeSelect
                  aria-label="文章分类"
                  className="admin-form-control"
                  value={
                    selection.categoryId ??
                    (draft.category ? "unavailable" : "")
                  }
                  disabled={!loaded || publishing || taxonomyStatus !== "ready"}
                  onChange={(event) => {
                    const categoryId = event.target.value
                      ? Number(event.target.value)
                      : null;
                    setDraft({
                      ...draft,
                      categoryId,
                      category:
                        taxonomy.categories.find(
                          (item) => item.id === categoryId,
                        )?.name ?? "",
                    });
                  }}
                  wrapperClassName="admin-select-wrapper"
                >
                  <NativeSelectOption value="">未分类</NativeSelectOption>
                  {draft.category && selection.categoryId === null && (
                    <NativeSelectOption value="unavailable" disabled>
                      {draft.category}（请重新选择）
                    </NativeSelectOption>
                  )}
                  {selection.categoryId !== null &&
                    !taxonomy.categories.some(
                      (item) => item.id === selection.categoryId,
                    ) && (
                      <NativeSelectOption value={selection.categoryId} disabled>
                        {draft.category || "原分类"}（已不可用）
                      </NativeSelectOption>
                    )}
                  {taxonomy.categories.map((item) => (
                    <NativeSelectOption key={item.id} value={item.id}>
                      {item.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </label>
              <fieldset
                className="admin-tag-fieldset"
                disabled={!loaded || publishing || taxonomyStatus !== "ready"}
              >
                <legend className="admin-tag-fieldset__legend">
                  标签（可多选）
                </legend>
                <div className="admin-tag-options">
                  {taxonomy.tags.map((item) => (
                    <label key={item.id} className="admin-tag-options__label">
                      <Checkbox
                        disabled={
                          !loaded || publishing || taxonomyStatus !== "ready"
                        }
                        checked={selection.tagIds.includes(item.id)}
                        onCheckedChange={(checked) => {
                          const tagIds =
                            checked === true
                              ? [...selection.tagIds, item.id]
                              : selection.tagIds.filter((id) => id !== item.id);
                          setDraft({
                            ...draft,
                            tagIds,
                            tags: taxonomy.tags
                              .filter((tag) => tagIds.includes(tag.id))
                              .map((tag) => tag.name)
                              .join(", "),
                          });
                        }}
                      />
                      {item.name}
                    </label>
                  ))}
                  {taxonomyStatus === "ready" && taxonomy.tags.length === 0 && (
                    <span className="admin-field-caption">暂无可选标签</span>
                  )}
                </div>
                {draft.tags &&
                  (draft.tagIds === undefined ||
                    selection.tagIds.some(
                      (id) => !taxonomy.tags.some((tag) => tag.id === id),
                    )) && (
                    <p className="admin-field-caption">
                      原草稿标签：{draft.tags}。请核对后选择。
                    </p>
                  )}
                <Button
                  variant="ghost"
                  type="button"
                  className="admin-button admin-tag-clear"
                  onClick={() => setDraft({ ...draft, tags: "", tagIds: [] })}
                >
                  清空标签
                </Button>
              </fieldset>
              {taxonomyStatus === "loading" && (
                <p role="status" className="admin-field-caption">
                  正在加载分类和标签…
                </p>
              )}
              {taxonomyStatus === "error" && (
                <div role="alert" className="admin-taxonomy-error">
                  分类或标签加载失败。
                  <Button
                    variant="ghost"
                    type="button"
                    className="admin-button"
                    onClick={() => setTaxonomyAttempt((value) => value + 1)}
                  >
                    重新加载
                  </Button>
                </div>
              )}
              <label>
                文章链接
                <Input
                  className="admin-form-control"
                  value={draft.slug}
                  onChange={(event) =>
                    setDraft({ ...draft, slug: event.target.value })
                  }
                  placeholder="例如 first-post（选填）"
                  maxLength={100}
                  disabled={!loaded || publishing}
                />
              </label>
            </div>
            <CoverSettings
              value={draft.cover}
              disabled={!loaded || publishing}
              failed={coverFailed}
              onChange={(cover) => setDraft({ ...draft, cover })}
              onError={() => setCoverFailed(true)}
            />
          </section>
          <h2 className="admin-editor-heading">
            文章内容
            {!draft.content && (
              <Button
                variant="ghost"
                type="button"
                className="admin-button"
                disabled={!loaded || publishing}
                onClick={() => setDraft({ ...draft, content: sample })}
              >
                插入示例
              </Button>
            )}
          </h2>
          <SharedMarkdownEditor
            value={draft.content}
            onChange={(content) => setDraft({ ...draft, content })}
            disabled={!loaded || publishing}
            previewOnly={previewOnly}
            placeholder={sample}
            previewHeader={
              <>
                {draft.cover && isSafeCover(draft.cover) && !coverFailed && (
                  <img
                    className="admin-preview-cover"
                    src={draft.cover}
                    alt="文章封面"
                    onError={() => setCoverFailed(true)}
                  />
                )}
                {draft.cover && (!isSafeCover(draft.cover) || coverFailed) && (
                  <p className="admin-error-notice">
                    封面无法加载，请检查图片地址。
                  </p>
                )}
                {(draft.category || draft.tags) && (
                  <div className="admin-preview-tags">
                    {draft.category && <span>{draft.category}</span>}
                    {draft.tags
                      .split(/[,，]/)
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag, index) => (
                        <span key={`${tag}-${index}`}>#{tag}</span>
                      ))}
                  </div>
                )}
                {draft.title && <h1>{draft.title}</h1>}
                {draft.description && (
                  <p className="admin-preview-summary">{draft.description}</p>
                )}
              </>
            }
          />
        </div>
        <aside className="admin-inspector" aria-label="文章辅助信息">
          <section className="admin-card">
            <h2>发布设置</h2>
            <div className="admin-public-option">
              <span className="admin-radio" />
              <div>
                <strong>
                  {draft.publishedArticleId ? "已发布" : "公开发布"}
                </strong>
                <p>发布后所有访客均可阅读</p>
              </div>
            </div>
            <p className="admin-inspector-note">
              发布成功后保留本地草稿。文章链接字段仅用于 Markdown
              导出，线上文章链接由服务器 ID 生成。
            </p>
            <Button
              variant="ghost"
              className="admin-button admin-export"
              disabled={!loaded || publishing}
              onClick={download}
            >
              导出 Markdown ↗
            </Button>
          </section>
          <section className="admin-card">
            <h2>
              目录结构 <span className="admin-auto-label">自动生成</span>
            </h2>
            <div className="admin-outline">
              {headings.length ? (
                headings.map((heading, index) => (
                  <div
                    key={index}
                    style={{ paddingLeft: (heading.level - 1) * 12 }}
                  >
                    <span>H{heading.level}</span>
                    {heading.text}
                  </div>
                ))
              ) : (
                <p>添加 Markdown 标题后，目录会在这里自动显示。</p>
              )}
            </div>
          </section>
          <section className="admin-card">
            <h2>文章信息</h2>
            <dl className="admin-article-info">
              <div>
                <dt>
                  <AdminIcon name="clock" />
                  预计阅读时间
                </dt>
                <dd>
                  {wordCount ? Math.max(1, Math.ceil(wordCount / 400)) : 0} 分钟
                </dd>
              </div>
              <div>
                <dt>
                  <AdminIcon name="file" />
                  正文字数
                </dt>
                <dd>{wordCount.toLocaleString()} 字</dd>
              </div>
              <div>
                <dt>
                  <AdminIcon name="clock" />
                  最后编辑
                </dt>
                <dd>
                  {loaded
                    ? new Date(draft.updatedAt).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </dd>
              </div>
              <div>
                <dt>
                  <AdminIcon name="file" />
                  编辑状态
                </dt>
                <dd className="admin-draft-status">
                  {draft.publishedArticleId ? "已发布 ●" : "草稿 ●"}
                </dd>
              </div>
            </dl>
          </section>
          <section className="admin-card admin-writing-tips">
            <h2>✦ 操作提示</h2>
            <ul>
              {[
                "添加清晰的标题与摘要",
                "设置合适的分类和标签",
                "检查文章链接是否正确",
                "导出前建议先预览效果",
              ].map((tip) => (
                <li key={tip}>
                  <AdminIcon name="check" />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
      <footer className="admin-editor-footer" role="status">
        {editingStarted
          ? saveStatus
          : "开始输入后自动保存，原有草稿会保留在文章管理中。"}
      </footer>
    </>
  );
}
