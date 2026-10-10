import { useEffect, useState } from "react";
import { MarkdownReader } from "@aimcc/react-component/markdown";
import { getArticleDetail } from "@/lib/api";
import type { ApiArticleDetail as ArticleDetail } from "@/lib/article-detail";

export default function ApiArticleDetail() {
  const [id, setId] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleDetail>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const syncId = () =>
      setId(new URLSearchParams(window.location.search).get("id") ?? "");
    syncId();
    document.addEventListener("astro:page-load", syncId);
    window.addEventListener("popstate", syncId);
    return () => {
      document.removeEventListener("astro:page-load", syncId);
      window.removeEventListener("popstate", syncId);
    };
  }, []);

  useEffect(() => {
    if (id === null) return;
    const controller = new AbortController();
    setArticle(undefined);
    setError(undefined);
    setLoading(true);
    void getArticleDetail(id, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setArticle(result);
        document.title = `${result.title} | AIMCC`;
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "文章加载失败，请稍后重试。",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, attempt]);

  if (loading)
    return (
      <p className="home-posts__empty" role="status">
        正在加载文章…
      </p>
    );
  if (error || !article) {
    return (
      <div className="article-feedback" role="alert">
        <div className="article-feedback__body">
          <h1>文章暂时无法加载</h1>
          <p>{error}</p>
          <a href="/#posts">← 返回文章列表</a>
        </div>
        <button
          className="article-feedback__retry"
          type="button"
          onClick={() => setAttempt((value) => value + 1)}
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <article className="post-article">
      <header className="post-article__hero">
        <div className="post-article__intro">
          <span className="eyebrow">研究札记</span>
          <h1>{article.title}</h1>
          {article.summary && <p>{article.summary}</p>}
          <a className="post-article__back" href="/#posts">
            ← 返回文章列表
          </a>
        </div>
        <figure className="post-article__visual">
          <img
            src={article.coverImage || "/images/ai-workflow-city.png"}
            alt=""
          />
        </figure>
      </header>
      <div className="post-article__lower">
        <div className="post-article__body">
          <div className="prose">
            <MarkdownReader source={article.content} />
          </div>
        </div>
        <aside className="post-article__meta" aria-label="文章信息">
          {article.readingMinutes != null && (
            <div className="post-article__read-time">
              阅读约 {article.readingMinutes} 分钟
            </div>
          )}
          <dl>
            {article.publishedAt && (
              <div>
                <dt>日期</dt>
                <dd>
                  <time dateTime={article.publishedAt}>
                    {article.publishedAt.slice(0, 10).replaceAll("-", "/")}
                  </time>
                </dd>
              </div>
            )}
            {article.viewCount != null && (
              <div>
                <dt>浏览</dt>
                <dd>{article.viewCount}</dd>
              </div>
            )}
          </dl>
          <a href="/archive/">
            继续探索 <span aria-hidden="true">→</span>
          </a>
        </aside>
      </div>
    </article>
  );
}
