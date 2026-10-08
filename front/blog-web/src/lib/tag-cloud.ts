export interface ApiTag {
  id: number;
  name: string;
  articleCount: number;
}

/** Unavailable or malformed tags leave the profile's tag section empty. */
export async function fetchTagCloud(
  base: string,
  signal?: AbortSignal,
): Promise<ApiTag[]> {
  try {
    const response = await fetch(`${base}/tags`, { signal });
    if (!response.ok) return [];
    const result = await response.json();
    if (
      result?.code !== 200 ||
      !Array.isArray(result.data) ||
      !result.data.every(
        (tag: ApiTag | null) =>
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
