import type { CSSProperties, ReactNode } from "react";
import { Badge } from "../../ui/badge/components/badge.js";

export interface PostCardPost {
  title: string;
  description?: string;
  publishedAt?: string;
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
  /** Host metadata and statistics without duplicating the card layout. */
  metadata?: ReactNode;
  footer?: ReactNode;
  showCoverArrow?: boolean;
  layout?: "stacked" | "horizontal";
  /** Independent interactive action, rendered outside the navigation link. */
  action?: ReactNode;
}

export function PostCard({
  post,
  href,
  index = 0,
  locale = "zh-CN",
  metadata,
  footer,
  showCoverArrow = false,
  layout = "stacked",
  action,
}: PostCardProps) {
  const date =
    metadata === undefined && post.publishedAt
      ? new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "UTC",
        }).format(new Date(post.publishedAt))
      : null;
  const stats = [
    post.wordCount ? `${post.wordCount.toLocaleString(locale)} words` : null,
    post.readingTime ? `${post.readingTime} min` : null,
  ]
    .filter(Boolean)
    .join(" | ");
  return (
    <article
      className={`post-card post-card--${layout}${action ? " post-card--with-action" : ""}`}
      style={{ "--stagger-index": index } as CSSProperties}
      data-tags={post.tags.join("|")}
    >
      <a
        className={`post-card__link ${post.cover ? " has-cover" : ""}`}
        href={href}
      >
        {post.cover && (
          <div className="post-card__cover">
            <img src={post.cover} alt="" loading="lazy" />
            {showCoverArrow && <span aria-hidden="true">›</span>}
          </div>
        )}
        <div className="post-card__body">
          <div className="post-card__meta">
            {metadata !== undefined ? (
              metadata
            ) : (
              <>
                {post.category && <Badge>{post.category}</Badge>}
                {post.tags.slice(0, 1).map((tag) => (
                  <Badge variant="secondary" key={tag}>
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 1 && (
                  <Badge
                    variant="ghost"
                    aria-label={`另有 ${post.tags.length - 1} 个标签`}
                  >
                    +{post.tags.length - 1}
                  </Badge>
                )}
              </>
            )}
          </div>
          <h2>{post.title}</h2>
          {post.description && <p>{post.description}</p>}
          <div className="post-card__footer">
            {footer !== undefined ? (
              footer
            ) : (
              <span>
                {date && <time dateTime={post.publishedAt}>{date}</time>}
                {date && stats ? " · " : ""}
                {stats}
              </span>
            )}
            {!post.cover && (
              <span className="post-card__arrow" aria-hidden="true">
                ›
              </span>
            )}
          </div>
        </div>
      </a>
      {action && <div className="post-card__action">{action}</div>}
    </article>
  );
}
