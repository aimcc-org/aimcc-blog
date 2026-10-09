export interface ApiArticle {
  id: number;
  title: string;
  categoryId?: number | null;
  summary: string | null;
  coverImage?: string | null;
  publishedAt: string | null;
  readingMinutes: number | null;
  tags: { id: number; name: string }[];
}

export interface ApiArticlePage {
  records: ApiArticle[];
  total: number;
  current: number;
  size: number;
}

/** Validate the server pagination envelope before advancing to the next page. */
export async function fetchArticleList(
  base: string,
  page = 1,
  signal?: AbortSignal,
  tagId?: number,
  categoryId?: number,
): Promise<ApiArticlePage> {
  const query = new URLSearchParams({
    page: String(page),
    size: "20",
    sort: "new",
  });
  if (tagId !== undefined) query.set("tagId", String(tagId));
  if (categoryId !== undefined) query.set("categoryId", String(categoryId));
  const response = await fetch(`${base}/articles?${query}`, { signal });
  if (!response.ok) throw new Error(`文章接口返回 ${response.status}`);
  const result = (await response.json()) as {
    code: number;
    data: ApiArticlePage;
  };
  if (
    result.code !== 200 ||
    !result.data ||
    !Array.isArray(result.data.records) ||
    !Number.isInteger(result.data.current) ||
    result.data.current !== page ||
    !Number.isInteger(result.data.size) ||
    result.data.size < 1 ||
    !Number.isInteger(result.data.total) ||
    result.data.total < 0
  ) {
    throw new Error("文章接口返回无效数据");
  }
  return result.data;
}

/** The backend accepts one tagId per request; combine selected tags as a union. */
export async function fetchArticleListBatch(
  base: string,
  page = 1,
  signal?: AbortSignal,
  tagIds: number[] = [],
  categoryId?: number,
): Promise<{ records: ApiArticle[]; hasMore: boolean }> {
  const filters = tagIds.length ? [...new Set(tagIds)] : [undefined];
  const pages = await Promise.all(
    filters.map((tagId) =>
      fetchArticleList(base, page, signal, tagId, categoryId),
    ),
  );
  return {
    records: [
      ...new Map(
        pages
          .flatMap((result) => result.records)
          .map((article) => [article.id, article]),
      ).values(),
    ],
    hasMore: pages.some(
      (result) =>
        result.records.length > 0 &&
        result.current * result.size < result.total,
    ),
  };
}
