import { useCallback, useEffect, useRef, useState } from "react";
import { getArticleList } from "@/lib/api";
import type { ApiArticlePage } from "@/lib/api";
import { readCategoryId } from "@/lib/tag-filter";

export function useFeaturedArticles() {
  const [categoryId, setCategoryId] = useState<number>();
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState<ApiArticlePage>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  const requestedPage = useRef(1);

  useEffect(() => {
    const syncCategory = () => {
      setCategoryId(readCategoryId(window.location.search));
      setReady(true);
    };
    syncCategory();
    document.addEventListener("astro:page-load", syncCategory);
    window.addEventListener("popstate", syncCategory);
    window.addEventListener("aimcc:tag-filter-change", syncCategory);
    return () => {
      document.removeEventListener("astro:page-load", syncCategory);
      window.removeEventListener("popstate", syncCategory);
      window.removeEventListener("aimcc:tag-filter-change", syncCategory);
    };
  }, []);

  const loadPage = useCallback(
    async (number: number) => {
      if (!ready || request.current || number < 1) return;
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
          categoryId,
          undefined,
          6,
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
    },
    [categoryId, ready],
  );

  useEffect(() => {
    if (!ready) return;
    setPage(undefined);
    void loadPage(1);
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [loadPage, ready]);

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
