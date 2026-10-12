import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Collapse,
  Dropdown,
  Segmented,
  Typography,
} from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DraftManager from "./DraftManager";
import SourceEditor from "./SourceEditor";
import { adminRequest, AdminApiError } from "@/lib/admin-api";
import {
  fetchTaxonomyOptions,
  draftTaxonomy,
  articlePayload,
  publishArticle,
  type ArticleTaxonomy,
} from "@/lib/admin-publishing";
import { deleteLocalDraft } from "@/lib/admin-delete-draft";
import { clearPublishedDraft } from "@/lib/admin-publish-cleanup";
import { blogUrl } from "@/lib/config";
import CoverSettings from "./CoverSettings";

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
      : (store.drafts.find((item) => item.id === store.activeId) ??
        editorDraft);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("正在读取草稿…");
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validation, setValidation] = useState<string[] | null>(null);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [previewWidth, setPreviewWidth] = useState("desktop");
  const fileInput = useRef<HTMLInputElement>(null);
  const lastSaved = useRef<string | null>(null);

  const selection = draftTaxonomy(draft, taxonomy);

  useEffect(() => {
    if (mode !== "edit") return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    setTaxonomyStatus("loading");
    const base =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
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
      const published = { ...draft, publishedArticleId: id };
      setEditorDraft(published);
      setEditingStarted(false);
      setRecovery(null);
      setValidation(null);
      try {
        const cleaned = clearPublishedDraft(
          localStorage,
          draftKey,
          cacheKey,
          published,
        );
        lastSaved.current = cleaned.saved;
        lastCached.current = cleaned.cached;
        setStore(cleaned.store);
        setCacheError(false);
        setStorageError(false);
        setSaveStatus("已发布 · 本地草稿已清理");
        setMessage("文章发布成功，本地草稿及编辑缓存已清理。");
        const url = new URL(window.location.href);
        url.searchParams.delete("draft");
        window.history.replaceState(null, "", url);
      } catch (cause) {
        setStorageError(true);
        setCacheError(true);
        setSaveStatus("文章已发布，本地清理未完成");
        setPublishError(
          cause instanceof Error
            ? `文章已发布，请勿重复发布。${cause.message}`
            : "文章已发布，但本地草稿清理失败，请在文章管理中核对。",
        );
      }
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
        id ? `/publish/?draft=${encodeURIComponent(id)}` : "/publish/",
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
        onDelete={(id) => {
          try {
            const cleaned = deleteLocalDraft(
              localStorage,
              draftKey,
              cacheKey,
              id,
              lastSaved.current,
              lastCached.current,
            );
            lastSaved.current = cleaned.saved;
            lastCached.current = cleaned.cached;
            setStore(cleaned.store);
            setMessage("本地草稿及编辑缓存已删除。");
          } catch (cause) {
            setStorageError(true);
            setSaveStatus(
              cause instanceof Error
                ? cause.message
                : "删除失败，请刷新后重试。",
            );
          }
        }}
      />
    );

  const wordCount = draft.content.replace(/\s/g, "").length;
  const disabled = !loaded || publishing || !!draft.publishedArticleId;
  return (
    <div className="publish-page">
      <header className="publish-header">
        <div>
          <Typography.Title level={4}>发布文章</Typography.Title>
          <Typography.Text type={storageError ? "danger" : "secondary"}>
            {editingStarted || draft.publishedArticleId || storageError
              ? saveStatus
              : "新文章 · 输入后自动保存"}
          </Typography.Text>
        </div>
        <Space wrap>
          <Button href="/">管理草稿</Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "new",
                  label: "新建文章",
                  disabled: !loaded || publishing || storageError || importing,
                  onClick: () => {
                    addDraft();
                    setMessage("");
                    setPublishError("");
                  },
                },
                {
                  key: "import",
                  label: "导入 Markdown",
                  disabled: disabled || storageError || importing,
                  onClick: () => fileInput.current?.click(),
                },
                {
                  key: "check",
                  label: "检查文章",
                  disabled: disabled,
                  onClick: () => setValidation(validateDraft(draft)),
                },
                {
                  key: "export",
                  label: "导出 Markdown",
                  disabled: !loaded || publishing,
                  onClick: download,
                },
              ],
            }}
          >
            <Button loading={importing}>更多操作</Button>
          </Dropdown>
          <Button
            type="primary"
            loading={publishing}
            disabled={disabled || importing || taxonomyStatus !== "ready"}
            onClick={() => void publish()}
          >
            {draft.publishedArticleId ? "已发布" : "发布文章"}
          </Button>
        </Space>
      </header>
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
      {cacheError && (
        <Alert
          type="warning"
          showIcon
          title="编辑缓存不可用或已被其他标签页更新，请导出 Markdown 备份；原有缓存已保留。"
        />
      )}
      {publishError && <Alert type="error" showIcon title={publishError} />}
      {message && <Alert type="success" showIcon title={message} />}
      {draft.publishedArticleId && (
        <Alert
          type="success"
          title={
            <a href={`${blogUrl}/article/?id=${draft.publishedArticleId}`}>
              查看已发布文章
            </a>
          }
        />
      )}
      {validation && (
        <Alert
          type={validation.length ? "error" : "success"}
          title={
            validation.length ? validation.join("；") : "文章信息检查通过。"
          }
        />
      )}
      {recovery && (
        <Alert
          type="info"
          title="有一篇未完成的草稿"
          description={recovery.title || "未命名文章"}
          action={
            <Space>
              <Button onClick={() => setRecovery(null)}>暂不恢复</Button>
              <Button
                type="primary"
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
            </Space>
          }
        />
      )}
      <Card title="文章信息" size="small" className="publish-information">
        <Form layout="vertical" className="publish-form">
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={9} className="publish-information-section">
              {" "}
              <Form.Item label="文章标题" required>
                <Input
                  placeholder="请输入文章标题…"
                  value={draft.title}
                  maxLength={200}
                  showCount
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item label="文章摘要">
                <Input.TextArea
                  rows={3}
                  placeholder="用一段话描述这篇文章的主要内容…"
                  value={draft.description}
                  maxLength={500}
                  showCount
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={7} className="publish-information-section">
              {" "}
              <Form.Item label="分类">
                <Select
                  aria-label="文章分类"
                  allowClear
                  placeholder="请选择分类"
                  value={selection.categoryId ?? undefined}
                  disabled={disabled || taxonomyStatus !== "ready"}
                  options={taxonomy.categories.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onChange={(categoryId) =>
                    setDraft({
                      ...draft,
                      categoryId: categoryId ?? null,
                      category:
                        taxonomy.categories.find(
                          (item) => item.id === categoryId,
                        )?.name ?? "",
                    })
                  }
                />
                {draft.category &&
                  !taxonomy.categories.some(
                    (item) => item.id === selection.categoryId,
                  ) && (
                    <Typography.Text type="warning">
                      原分类：{draft.category}（请重新选择）
                    </Typography.Text>
                  )}
              </Form.Item>
              <Form.Item label="标签（可多选）">
                <Select
                  aria-label="文章标签"
                  placeholder="请选择标签"
                  mode="multiple"
                  allowClear
                  value={selection.tagIds}
                  disabled={disabled || taxonomyStatus !== "ready"}
                  options={taxonomy.tags.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onClear={() => setDraft({ ...draft, tags: "", tagIds: [] })}
                  onChange={(tagIds) =>
                    setDraft({
                      ...draft,
                      tagIds,
                      tags: taxonomy.tags
                        .filter((item) => tagIds.includes(item.id))
                        .map((item) => item.name)
                        .join(", "),
                    })
                  }
                />

                {draft.tags &&
                  (draft.tagIds === undefined ||
                    selection.tagIds.some(
                      (id) => !taxonomy.tags.some((tag) => tag.id === id),
                    )) && (
                    <Typography.Text type="warning">
                      原草稿标签：{draft.tags}。请核对后选择。
                    </Typography.Text>
                  )}
              </Form.Item>
              {taxonomyStatus === "loading" && (
                <Typography.Text>正在加载分类和标签…</Typography.Text>
              )}
              {taxonomyStatus === "error" && (
                <Alert
                  type="error"
                  title="分类或标签加载失败"
                  action={
                    <Button
                      onClick={() => setTaxonomyAttempt((value) => value + 1)}
                    >
                      重新加载
                    </Button>
                  }
                />
              )}
            </Col>
            <Col xs={24} md={12} lg={8} className="publish-information-section">
              {" "}
              <Collapse
                ghost
                size="small"
                defaultActiveKey={["advanced"]}
                items={[
                  {
                    key: "advanced",
                    label: "封面设置",
                    children: (
                      <>
                        <CoverSettings
                          value={draft.cover}
                          disabled={disabled}
                          failed={coverFailed}
                          onChange={(cover) => setDraft({ ...draft, cover })}
                          onError={() => setCoverFailed(true)}
                        />
                      </>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        </Form>
      </Card>
      <Row gutter={[16, 16]} align="stretch">
        {!previewOnly && (
          <Col xs={24} lg={13} className="publish-writing-column">
            <Card
              size="small"
              title="正文"
              className="publish-writing-card"
              extra={
                <Space>
                  <Segmented
                    size="small"
                    options={[
                      { label: "编辑", value: false },
                      { label: "预览", value: true },
                    ]}
                    value={previewOnly}
                    onChange={setPreviewOnly}
                  />
                  <Button
                    size="small"
                    disabled={disabled || !!draft.content}
                    onClick={() => setDraft({ ...draft, content: sample })}
                  >
                    插入示例
                  </Button>
                </Space>
              }
            >
              <SourceEditor
                value={draft.content}
                placeholder={sample}
                disabled={disabled}
                onChange={(content) => setDraft({ ...draft, content })}
              />
              <div className="publish-editor-meta">
                <Typography.Text type="secondary">
                  {wordCount.toLocaleString()} 字 · 预计{" "}
                  {wordCount ? Math.max(1, Math.ceil(wordCount / 400)) : 0}{" "}
                  分钟阅读
                </Typography.Text>
                <Typography.Text type="secondary">
                  支持 Markdown / GFM
                </Typography.Text>
              </div>
            </Card>
          </Col>
        )}
        <Col
          xs={24}
          lg={previewOnly ? 24 : 11}
          className="publish-writing-column"
        >
          <Card
            size="small"
            title="实时预览"
            className="publish-writing-card"
            extra={
              <Space wrap>
                {previewOnly && (
                  <Button size="small" onClick={() => setPreviewOnly(false)}>
                    返回编辑
                  </Button>
                )}
                <Segmented
                  size="small"
                  aria-label="预览尺寸"
                  value={previewWidth}
                  onChange={setPreviewWidth}
                  options={[
                    { value: "desktop", label: "桌面" },
                    { value: "tablet", label: "平板" },
                    { value: "phone", label: "手机" },
                  ]}
                />
              </Space>
            }
          >
            <div className={`markdown-preview preview-${previewWidth}`}>
              {draft.cover && isSafeCover(draft.cover) && !coverFailed && (
                <img
                  src={draft.cover}
                  alt="文章封面"
                  onError={() => setCoverFailed(true)}
                />
              )}
              {draft.title && (
                <Typography.Title>{draft.title}</Typography.Title>
              )}
              <Typography.Text>
                {draft.category} {draft.tags}
              </Typography.Text>
              <Typography.Paragraph>{draft.description}</Typography.Paragraph>
              {!draft.content && (
                <Typography.Text type="secondary">
                  在左侧开始写作，预览会实时更新。
                </Typography.Text>
              )}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {draft.content}
              </ReactMarkdown>
            </div>
          </Card>
        </Col>
      </Row>
      <Collapse
        size="small"
        defaultActiveKey={["outline"]}
        items={[
          {
            key: "outline",
            label: "文章目录",
            children: draft.content
              .split("\n")
              .filter((line) => /^#{1,3}\s/.test(line))
              .map((line, i) => (
                <div key={i}>{line.replace(/^#+\s+/, "")}</div>
              )),
          },
        ]}
      />
      <Typography.Text type="secondary">
        公开发布 · 发布成功后自动清理当前本地草稿和编辑缓存
      </Typography.Text>
    </div>
  );
}
