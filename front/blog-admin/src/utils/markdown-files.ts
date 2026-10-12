import { createDraft } from "./drafts.ts";
import type { Draft } from "../types/draft.ts";
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

export async function readMarkdownFile(file: File): Promise<Draft> {
  if (!/\.(md|markdown)$/i.test(file.name))
    throw new Error("请选择 .md 或 .markdown 文件");
  if (file.size > 2 * 1024 * 1024)
    throw new Error("文件超过 2 MB，请缩小后导入");
  return importMarkdown(await file.text(), file.name);
}
export function downloadMarkdown(draft: Draft): void {
  const content = exportMarkdown(draft);
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${draft.title.trim().replace(/[\\/:*?"<>|]/g, "-") || "未命名文章"}.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
