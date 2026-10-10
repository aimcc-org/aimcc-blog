export interface ApiArticleDetail {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  coverImage?: string | null;
  publishedAt: string | null;
  readingMinutes: number | null;
  viewCount?: number | null;
  categoryId?: number | null;
}

export function articleDetailHref(id: number) {
  return `/article/?id=${encodeURIComponent(String(id))}`;
}

export async function fetchArticleDetail(
  base: string,
  id: string,
  signal?: AbortSignal,
): Promise<ApiArticleDetail> {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    throw new Error("文章链接无效");
  }
  const response = await fetch(`${base}/articles/${id}`, { signal });
  if (response.status === 404) throw new Error("文章不存在或已下线");
  if (!response.ok) throw new Error("文章加载失败，请稍后重试。");
  const result = await response.json();
  if (result.code === 404) throw new Error("文章不存在或已下线");
  if (result.code !== 200) throw new Error("文章加载失败，请稍后重试。");
  const article = result.data;
  if (
    !article ||
    article.id !== Number(id) ||
    typeof article.title !== "string" ||
    typeof article.content !== "string"
  ) {
    throw new Error("文章接口返回无效数据");
  }
  return article;
}
