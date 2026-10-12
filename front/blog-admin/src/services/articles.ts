import {
  articlePayload,
  type ArticleTaxonomy,
  type TaxonomyOption,
} from "../utils/publishing.ts";
import type { Draft } from "../utils/drafts.ts";
import { adminRequest, requestEnvelope } from "./request.ts";
export async function fetchTaxonomyOptions(
  base: string,
  path: "/tags" | "/categorys",
  signal?: AbortSignal,
): Promise<TaxonomyOption[]> {
  const { response, result } = await requestEnvelope(`${base}${path}`, {
    signal,
  });
  if (
    !response.ok ||
    result?.code !== 200 ||
    !Array.isArray(result.data) ||
    !result.data.every(
      (item: TaxonomyOption | null) =>
        item &&
        Number.isSafeInteger(item.id) &&
        item.id > 0 &&
        typeof item.name === "string" &&
        item.name.trim(),
    ) ||
    new Set(result.data.map((item: TaxonomyOption) => item.id)).size !==
      result.data.length
  )
    throw new Error("分类或标签加载失败，请重试");
  return result.data;
}

export async function publishArticle(
  draft: Draft,
  taxonomy: ArticleTaxonomy,
  request: (
    path: string,
    body: ReturnType<typeof articlePayload>,
  ) => Promise<number>,
): Promise<number> {
  const id = await request("/articles", articlePayload(draft, taxonomy));
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new Error("发布响应缺少有效文章 ID，请先查看博客确认发布结果");
  return id;
}

export const articleService = {
  publish: (draft: Draft, taxonomy: ArticleTaxonomy) =>
    publishArticle(draft, taxonomy, adminRequest<number>),
  taxonomy: (signal?: AbortSignal) => {
    const base =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
    return Promise.all([
      fetchTaxonomyOptions(base, "/categorys", signal),
      fetchTaxonomyOptions(base, "/tags", signal),
    ]).then(([categories, tags]) => ({ categories, tags }));
  },
};
