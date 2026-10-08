import { fetchTagCloud } from "./tag-cloud";
export type { ApiTag } from "./tag-cloud";

const DEFAULT_API_BASE_URL = "http://47.96.92.202:8080/api";

const apiBaseUrl =
  import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  (typeof window === "undefined" ? DEFAULT_API_BASE_URL : "/api");

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiStats {
  articleCount: number;
  yearsOfDev: number;
}

async function getApiData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`);
    if (!response.ok) return null;

    const result = (await response.json()) as ApiResult<T>;
    if (result.code !== 200) return null;

    return result.data;
  } catch {
    return null;
  }
}

export function getSiteStats() {
  return getApiData<ApiStats>("/stats");
}

export function getTagCloud(signal?: AbortSignal) {
  return fetchTagCloud(apiBaseUrl, signal);
}

import { fetchArticleList, fetchArticleListBatch } from "./article-list";
export function getArticleList(page = 1, signal?: AbortSignal, tagId?: number) {
  const base =
    import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
  return fetchArticleList(base, page, signal, tagId);
}
export function getArticleListBatch(
  page = 1,
  signal?: AbortSignal,
  tagIds: number[] = [],
) {
  const base =
    import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
  return fetchArticleListBatch(base, page, signal, tagIds);
}
export type { ApiArticle, ApiArticlePage } from "./article-list";
