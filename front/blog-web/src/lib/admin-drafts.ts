export interface Draft {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string;
  slug: string;
  cover: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DraftStore {
  version: 1;
  activeId: string;
  drafts: Draft[];
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
    id: crypto.randomUUID(),
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

export function exportMarkdown(draft: Draft): string {
  const metadata = {
    title: draft.title,
    description: draft.description,
    category: draft.category,
    tags: draft.tags
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    slug: draft.slug,
    cover: draft.cover,
  };
  // JSON 也是合法 YAML；导入时可无损恢复本应用导出的文章信息。
  return `---\n${JSON.stringify(metadata, null, 2)}\n---\n\n${draft.content}`;
}

export function importMarkdown(source: string, filename: string): Draft {
  let content = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const frontmatter = content.match(/^---\n(\{[\s\S]*?\})\n---(?:\n|$)/);
  if (frontmatter) {
    try {
      const data = JSON.parse(frontmatter[1]);
      const fields: Partial<Draft> = {};
      for (const key of [
        "title",
        "description",
        "category",
        "slug",
        "cover",
      ] as const) {
        if (typeof data[key] === "string") fields[key] = data[key];
      }
      if (
        Array.isArray(data.tags) &&
        data.tags.every((tag: unknown) => typeof tag === "string")
      )
        fields.tags = data.tags.join(", ");
      return createDraft({
        ...fields,
        content: content.slice(frontmatter[0].length).replace(/^\n/, ""),
      });
    } catch {
      /* 未识别的 frontmatter 保留在正文，不丢弃原文。 */
    }
  }
  const heading = content.match(/^#\s+(.+)(?:\n|$)/);
  const title = heading
    ? heading[1].trim()
    : filename.replace(/\.(md|markdown)$/i, "");
  if (heading) content = content.slice(heading[0].length).replace(/^\n/, "");
  return createDraft({ title, content });
}
