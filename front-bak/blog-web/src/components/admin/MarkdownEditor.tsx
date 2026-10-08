import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default function MarkdownEditor({ accountId }: { accountId: string }) {
  const draftKey = `aimcc.admin.drafts.${accountId}`;
  const [store, setStore] = useState<DraftStore>(() =>
    readDraftStore(null, null),
  );
  const draft = store.drafts.find((item) => item.id === store.activeId)!;
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("正在读取草稿…");
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validation, setValidation] = useState<string[] | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const editor = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const lastSaved = useRef<string | null>(null);
  const visibleDrafts = store.drafts.filter((item) => !item.deletedAt);
  const deletedDrafts = store.drafts.filter((item) => item.deletedAt);

  function setDraft(value: Draft) {
    setStore((current) => ({
      ...current,
      drafts: current.drafts.map((item) =>
        item.id === value.id
          ? { ...value, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));
    setValidation(null);
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      lastSaved.current = saved;
      setStore(
        readDraftStore(
          saved,
          saved ? null : localStorage.getItem(`aimcc.admin.draft.${accountId}`),
        ),
      );
    } catch {
      setStorageError(true);
      setSaveStatus("无法读取草稿，原数据已保留；请导出当前内容备份");
    }
    setLoaded(true);
  }, [draftKey, accountId]);

  useEffect(() => {
    if (!loaded || storageError) return;
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
  }, [store, draftKey, loaded, storageError]);

  useEffect(() => {
    if (!storageError) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [storageError]);

  useEffect(() => {
    setCoverFailed(false);
  }, [draft.cover]);

  function addDraft(value = createDraft()) {
    setStore((current) => ({
      ...current,
      activeId: value.id,
      drafts: [value, ...current.drafts],
    }));
    setValidation(null);
  }

  function removeDraft() {
    const remaining = visibleDrafts.filter((item) => item.id !== draft.id);
    const next = remaining[0] ?? createDraft();
    setStore((current) => ({
      ...current,
      activeId: next.id,
      drafts: [
        ...(remaining.length ? [] : [next]),
        ...current.drafts.map((item) =>
          item.id === draft.id
            ? { ...item, deletedAt: new Date().toISOString() }
            : item,
        ),
      ],
    }));
    setValidation(null);
    setMessage("草稿已移入回收站，可随时恢复。");
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

  function insert(before: string, after = "", placeholder = "文字") {
    const input = editor.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = draft.content.slice(start, end) || placeholder;
    setDraft({
      ...draft,
      content:
        draft.content.slice(0, start) +
        before +
        selected +
        after +
        draft.content.slice(end),
    });
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
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

  return (
    <>
      <header className="flex items-center justify-between gap-5 [&_h1]:my-[9px] [&_h1]:text-[28px] [&_h1]:tracking-[-0.04em] [&_p]:m-0 [&_p]:text-sm max-[1100px]:items-start max-[1100px]:flex-col">
        <div>
          <span className="text-admin-primary text-[11px] font-bold tracking-[0.18em]">
            NEW STORY
          </span>
          <h1>发布文章</h1>
          <p className="text-admin-muted leading-[1.7]">
            专注写作，让想法有迹可循。
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
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
          <button
            className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5"
            onClick={() => fileInput.current?.click()}
            disabled={!loaded || storageError || importing}
          >
            {importing ? "正在导入…" : "导入 Markdown"}
          </button>
          <button
            className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5"
            disabled={!loaded}
            onClick={() => setValidation(validateDraft(draft))}
          >
            检查文章
          </button>
          <button
            className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5"
            onClick={download}
            disabled={!loaded}
          >
            导出 Markdown
          </button>
          <button
            className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5 bg-admin-primary! border-admin-primary! text-white! enabled:hover:bg-admin-primary-hover!"
            disabled
            title="文章发布接口尚未接入"
          >
            发布文章
          </button>
        </div>
      </header>
      <p className="mt-6 mb-5 text-xs text-admin-muted">
        发布功能即将开放，当前可编辑、预览并保存本地草稿。
      </p>
      {message && (
        <p className="text-[13px] text-[#23875d]" role="status">
          {message}
        </p>
      )}
      {validation && (
        <div
          className={
            validation.length
              ? "text-[#b42318] bg-[#fff0ed] border border-[#ffcfc6] rounded-md p-3 text-[13px] leading-[1.6]"
              : "text-[13px] text-[#23875d]"
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
            "文章信息检查通过，接入发布功能后即可提交。"
          )}
        </div>
      )}
      <section
        className="mb-6 p-5 border border-admin-border rounded-[10px] bg-admin-surface"
        aria-label="本地草稿管理"
      >
        <div className="flex justify-between items-center gap-4 mb-4 [&_h2]:text-[15px] [&_h2]:m-0 [&_h2_span]:text-admin-subtle [&_h2_span]:font-normal [&_h2_span]:ml-2">
          <h2>
            本地草稿 <span>{visibleDrafts.length}</span>
          </h2>
          <button
            className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5"
            onClick={() => {
              addDraft();
              setMessage("已新建草稿。");
            }}
            disabled={!loaded || storageError || importing}
          >
            ＋ 新建草稿
          </button>
        </div>
        <div className="flex items-center gap-3 max-[760px]:flex-wrap [&_label]:shrink-0 [&_label]:text-xs [&_label]:text-admin-muted [&_select]:flex-1 [&_select]:min-w-0 [&_select]:border [&_select]:border-admin-border [&_select]:rounded-md [&_select]:bg-admin-surface [&_select]:text-admin-text [&_select]:p-[11px] [&_select]:text-[13px] max-[760px]:[&_select]:basis-full max-[760px]:[&_select]:order-3">
          <label htmlFor="draft-select">当前草稿</label>
          <select
            id="draft-select"
            value={store.activeId}
            disabled={!loaded || storageError || importing}
            onChange={(event) => {
              setStore({ ...store, activeId: event.target.value });
              setValidation(null);
              setMessage("");
            }}
          >
            {visibleDrafts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title.trim() || "未命名文章"} ·{" "}
                {new Date(item.updatedAt).toLocaleString("zh-CN")}
              </option>
            ))}
          </select>
          <button
            className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5"
            onClick={removeDraft}
            disabled={!loaded || storageError || importing}
          >
            移入回收站
          </button>
        </div>
        {deletedDrafts.length > 0 && (
          <details className="mt-4 text-admin-muted text-[13px] [&_summary]:cursor-pointer [&_ul]:p-0 [&_ul]:list-none [&_li]:flex [&_li]:justify-between [&_li]:items-center [&_li]:gap-4 [&_li]:py-2.5 [&_li]:border-t [&_li]:border-admin-border [&_li_span]:[overflow-wrap:anywhere]">
            <summary>回收站（{deletedDrafts.length}）</summary>
            <ul>
              {deletedDrafts.map((item) => (
                <li key={item.id}>
                  <span>{item.title.trim() || "未命名文章"}</span>
                  <button
                    className="border border-admin-border rounded-[7px] px-[18px] py-[11px] bg-admin-surface text-admin-text font-semibold text-[13px] enabled:hover:bg-admin-hover max-[760px]:px-3 max-[760px]:py-2.5"
                    disabled={storageError || importing}
                    onClick={() => {
                      setStore({
                        ...store,
                        activeId: item.id,
                        drafts: store.drafts.map((entry) =>
                          entry.id === item.id
                            ? { ...entry, deletedAt: undefined }
                            : entry,
                        ),
                      });
                      setValidation(null);
                      setMessage("草稿已恢复。");
                    }}
                  >
                    恢复草稿
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
      <section className="grid gap-2.5 mb-6" aria-label="文章信息">
        <label className="text-xs text-admin-muted" htmlFor="article-title">
          文章标题
        </label>
        <input
          id="article-title"
          className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px] text-[23px] font-semibold p-[17px]!"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="给这篇文章起个标题…"
          maxLength={200}
          disabled={!loaded}
        />
        <label
          className="text-xs text-admin-muted"
          htmlFor="article-description"
        >
          文章摘要
        </label>
        <input
          className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px]"
          id="article-description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="用一句话介绍这篇文章（选填）"
          maxLength={500}
          disabled={!loaded}
        />
        <div className="grid grid-cols-2 gap-4 mt-2.5 max-[760px]:grid-cols-1 [&_label]:grid [&_label]:gap-2 [&_label]:text-admin-muted [&_label]:text-xs">
          <label>
            分类
            <input
              className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px]"
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value })
              }
              placeholder="例如：技术笔记"
              maxLength={100}
              disabled={!loaded}
            />
          </label>
          <label>
            标签
            <input
              className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px]"
              value={draft.tags}
              onChange={(event) =>
                setDraft({ ...draft, tags: event.target.value })
              }
              placeholder="用逗号分隔，例如 React, 前端"
              maxLength={500}
              disabled={!loaded}
            />
          </label>
          <label>
            文章链接
            <input
              className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px]"
              value={draft.slug}
              onChange={(event) =>
                setDraft({ ...draft, slug: event.target.value })
              }
              placeholder="例如 first-post（选填）"
              maxLength={100}
              disabled={!loaded}
            />
          </label>
          <label>
            封面图片地址
            <input
              className="w-full border border-admin-border bg-admin-surface text-admin-text px-[14px] py-[13px] rounded-[7px]"
              type="url"
              value={draft.cover}
              onChange={(event) =>
                setDraft({ ...draft, cover: event.target.value })
              }
              placeholder="https://…（选填）"
              disabled={!loaded}
            />
          </label>
        </div>
      </section>
      <section
        className="grid grid-cols-2 bg-admin-surface border border-admin-border rounded-[10px] overflow-hidden max-[760px]:grid-cols-1"
        aria-label="Markdown 编辑与预览"
      >
        <div className="min-w-0 flex flex-col border-r border-admin-border max-[760px]:border-r-0 max-[760px]:border-b">
          <div className="flex justify-between items-center py-4 px-5 border-b border-admin-border text-[13px] font-semibold [&>span:last-child]:text-[11px] [&>span:last-child]:text-admin-subtle [&>span:last-child]:font-normal">
            <label htmlFor="markdown-content">Markdown 编辑</label>
            <span>MD</span>
          </div>
          <div
            className="flex items-center flex-wrap gap-1 py-[9px] px-[14px] border-b border-admin-border [&_button]:text-admin-muted [&_button]:py-[5px] [&_button]:px-2.5 [&_button]:border-0 [&_button]:rounded-sm [&_button]:bg-transparent [&_button]:text-xs [&_button:hover]:bg-admin-hover"
            role="toolbar"
            aria-label="插入 Markdown 格式"
          >
            <button
              type="button"
              onClick={() => insert("## ")}
              aria-label="插入标题"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insert("**", "**")}
              aria-label="插入粗体"
            >
              <b>B</b>
            </button>
            <button
              type="button"
              onClick={() => insert("*", "*")}
              aria-label="插入斜体"
            >
              <i>I</i>
            </button>
            <button
              type="button"
              onClick={() => insert("[", "](https://example.com)", "链接文字")}
              aria-label="插入链接"
            >
              链接
            </button>
            <button
              type="button"
              onClick={() => insert("\n> ", "\n", "引用内容")}
              aria-label="插入引用"
            >
              引用
            </button>
            <button
              type="button"
              onClick={() => insert("\n```javascript\n", "\n```\n", "// 代码")}
              aria-label="插入代码块"
            >
              代码
            </button>
            {!draft.content && (
              <button
                type="button"
                onClick={() => setDraft({ ...draft, content: sample })}
              >
                示例
              </button>
            )}
          </div>
          <textarea
            className="resize-y w-full flex-1 min-h-[480px] border-0 rounded-none p-6 bg-transparent text-admin-text font-admin-mono text-sm leading-[1.85] [tab-size:2] focus-visible:outline-offset-[-3px] placeholder:text-admin-subtle max-[760px]:min-h-[360px]"
            ref={editor}
            id="markdown-content"
            spellCheck={false}
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder={sample}
            disabled={!loaded}
          />
          <div className="flex justify-between gap-3 py-3 px-5 border-t border-admin-border text-admin-subtle text-[11px]">
            <span>{draft.content.length} 字符</span>
            <span>支持 Markdown / GFM</span>
          </div>
        </div>
        <div className="min-w-0 flex flex-col">
          <div className="flex justify-between items-center py-4 px-5 border-b border-admin-border text-[13px] font-semibold [&>span:last-child]:text-[11px] [&>span:last-child]:text-admin-subtle [&>span:last-child]:font-normal">
            <span>文章预览</span>
            <span className="text-[#23875d]!">● 实时</span>
          </div>
          <article className="py-6 px-8 max-h-[760px] min-h-[530px] overflow-auto [overflow-wrap:anywhere] leading-[1.9] text-[15px] max-[1100px]:p-5 max-[760px]:min-h-[320px] [&>:first-child]:mt-0 [&_h1]:text-[30px] [&_h1]:leading-[1.35] [&_h2]:text-[23px] [&_h2]:leading-[1.5] [&_h2]:mt-[1.7em] [&_h3]:text-[19px] [&_a]:text-admin-primary [&_blockquote]:ml-0 [&_blockquote]:border-l-[3px] [&_blockquote]:border-admin-accent [&_blockquote]:py-1 [&_blockquote]:px-[18px] [&_blockquote]:bg-admin-hover [&_blockquote]:text-admin-muted [&_pre]:overflow-auto [&_pre]:p-[18px] [&_pre]:bg-[#101c33] [&_pre]:text-[#dce8ff] [&_pre]:rounded-[7px] [&_pre]:text-xs [&_code]:font-admin-mono [&_:not(pre)>code]:bg-admin-hover [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:px-[5px] [&_:not(pre)>code]:rounded-[3px] [&_table]:block [&_table]:overflow-auto [&_table]:border-collapse [&_th]:border [&_th]:border-admin-border [&_th]:py-2 [&_th]:px-3 [&_td]:border [&_td]:border-admin-border [&_td]:py-2 [&_td]:px-3 [&_img]:h-auto [&_img]:rounded-md">
            {draft.cover && isSafeCover(draft.cover) && !coverFailed && (
              <img
                className="w-full max-h-[260px] object-cover mb-5"
                src={draft.cover}
                alt="文章封面"
                onError={() => setCoverFailed(true)}
              />
            )}
            {draft.cover && (!isSafeCover(draft.cover) || coverFailed) && (
              <p className="text-[#b42318] bg-[#fff0ed] border border-[#ffcfc6] rounded-md p-3 text-[13px] leading-[1.6]">
                封面无法加载，请检查图片地址。
              </p>
            )}
            {(draft.category || draft.tags) && (
              <div className="flex gap-2 flex-wrap mb-4 [&_span]:text-[11px] [&_span]:text-admin-primary [&_span]:bg-admin-hover [&_span]:rounded-sm [&_span]:py-[3px] [&_span]:px-[9px]">
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
              <p className="text-admin-muted pb-5 border-b border-admin-border">
                {draft.description}
              </p>
            )}
            {draft.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {draft.content}
              </ReactMarkdown>
            ) : (
              <div className="grid content-center justify-items-center min-h-[400px] text-center text-admin-subtle max-[760px]:min-h-[260px] [&>span]:text-[40px] [&>span]:text-admin-accent [&_h2]:font-admin-display [&_h2]:font-normal [&_h2]:text-[23px] [&_h2]:mb-0 [&_p]:text-[13px]">
                <span>✎</span>
                <h2>文字，从这里生长。</h2>
                <p>在左侧开始写作，预览会实时更新。</p>
              </div>
            )}
          </article>
        </div>
      </section>
      <footer
        className="text-admin-subtle text-[11px] text-right py-[14px] px-0.5"
        role="status"
      >
        {saveStatus}
      </footer>
    </>
  );
}
