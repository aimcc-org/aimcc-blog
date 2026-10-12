import { Badge, PostCard } from "@aimcc/react-component";
import type { ApiArticle } from "@/lib/api";
import { articleDetailHref } from "@/lib/article-detail";
import "./styles/article-card-list.less";
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
    <PostCard
      href={articleDetailHref(article.id)}
      index={index}
      post={{
        title: article.title,
        description: article.summary ?? undefined,
        publishedAt: publishedAt ?? undefined,
        cover: article.coverImage || "/images/ai-workflow-city.png",
        tags: tags.map((tag) => tag.name),
      }}
      showCoverArrow={false}
      metadata={
        <>
          {tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              variant={tags[0]?.id === tag.id ? "default" : "secondary"}
            >
              {tag.name}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge
              variant="ghost"
              aria-label={`另有 ${tags.length - 2} 个标签`}
            >
              +{tags.length - 2}
            </Badge>
          )}
        </>
      }
      footer={<ArticleStats article={article} showDate />}
    />
  );
}
