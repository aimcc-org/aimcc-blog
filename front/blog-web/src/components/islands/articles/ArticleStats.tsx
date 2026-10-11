import type { ApiArticle } from "@/lib/api";

const formatCount = (count: number) =>
  count >= 1000
    ? `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : String(count);

export default function ArticleStats({ article }: { article: ApiArticle }) {
  return (
    <div className="article-stats">
      <span
        aria-label={
          article.readingMinutes == null
            ? "阅读时间暂无数据"
            : `阅读约 ${article.readingMinutes} 分钟`
        }
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        {article.readingMinutes == null
          ? "— 分钟"
          : `${article.readingMinutes} 分钟`}
      </span>
      <span
        aria-label={
          article.viewCount == null
            ? "阅读量暂无数据"
            : `${article.viewCount} 次阅读`
        }
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {article.viewCount == null ? "—" : formatCount(article.viewCount)}
      </span>
    </div>
  );
}
