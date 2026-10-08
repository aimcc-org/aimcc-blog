import { fetchArticleList } from "./article-list";
export type { ApiArticle, ApiArticlePage } from "./article-list";
const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

const apiBaseUrl =
  import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  DEFAULT_API_BASE_URL;

interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiStats {
  articleCount: number;
  yearsOfDev: number;
}

export interface ApiTag {
  id: number;
  name: string;
  articleCount: number;
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

export function getTagCloud() {
  return getApiData<ApiTag[]>("/tags");
}

/** Browser requests use a same-origin /api by default (proxied in local dev). */
export function getArticleList(page = 1, signal?: AbortSignal) {
  const base =
    import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
  return fetchArticleList(base, page, signal);
}
