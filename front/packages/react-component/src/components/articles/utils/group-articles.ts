import type { TimelineArticle } from "../components/ArticleTimeline.js";

/** Offset-free dates represent civil dates; zoned instants use the requested timezone. */
export function groupArticlesByDay(
  articles: TimelineArticle[],
  timeZone = "Asia/Shanghai",
) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const days = new Map<string, TimelineArticle[]>();
  const seen = new Set<string>();
  const timestamp = (value: string) =>
    Date.parse(
      /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
        ? value
        : `${value.length === 10 ? `${value}T00:00:00` : value}+08:00`,
    );
  const sorted = [...articles].sort(
    (a, b) => timestamp(b.publishedAt) - timestamp(a.publishedAt),
  );
  for (const article of sorted) {
    if (!Number.isFinite(timestamp(article.publishedAt))) continue;
    const key = String(article.id);
    if (seen.has(key)) continue;
    const civil =
      /^(\d{4}-\d{2}-\d{2})(?:$|T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$)/.exec(
        article.publishedAt,
      );
    const date = new Date(
      civil ? `${civil[1]}T00:00:00Z` : article.publishedAt,
    );
    if (Number.isNaN(date.getTime())) continue;
    const parts = formatter.formatToParts(date);
    const day = civil
      ? civil[1]
      : ["year", "month", "day"]
          .map((type) => parts.find((part) => part.type === type)?.value)
          .join("-");
    if (civil && date.toISOString().slice(0, 10) !== day) continue;
    seen.add(key);
    const group = days.get(day) ?? [];
    group.push(article);
    days.set(day, group);
  }
  return [...days]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, articles: items }));
}
