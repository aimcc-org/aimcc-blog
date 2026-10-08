import { useId } from "react";
import { ProfileIcon } from "./profile-icons.js";
import type { UserProfileProps } from "./UserProfile.js";

export interface SidebarUserProfileProps extends UserProfileProps {
  /** Initial state of the independent introduction and skills disclosure. */
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
  skills = [],
  maxVisibleSkills = 9,
  resumeHref,
  githubHref,
  contactHref,
  className = "",
  defaultExpanded = true,
}: SidebarUserProfileProps) {
  const id = useId();
  const limit = Number.isFinite(maxVisibleSkills)
    ? Math.max(0, Math.floor(maxVisibleSkills))
    : 9;
  const extra = skills.slice(limit);
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
      {(bio || skills.length > 0) && (
        <details
          className="sidebar-user-profile__summary"
          open={defaultExpanded}
        >
          <summary>
            简介与技能 <span aria-hidden="true">＋</span>
          </summary>
          {bio && <p className="sidebar-user-profile__bio">{bio}</p>}
          {skills.length > 0 && (
            <div className="sidebar-user-profile__skills">
              <h3>技能标签</h3>
              <ul aria-label="技能标签">
                {skills.slice(0, limit).map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
                {extra.length > 0 && (
                  <li
                    title={extra.join("、")}
                    aria-label={`另外 ${extra.length} 项技能：${extra.join("、")}`}
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
