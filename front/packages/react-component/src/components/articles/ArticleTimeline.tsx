import { useId } from "react";

export interface TimelineArticle {
  id: string | number;
  title: string;
  publishedAt: string;
  summary?: string;
  tags?: string[];
  readingMinutes?: number;
  href?: string;
}
export interface ArticleTimelineProps {
  articles: TimelineArticle[];
  title?: string;
  timeZone?: string;
  loading?: boolean;
  error?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
}

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

export function ArticleTimeline({
  articles,
  title = "文章时间线",
  timeZone = "Asia/Shanghai",
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  onRetry,
}: ArticleTimelineProps) {
  const titleId = useId();
  const groups = groupArticlesByDay(articles, timeZone);
  return (
    <section
      className="article-timeline"
      aria-labelledby={titleId}
      aria-busy={loading}
    >
      <header className="article-timeline__header">
        <h2 id={titleId}>{title}</h2>
        <span>
          {groups.reduce((total, group) => total + group.articles.length, 0)}{" "}
          篇文章 · {groups.length} 天
        </span>
      </header>
      <ol className="article-timeline__days">
        {groups.map((group) => (
          <li className="article-timeline__day" key={group.date}>
            <div className="article-timeline__date">
              <time dateTime={group.date}>
                {group.date.replaceAll("-", ".")}
              </time>
              <span>{group.articles.length} 篇</span>
            </div>
            <ul className="article-timeline__articles">
              {group.articles.map((article) => (
                <li key={article.id}>
                  <article className="article-timeline__article">
                    <h3>
                      {article.href ? (
                        <a href={article.href}>
                          {article.title}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ) : (
                        article.title
                      )}
                    </h3>
                    {article.summary && <p>{article.summary}</p>}
                    {((article.tags?.length ?? 0) > 0 ||
                      article.readingMinutes !== undefined) && (
                      <div className="article-timeline__meta">
                        {article.tags?.map((tag, index) => (
                          <span key={`${tag}-${index}`}>#{tag}</span>
                        ))}
                        {article.readingMinutes !== undefined && (
                          <span>{article.readingMinutes} 分钟阅读</span>
                        )}
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {loading && (
        <p className="article-timeline__message" role="status">
          正在加载文章…
        </p>
      )}
      {error && (
        <div className="article-timeline__error" role="alert">
          <p>{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} disabled={loading}>
              重试
            </button>
          )}
        </div>
      )}
      {!loading && !error && groups.length === 0 && (
        <p className="article-timeline__message">暂无文章</p>
      )}
      {!error && hasMore && onLoadMore && (
        <button
          className="article-timeline__more"
          type="button"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? "加载中…" : "加载更多"}
        </button>
      )}
    </section>
  );
}
