export interface ApiCategory {
  id: number;
  name: string;
  articleCount: number;
}

/** Unavailable or malformed categories leave the category list empty. */
export async function fetchCategories(
  base: string,
  signal?: AbortSignal,
): Promise<ApiCategory[]> {
  try {
    const response = await fetch(`${base}/categorys`, { signal });
    if (!response.ok) return [];
    const result = await response.json();
    if (
      result?.code !== 200 ||
      !Array.isArray(result.data) ||
      !result.data.every(
        (tag: ApiCategory | null) =>
          tag !== null &&
          Number.isInteger(tag.id) &&
          typeof tag.name === "string" &&
          Number.isInteger(tag.articleCount) &&
          tag.articleCount >= 0,
      )
    )
      return [];
    return result.data;
  } catch {
    return [];
  }
}
