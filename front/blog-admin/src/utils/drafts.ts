import type { Draft, DraftStore } from "../types/draft.ts";
export type { Draft, DraftStore } from "../types/draft.ts";
function createDraftId(): string {
  // randomUUID is limited to secure contexts; HTTP LAN development still
  // exposes getRandomValues. Keep draft creation working there too.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createDraft(fields: Partial<Draft> = {}): Draft {
  return {
    title: "",
    description: "",
    content: "",
    category: "",
    tags: "",
    slug: "",
    cover: "",
    ...fields,
    id: createDraftId(),
    updatedAt: new Date().toISOString(),
  };
}

export function readDraftStore(
  saved: string | null,
  legacy: string | null,
): DraftStore {
  if (saved) {
    const value = JSON.parse(saved);
    if (
      value.version !== 1 ||
      !Array.isArray(value.drafts) ||
      typeof value.activeId !== "string"
    )
      throw new Error("草稿格式不正确");
    const ids = new Set<string>();
    for (const draft of value.drafts) {
      if (
        !draft ||
        ![
          "id",
          "title",
          "description",
          "content",
          "category",
          "tags",
          "slug",
          "cover",
          "updatedAt",
        ].every((key) => typeof draft[key] === "string") ||
        (draft.deletedAt !== undefined &&
          typeof draft.deletedAt !== "string") ||
        (draft.categoryId !== undefined &&
          draft.categoryId !== null &&
          (!Number.isSafeInteger(draft.categoryId) || draft.categoryId <= 0)) ||
        (draft.tagIds !== undefined &&
          (!Array.isArray(draft.tagIds) ||
            !draft.tagIds.every(
              (id: number) => Number.isSafeInteger(id) && id > 0,
            ))) ||
        (draft.publishedArticleId !== undefined &&
          (!Number.isSafeInteger(draft.publishedArticleId) ||
            draft.publishedArticleId <= 0)) ||
        ids.has(draft.id)
      )
        throw new Error("草稿格式不正确");
      ids.add(draft.id);
    }
    if (
      !value.drafts.some(
        (draft: Draft) => draft.id === value.activeId && !draft.deletedAt,
      )
    ) {
      const existing =
        value.drafts.find((draft: Draft) => !draft.deletedAt) ?? createDraft();
      if (!ids.has(existing.id)) value.drafts.push(existing);
      value.activeId = existing.id;
    }
    return value;
  }
  let fields: Partial<Draft> = {};
  if (legacy) {
    const value = JSON.parse(legacy);
    if (
      !["title", "description", "content"].every(
        (key) => typeof value[key] === "string",
      )
    )
      throw new Error("旧草稿格式不正确");
    fields = {
      title: value.title,
      description: value.description,
      content: value.content,
    };
  }
  const draft = createDraft(fields);
  return { version: 1, activeId: draft.id, drafts: [draft] };
}

export function isSafeCover(value: string): boolean {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validateDraft(draft: Draft): string[] {
  const errors: string[] = [];
  if (!draft.title.trim()) errors.push("请填写文章标题");
  if (!draft.content.trim()) errors.push("请填写文章正文");
  if (draft.title.length > 200) errors.push("标题不能超过 200 个字符");
  if (draft.description.length > 500) errors.push("摘要不能超过 500 个字符");
  if (draft.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug))
    errors.push("文章链接只能使用小写字母、数字和连字符，例如 first-post");
  if (!isSafeCover(draft.cover))
    errors.push("封面地址须为完整的 http 或 https 图片链接");
  return errors;
}
