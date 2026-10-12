import { validateDraft, type Draft } from "./drafts.ts";

import type { ArticleTaxonomy } from "../types/article.ts";
export type { ArticleTaxonomy, TaxonomyOption } from "../types/article.ts";
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
