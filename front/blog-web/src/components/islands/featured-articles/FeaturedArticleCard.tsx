import type { ApiArticle } from "@/lib/api";
import { articleDetailHref } from "@/lib/article-detail";
import ArticleMetadata from "../articles/ArticleMetadata";
import ArticleStats from "../articles/ArticleStats";

export default function FeaturedArticleCard({
  article,
  lead = false,
}: {
  article: ApiArticle;
  lead?: boolean;
}) {
  return (
    <article className={`featured-card${lead ? " featured-card--lead" : ""}`}>
      <a className="featured-card__link" href={articleDetailHref(article.id)}>
        <div className="featured-card__cover">
          <img
            src={article.coverImage || "/images/ai-workflow-city.png"}
            alt=""
            loading={lead ? "eager" : "lazy"}
          />
          {lead && article.isTop === 1 && (
            <span className="featured-card__badge">置顶</span>
          )}
        </div>
        <div className="featured-card__body">
          <h3>{article.title}</h3>
          {lead && article.summary && <p>{article.summary}</p>}
          <div className="featured-card__footer">
            <ArticleMetadata article={article} />
            <ArticleStats article={article} />
          </div>
        </div>
      </a>
    </article>
  );
}
