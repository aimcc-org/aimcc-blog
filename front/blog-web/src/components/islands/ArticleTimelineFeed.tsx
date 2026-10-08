import { useCallback, useEffect, useRef, useState } from "react";
import { ArticleTimeline } from "@aimcc/react-component";
import type { TimelineArticle } from "@aimcc/react-component";
import { getArticleList } from "@/lib/api";

export default function ArticleTimelineFeed() {
  const [articles, setArticles] = useState<TimelineArticle[]>([]);
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
      const page = await getArticleList(nextPage.current, controller.signal);
      if (controller.signal.aborted) return;
      const records = page.records.flatMap((article): TimelineArticle[] =>
        article.publishedAt
          ? [
              {
                id: article.id,
                title: article.title,
                // Backend LocalDateTime values are Beijing civil time, per its datasource config.
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
      setArticles((previous) => [
        ...new Map(
          [...previous, ...records].map((article) => [article.id, article]),
        ).values(),
      ]);
      nextPage.current = page.current + 1;
      setHasMore(
        page.records.length > 0 && page.current * page.size < page.total,
      );
    } catch {
      if (!controller.signal.aborted)
        setError("文章加载失败，请检查网络或稍后重试。");
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNextPage();
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [loadNextPage]);

  return (
    <ArticleTimeline
      articles={articles}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onLoadMore={() => void loadNextPage()}
      onRetry={() => void loadNextPage()}
    />
  );
}
