import type { Draft } from "@/types/draft";
export function filterDrafts(
  drafts: Draft[],
  query: string,
  category: string,
  sort: string,
): Draft[] {
  return drafts
    .filter(
      (item) =>
        (!category || item.category.trim() === category) &&
        `${item.title} ${item.description} ${item.tags}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "zh-CN")
        : b.updatedAt.localeCompare(a.updatedAt),
    );
}
