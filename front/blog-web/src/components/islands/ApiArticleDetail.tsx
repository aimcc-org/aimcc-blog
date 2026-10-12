import "./styles/api-article-detail.less";
import { Button } from "@aimcc/react-component";
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
        <Button
          variant="ghost"
          className="article-feedback__retry"
          type="button"
          onClick={() => setAttempt((value) => value + 1)}
        >
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <article className="post-article">
      <header className="article-detail__header">
        <Button asChild variant="ghost" className="article-detail__back">
          <a href="/#posts" aria-label="返回文章列表">
            ← 返回
          </a>
        </Button>
        <div className="article-detail__heading">
          <h1 title={article.title}>{article.title}</h1>
          <div className="article-detail__metadata" aria-label="文章信息">
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {article.publishedAt.slice(0, 10).replaceAll("-", "/")}
              </time>
            )}
            {article.readingMinutes != null && (
              <span>阅读约 {article.readingMinutes} 分钟</span>
            )}
            {article.viewCount != null && (
              <span>{article.viewCount.toLocaleString("zh-CN")} 次浏览</span>
            )}
          </div>
        </div>
      </header>
      <div className="post-article__lower">
        <div className="post-article__body">
          {article.summary && (
            <p className="article-detail__summary">{article.summary}</p>
          )}
          <MarkdownReader source={article.content} />
          <footer className="article-detail__footer">
            <Button asChild variant="ghost">
              <a href="/archive/">继续阅读其他文章 →</a>
            </Button>
          </footer>
        </div>
      </div>
    </article>
  );
}
