import type { SiteContentEntry } from "@/content/posts";
import type { parseContentId } from "@/content/posts";

export interface PostSummary {
  slug: string;
  title: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  cover?: string;
  category?: string;
  tags: string[];
  wordCount?: number;
  readingTime?: number;
}

type ProfilePost = {
  entry: SiteContentEntry;
  meta: NonNullable<ReturnType<typeof parseContentId>>;
};

function countWords(text: string) {
  const latinWords =
    text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjkChars = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  return latinWords + cjkChars;
}

function getCover(entry: SiteContentEntry) {
  const image = entry.data.image as { src?: string } | undefined;
  return image?.src;
}

export function toPostSummary({ entry, meta }: ProfilePost): PostSummary {
  const wordCount = countWords(entry.body ?? "");

  return {
    slug: meta.slug,
    title: entry.data.title,
    description: entry.data.description,
    publishedAt: entry.data.published.toISOString(),
    updatedAt: entry.data.updated?.toISOString(),
    cover: getCover(entry),
    category: entry.data.category,
    tags: entry.data.tags,
    wordCount,
    readingTime: Math.max(1, Math.ceil(wordCount / 300)),
  };
}
