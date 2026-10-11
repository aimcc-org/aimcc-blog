import { useCallback, useEffect, useRef, useState } from "react";
import { getArticleList } from "@/lib/api";
import type { ApiArticlePage } from "@/lib/api";

export function useFeaturedArticles() {
  const [page, setPage] = useState<ApiArticlePage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const requestedPage = useRef(1);

  const loadPage = useCallback(async (number: number) => {
    if (request.current || number < 1) return;
    const controller = new AbortController();
    request.current = controller;
    requestedPage.current = number;
    setLoading(true);
    setError(false);
    try {
      const result = await getArticleList(
        number,
        controller.signal,
        undefined,
        undefined,
        undefined,
        5,
        "RECOMMEND",
      );
      if (!controller.signal.aborted) setPage(result);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadPage(1);
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [loadPage]);

  return {
    page,
    loading,
    error,
    loadPage,
    retry: () => loadPage(requestedPage.current),
    hasNext: !!page && page.current * page.size < page.total,
    hasPrevious: !!page && page.current > 1,
  };
}
