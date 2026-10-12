import { validateDraft, type Draft } from "./admin-drafts.ts";

export interface TaxonomyOption {
  id: number;
  name: string;
}

export interface ArticleTaxonomy {
  categories: TaxonomyOption[];
  tags: TaxonomyOption[];
}

export async function fetchTaxonomyOptions(
  base: string,
  path: "/tags" | "/categorys",
  signal?: AbortSignal,
): Promise<TaxonomyOption[]> {
  const response = await fetch(`${base}${path}`, { signal });
  const result = await response.json();
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

// Older local drafts and Markdown imports contain names only.
export function draftTaxonomy(draft: Draft, taxonomy: ArticleTaxonomy) {
  const categoryId =
    draft.categoryId !== undefined
      ? draft.categoryId
      : (taxonomy.categories.find((item) => item.name === draft.category)?.id ??
        null);
  const names = draft.tags
    .split(/[,，]/)
    .map((name) => name.trim())
    .filter(Boolean);
  const tagIds =
    draft.tagIds ??
    taxonomy.tags
      .filter((item) => names.includes(item.name))
      .map((item) => item.id);
  return { categoryId, tagIds };
}

export function articlePayload(draft: Draft, taxonomy: ArticleTaxonomy) {
  const errors = validateDraft(draft);
  const { categoryId, tagIds } = draftTaxonomy(draft, taxonomy);
  if (draft.publishedArticleId)
    errors.push("这篇草稿已发布，请新建草稿发布另一篇文章");
  if (
    (draft.category && categoryId === null) ||
    (categoryId !== null &&
      !taxonomy.categories.some((item) => item.id === categoryId))
  )
    errors.push("请选择有效的分类，或选择未分类");
  const names = draft.tags
    .split(/[,，]/)
    .map((name) => name.trim())
    .filter(Boolean);
  if (
    (draft.tagIds === undefined &&
      names.some(
        (name) => !taxonomy.tags.some((item) => item.name === name),
      )) ||
    tagIds.some((id) => !taxonomy.tags.some((item) => item.id === id))
  )
    errors.push("部分标签已不可用，请重新选择标签");
  if (errors.length) throw new Error(errors.join("；"));
  return {
    title: draft.title.trim(),
    summary: draft.description.trim(),
    content: draft.content,
    coverImage: draft.cover.trim(),
    categoryId,
    tagIds: [...new Set(tagIds)],
    readingMinutes: Math.max(
      1,
      Math.ceil(draft.content.replace(/\s/g, "").length / 400),
    ),
    isTop: 0,
  };
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
