import type { CSSProperties } from "react";
import type { ApiArticle } from "@/lib/api";
import { articleDetailHref } from "@/lib/article-detail";
import ArticleStats from "./ArticleStats";

export default function ApiArticleCard({
  article,
  index = 0,
}: {
  article: ApiArticle;
  index?: number;
}) {
  const tags = article.tags ?? [];
  const publishedAt = article.publishedAt;
  return (
    <article
      className="post-card"
      style={{ "--stagger-index": index } as CSSProperties}
    >
      <a className="post-card__link" href={articleDetailHref(article.id)}>
        <div className="post-card__cover">
          <img
            src={article.coverImage || "/images/ai-workflow-city.png"}
            alt=""
            loading="lazy"
          />
        </div>
        <div className="post-card__body">
          <h2>{article.title}</h2>
          <div className="post-card__meta">
            {publishedAt && (
              <time dateTime={publishedAt}>
                {publishedAt.slice(0, 10).replaceAll("-", "/")}
              </time>
            )}
            {tags.slice(0, 2).map((tag) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
            {tags.length > 2 && (
              <span aria-label={`另有 ${tags.length - 2} 个标签`}>
                +{tags.length - 2}
              </span>
            )}
          </div>
          {article.summary && <p>{article.summary}</p>}
          <div className="post-card__footer">
            <ArticleStats article={article} />
          </div>
        </div>
      </a>
    </article>
  );
}
