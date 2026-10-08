import { useId } from "react";
import type { MouseEvent } from "react";
import { ProfileIcon } from "./profile-icons.js";
import type { UserProfileProps } from "./UserProfile.js";

export interface SidebarProfileTag {
  id: number;
  name: string;
  href: string;
  active?: boolean;
}

export interface SidebarUserProfileProps extends Omit<
  UserProfileProps,
  "skills" | "maxVisibleSkills"
> {
  /** Tags supplied by the caller, independently of personal profile data. */
  tags?: (string | SidebarProfileTag)[];
  maxVisibleTags?: number;
  onTagClick?: (
    tag: SidebarProfileTag,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  /** Initial state of the independent introduction and tags disclosure. */
  defaultExpanded?: boolean;
}

/** Compact About Me from the previous blog's left rail. */
export function SidebarUserProfile({
  name,
  role,
  location,
  bio,
  avatar,
  online,
  tags = [],
  maxVisibleTags = 9,
  onTagClick,
  resumeHref,
  githubHref,
  contactHref,
  className = "",
  defaultExpanded = true,
}: SidebarUserProfileProps) {
  const id = useId();
  const limit = Number.isFinite(maxVisibleTags)
    ? Math.max(0, Math.floor(maxVisibleTags))
    : 9;
  const extra = tags
    .slice(limit)
    .map((tag) => (typeof tag === "string" ? tag : tag.name));
  return (
    <section
      className={`sidebar-user-profile ${className}`.trim()}
      aria-labelledby={id}
    >
      <header className="sidebar-user-profile__header">
        <span>
          <ProfileIcon kind="badge" />
          ABOUT ME
        </span>
        <span>// 个人信息</span>
      </header>
      <div className="sidebar-user-profile__identity">
        <div className="sidebar-user-profile__avatar">
          <div aria-hidden="true">
            {avatar ?? name.slice(0, 2).toUpperCase()}
          </div>
          {online !== undefined && (
            <i
              className={online ? "is-online" : ""}
              role="img"
              aria-label={online ? "在线" : "离线"}
            />
          )}
        </div>
        <div className="sidebar-user-profile__details">
          <h2 id={id}>{name}</h2>
          {role && <p>{role}</p>}
          {location && (
            <p className="sidebar-user-profile__location">
              <ProfileIcon kind="location" />
              {location}
            </p>
          )}
        </div>
      </div>
      {(bio || tags.length > 0) && (
        <details
          className="sidebar-user-profile__summary"
          open={defaultExpanded}
        >
          <summary>
            简介与标签 <span aria-hidden="true">＋</span>
          </summary>
          {bio && <p className="sidebar-user-profile__bio">{bio}</p>}
          {tags.length > 0 && (
            <div className="sidebar-user-profile__tags">
              <h3>标签</h3>
              <ul aria-label="标签">
                {tags.slice(0, limit).map((tag, index) => (
                  <li key={typeof tag === "string" ? index : tag.id}>
                    {typeof tag === "string" ? (
                      tag
                    ) : (
                      <a
                        href={tag.href}
                        data-tag-id={tag.id}
                        aria-current={tag.active ? "true" : undefined}
                        onClick={(event) => onTagClick?.(tag, event)}
                      >
                        {tag.name}
                      </a>
                    )}
                  </li>
                ))}
                {extra.length > 0 && (
                  <li
                    title={extra.join("、")}
                    aria-label={`另外 ${extra.length} 个标签：${extra.join("、")}`}
                  >
                    +{extra.length}
                  </li>
                )}
              </ul>
            </div>
          )}
        </details>
      )}
      {(resumeHref || githubHref || contactHref) && (
        <nav className="sidebar-user-profile__links" aria-label="个人链接">
          {resumeHref && (
            <a className="is-primary" href={resumeHref}>
              电子简历 <ProfileIcon kind="arrow" />
            </a>
          )}
          {githubHref && (
            <a href={githubHref} target="_blank" rel="noopener noreferrer">
              <ProfileIcon kind="github" />
              GitHub
            </a>
          )}
          {contactHref && (
            <a href={contactHref}>
              <ProfileIcon kind="mail" />
              联系我
            </a>
          )}
        </nav>
      )}
    </section>
  );
}
