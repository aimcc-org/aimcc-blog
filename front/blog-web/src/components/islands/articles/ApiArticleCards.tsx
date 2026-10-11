import type { ApiArticle } from "@/lib/api";
import ApiArticleCard from "./ApiArticleCard";

export default function ApiArticleCards({
  articles,
}: {
  articles: ApiArticle[];
}) {
  return (
    <div className="home-posts__list">
      {articles.map((article, index) => (
        <ApiArticleCard key={article.id} article={article} index={index} />
      ))}
    </div>
  );
}
