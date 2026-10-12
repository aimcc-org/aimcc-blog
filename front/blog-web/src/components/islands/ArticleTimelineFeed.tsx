import { useCallback, useEffect, useRef, useState } from "react";
import { ArticleTimeline } from "@aimcc/react-component";
import type { TimelineArticle } from "@aimcc/react-component";
import type { ApiArticle } from "@/lib/api";
import { getArticleListBatch } from "@/lib/api";
import ApiArticleCard from "./articles/ApiArticleCard";
import { articleDetailHref } from "@/lib/article-detail";

const NO_TAGS: number[] = [];

export default function ArticleTimelineFeed({
  tagIds = NO_TAGS,
  categoryId,
}: {
  tagIds?: number[];
  categoryId?: number;
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
  const articlesById = new Map(
    articles.map((article) => [article.id, article]),
  );
  return (
    <ArticleTimeline
      articles={timelineArticles}
      articleListClassName="article-card-list"
      renderArticle={(entry) => {
        const article = articlesById.get(Number(entry.id));
        return article ? <ApiArticleCard article={article} /> : null;
      }}
      loading={loading}
      error={error}
      hasMore={hasMore}
      onLoadMore={() => void loadNextPage()}
      onRetry={() => void loadNextPage()}
    />
  );
}
