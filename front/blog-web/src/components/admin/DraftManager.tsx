import { useState } from "react";
import { isSafeCover, type Draft, type DraftStore } from "@/lib/admin-drafts";
import AdminIcon from "./AdminIcon";

interface Props {
  store: DraftStore;
  disabled: boolean;
  saveStatus: string;
  message: string;
  onNew: () => void;
  onEdit: (id: string) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
}

export default function DraftManager({
  store,
  disabled,
  saveStatus,
  message,
  onNew,
  onEdit,
  onTrash,
  onRestore,
}: Props) {
  const [view, setView] = useState(() =>
    new URLSearchParams(window.location.search).get("view") === "trash"
      ? "trash"
      : "drafts",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const drafts = store.drafts.filter((item) => !item.deletedAt);
  const trash = store.drafts.filter((item) => item.deletedAt);
  const categories = [
    ...new Set(drafts.map((item) => item.category.trim()).filter(Boolean)),
  ];
  const rows = (view === "trash" ? trash : drafts)
    .filter(
      (item) =>
        (!category || item.category.trim() === category) &&
        `${item.title} ${item.description} ${item.tags}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "zh-CN")
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  const formatDate = (item: Draft) =>
    new Date(item.updatedAt).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <header className="admin-page-header">
        <div>
          <div className="admin-breadcrumb">工作空间 / 文章管理</div>
          <h1>文章管理</h1>
          <p>整理每一次思考，让值得记录的想法继续生长。</p>
        </div>
        <button
          className="admin-button admin-button-primary"
          onClick={onNew}
          disabled={disabled}
        >
          <AdminIcon name="plus" />
          新建文章
        </button>
      </header>
      <div className="admin-stats">
        {[
          {
            title: "本地草稿",
            value: drafts.length,
            icon: "file" as const,
            note: "随时继续你的创作",
          },
          {
            title: "文章分类",
            value: categories.length,
            icon: "grid" as const,
            note: "让内容井然有序",
          },
          {
            title: "回收站",
            value: trash.length,
            icon: "trash" as const,
            note: "移除的草稿可恢复",
          },
        ].map((stat) => (
          <section className="admin-card admin-stat" key={stat.title}>
            <div>
              <span>{stat.title}</span>
              <strong>{stat.value.toString().padStart(2, "0")}</strong>
              <small>{stat.note}</small>
            </div>
            <span className="admin-stat-icon">
              <AdminIcon name={stat.icon} />
            </span>
          </section>
        ))}
      </div>
      <section className="admin-card admin-manager">
        <div
          className="admin-manager-tabs"
          role="tablist"
          aria-label="文章类型"
        >
          <button
            role="tab"
            aria-selected={view === "drafts"}
            onClick={() => {
              setView("drafts");
              setCategory("");
            }}
          >
            草稿 <span>{drafts.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={view === "trash"}
            onClick={() => {
              setView("trash");
              setCategory("");
            }}
          >
            回收站 <span>{trash.length}</span>
          </button>
        </div>
        <div className="admin-filters">
          <label className="admin-search">
            <AdminIcon name="search" />
            <input
              aria-label="搜索文章"
              placeholder="搜索标题、摘要或标签…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="筛选文章分类"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">全部分类</option>
            {[
              ...new Set(
                store.drafts
                  .map((item) => item.category.trim())
                  .filter(Boolean),
              ),
            ].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <select
            aria-label="文章排序"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="latest">最近更新</option>
            <option value="title">标题排序</option>
          </select>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-article-table">
            <thead>
              <tr>
                <th>文章</th>
                <th>分类 / 标签</th>
                <th>状态</th>
                <th>最后更新</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-article-cell">
                      <span className="admin-article-thumbnail">
                        <AdminIcon name="file" />
                        {item.cover && isSafeCover(item.cover) && (
                          <img
                            key={item.cover}
                            src={item.cover}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.hidden = true;
                            }}
                          />
                        )}
                      </span>
                      <div>
                        <strong>{item.title.trim() || "未命名文章"}</strong>
                        <span
                          className="admin-badge ml-2"
                          tabIndex={0}
                          title="清理浏览器缓存后，本地草稿会丢失，请及时发布。"
                        >
                          本地缓存
                        </span>
                        <p>
                          {item.description.trim() ||
                            `${item.content.length} 字符 · 尚未添加摘要`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="admin-category">
                      {item.category.trim() || "未分类"}
                    </span>
                    <p className="admin-table-tags">
                      {item.tags || "暂无标签"}
                    </p>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${item.deletedAt ? "is-trash" : ""}`}
                    >
                      {item.deletedAt
                        ? "已移除"
                        : item.publishedArticleId
                          ? "已发布"
                          : "草稿"}
                    </span>
                  </td>
                  <td className="admin-date">{formatDate(item)}</td>
                  <td>
                    <div className="admin-row-actions">
                      {item.deletedAt ? (
                        <button
                          disabled={disabled}
                          onClick={() => onRestore(item.id)}
                        >
                          恢复草稿
                        </button>
                      ) : (
                        <>
                          <button
                            disabled={disabled}
                            onClick={() => onEdit(item.id)}
                          >
                            继续编辑
                          </button>
                          <button
                            className="admin-delete"
                            disabled={disabled}
                            onClick={() => onTrash(item.id)}
                            aria-label={`将${item.title || "未命名文章"}移入回收站`}
                          >
                            <AdminIcon name="trash" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="admin-empty">
            <AdminIcon name={view === "trash" ? "trash" : "search"} />
            <h2>
              {query || category
                ? "没有找到匹配的文章"
                : view === "trash"
                  ? "回收站是空的"
                  : "从第一篇文章开始"}
            </h2>
            <p>
              {query || category
                ? "试试其他关键词，或调整分类筛选。"
                : view === "trash"
                  ? "移入回收站的草稿将在这里显示。"
                  : "新建一篇草稿，记录此刻的想法。"}
            </p>
          </div>
        )}
        <div className="admin-table-footer">
          共 {rows.length} 篇文章<span>草稿仅保存在当前浏览器</span>
        </div>
      </section>
      <p className="admin-storage-note" role="status">
        {message || saveStatus}
      </p>
      <section className="admin-manager-tip">
        <AdminIcon name="check" />
        <div>
          <strong>给创作留一个安心的空间</strong>
          <p>
            草稿自动保存在当前浏览器。清理浏览器缓存后，本地草稿会丢失，请及时发布，也可导出
            Markdown 备份。
          </p>
        </div>
        <a href="/admin/publish/">开始写作 ↗</a>
      </section>
    </>
  );
}
