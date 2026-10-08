export interface ApiArticle {
  id: number;
  title: string;
  summary: string | null;
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
): Promise<ApiArticlePage> {
  const query = new URLSearchParams({
    page: String(page),
    size: "20",
    sort: "new",
  });
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
