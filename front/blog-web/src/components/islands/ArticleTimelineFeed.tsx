import { useCallback, useEffect, useRef, useState } from "react";
import { ArticleTimeline } from "@aimcc/react-component";
import type { TimelineArticle } from "@aimcc/react-component";
import ApiArticleCards from "./ApiArticleCards";
import type { ApiArticle } from "@/lib/api";
import { getArticleListBatch } from "@/lib/api";
import { articleDetailHref } from "@/lib/article-detail";

const NO_TAGS: number[] = [];

export default function ArticleTimelineFeed({
  tagIds = NO_TAGS,
  variant = "timeline",
  categoryId,
}: {
  tagIds?: number[];
  categoryId?: number;
  variant?: "timeline" | "cards";
}) {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [hasMore, setHasMore] = useState(false);
  const nextPage = useRef(1);
  const request = useRef<AbortController | null>(null);

  const loadNextPage = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(undefined);
    try {
      const page = await getArticleListBatch(
        nextPage.current,
        controller.signal,
        tagIds,
        categoryId,
      );
      if (controller.signal.aborted) return;
      const records = page.records;
      setArticles((previous) =>
        [
          ...new Map(
            [...previous, ...records].map((article) => [article.id, article]),
          ).values(),
        ].sort((a, b) =>
          (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
        ),
      );
      nextPage.current += 1;
      setHasMore(page.hasMore);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error && cause.message.startsWith("分类筛选")
            ? cause.message
            : "文章加载失败，请检查网络或稍后重试。",
        );
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }, [tagIds, categoryId]);

  useEffect(() => {
    nextPage.current = 1;
    setArticles([]);
    setHasMore(false);
    void loadNextPage();
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [loadNextPage]);

  if (variant === "cards") {
    return (
      <section aria-label="文章卡片列表" aria-busy={loading}>
        <ApiArticleCards articles={articles} />
        {loading && (
          <p className="home-posts__empty" role="status">
            正在加载文章…
          </p>
        )}
        {error && (
          <div className="article-feedback" role="alert">
            <span className="article-feedback__icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6" strokeLinecap="round" />
                <circle
                  cx="12"
                  cy="17"
                  r=".8"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </span>
            <div className="article-feedback__body">
              <h2>文章暂时无法加载</h2>
              <p>{error}</p>
            </div>
            <button
              className="article-feedback__retry"
              type="button"
              onClick={() => void loadNextPage()}
              disabled={loading}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 17.9 17"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              重新加载
            </button>
          </div>
        )}
        {!loading && !error && articles.length === 0 && (
          <p className="home-posts__empty">当前筛选条件下暂无文章。</p>
        )}
        {!error && hasMore && (
          <button
            type="button"
            className="article-timeline__more"
            onClick={() => void loadNextPage()}
            disabled={loading}
          >
            {loading ? "加载中…" : "加载更多"}
          </button>
        )}
      </section>
    );
  }
  const timelineArticles = articles.flatMap((article): TimelineArticle[] =>
    article.publishedAt
      ? [
          {
            id: article.id,
            href: articleDetailHref(article.id),
            title: article.title,
            publishedAt: /(?:Z|[+-]\d{2}:?\d{2})$/.test(article.publishedAt)
              ? article.publishedAt
              : `${article.publishedAt}+08:00`,
            summary: article.summary ?? undefined,
            tags: article.tags?.map((tag) => tag.name) ?? [],
            readingMinutes: article.readingMinutes ?? undefined,
          },
        ]
      : [],
  );
  return (
    <ArticleTimeline
      articles={timelineArticles}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onLoadMore={() => void loadNextPage()}
      onRetry={() => void loadNextPage()}
    />
  );
}
