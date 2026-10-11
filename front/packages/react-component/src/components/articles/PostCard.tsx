import type { CSSProperties } from "react";

export interface PostCardPost {
  title: string;
  description?: string;
  publishedAt: string;
  cover?: string;
  category?: string;
  tags: string[];
  wordCount?: number;
  readingTime?: number;
}

export interface PostCardProps {
  post: PostCardPost;
  href: string;
  index?: number;
  locale?: string;
}

export function PostCard({
  post,
  href,
  index = 0,
  locale = "zh-CN",
}: PostCardProps) {
  const date = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(post.publishedAt));
  const stats = [
    post.wordCount ? `${post.wordCount.toLocaleString(locale)} words` : null,
    post.readingTime ? `${post.readingTime} min` : null,
  ]
    .filter(Boolean)
    .join(" | ");
  return (
    <article
      className="post-card"
      style={{ "--stagger-index": index } as CSSProperties}
      data-tags={post.tags.join("|")}
    >
      <a
        className={`post-card__link${post.cover ? " has-cover" : ""}`}
        href={href}
      >
        {post.cover && (
          <div className="post-card__cover">
            <img src={post.cover} alt="" loading="lazy" />
            <span aria-hidden="true">›</span>
          </div>
        )}
        <div className="post-card__body">
          <h2>{post.title}</h2>
          <div className="post-card__meta">
            <time dateTime={post.publishedAt}>{date}</time>
            {post.category && <span>{post.category}</span>}
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          {post.description && <p>{post.description}</p>}
          <div className="post-card__footer">
            <span>{stats}</span>
            {!post.cover && (
              <span className="post-card__arrow" aria-hidden="true">
                ›
              </span>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}
