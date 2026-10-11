import type { ApiArticle } from "@/lib/api";

export default function ArticleMetadata({ article }: { article: ApiArticle }) {
  const tags = article.tags ?? [];
  return (
    <div className="article-metadata">
      {article.publishedAt && (
        <time dateTime={article.publishedAt}>
          {article.publishedAt.slice(0, 10).replaceAll("-", "/")}
        </time>
      )}
      {tags.slice(0, 3).map((tag) => (
        <span key={tag.id}>#{tag.name}</span>
      ))}
      {tags.length > 3 && (
        <span aria-label={`另有 ${tags.length - 3} 个标签`}>
          +{tags.length - 3}
        </span>
      )}
    </div>
  );
}
