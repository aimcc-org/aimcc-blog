import { Fragment } from "react";
import type { CSSProperties } from "react";
import type { ApiArticle } from "@/lib/api";
import { articleDetailHref } from "@/lib/article-detail";

export default function ApiArticleCards({
  articles,
}: {
  articles: ApiArticle[];
}) {
  return (
    <div className="home-posts__list">
      {articles.map((article, index) => {
        const tags = article.tags ?? [];
        const publishedAt = article.publishedAt;
        return (
          <Fragment key={article.id}>
            {index === 1 && (
              <h2 className="home-posts__section-title">最近文章</h2>
            )}
            <article
              className="post-card"
              style={{ "--stagger-index": index } as CSSProperties}
            >
              <a
                className={`post-card__link${index === 0 ? " is-featured" : ""}`}
                href={articleDetailHref(article.id)}
              >
                <div className="post-card__cover">
                  <img
                    src={article.coverImage || "/images/ai-workflow-city.png"}
                    alt=""
                    loading={index === 0 ? "eager" : "lazy"}
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
                    <span>
                      {article.readingMinutes !== null &&
                      article.readingMinutes !== undefined
                        ? `阅读约 ${article.readingMinutes} 分钟`
                        : ""}
                    </span>
                  </div>
                </div>
              </a>
            </article>
          </Fragment>
        );
      })}
    </div>
  );
}
