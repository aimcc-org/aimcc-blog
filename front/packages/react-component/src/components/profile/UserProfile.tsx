import { ProfileIcon as Icon } from "./profile-icons.js";
import { useId } from "react";
import type { ReactNode } from "react";

export interface UserProfileProps {
  name: string;
  role?: string;
  location?: string;
  bio?: string;
  avatar?: ReactNode;
  online?: boolean;
  skills?: string[];
  maxVisibleSkills?: number;
  resumeHref?: string;
  githubHref?: string;
  contactHref?: string;
  className?: string;
}

export function UserProfile({
  name,
  role,
  location,
  bio,
  avatar,
  online = false,
  skills = [],
  maxVisibleSkills = 9,
  resumeHref,
  githubHref,
  contactHref,
  className = "",
}: UserProfileProps) {
  const titleId = useId();
  const skillLimit = Number.isFinite(maxVisibleSkills)
    ? Math.max(0, Math.floor(maxVisibleSkills))
    : 9;
  const visibleSkills = skills.slice(0, skillLimit);
  const hiddenSkills = skills.slice(skillLimit);
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <section
      className={`user-profile ${className}`.trim()}
      aria-labelledby={titleId}
    >
      <div className="user-profile__eyebrow">
        <span>
          <Icon kind="badge" />
          ABOUT ME
        </span>
        <span>// 个人信息</span>
      </div>
      <div className="user-profile__identity">
        <div className="user-profile__avatar">
          <div className="user-profile__avatar-content" aria-hidden="true">
            {avatar ?? initials}
          </div>
          {online && (
            <span
              className="user-profile__status"
              role="img"
              aria-label="在线"
            />
          )}
        </div>
        <div className="user-profile__details">
          <h2 id={titleId}>{name}</h2>
          {role && <p className="user-profile__role">{role}</p>}
          {location && (
            <p className="user-profile__location">
              <Icon kind="location" />
              {location}
            </p>
          )}
        </div>
      </div>
      {bio && <p className="user-profile__bio">{bio}</p>}
      {skills.length > 0 && (
        <div className="user-profile__skills">
          <h3>技能标签</h3>
          <ul aria-label="技能标签">
            {visibleSkills.map((skill, index) => (
              <li key={`${skill}-${index}`}>{skill}</li>
            ))}
            {hiddenSkills.length > 0 && (
              <li
                className="user-profile__more"
                title={hiddenSkills.join("、")}
                aria-label={`另外 ${hiddenSkills.length} 项技能：${hiddenSkills.join("、")}`}
              >
                +{hiddenSkills.length}
              </li>
            )}
          </ul>
        </div>
      )}
      {(resumeHref || githubHref || contactHref) && (
        <div className="user-profile__actions">
          {resumeHref && (
            <a className="user-profile__resume" href={resumeHref}>
              电子简历
              <Icon kind="arrow" />
            </a>
          )}
          {(githubHref || contactHref) && (
            <div className="user-profile__links">
              {githubHref && (
                <a href={githubHref}>
                  <Icon kind="github" />
                  GitHub
                </a>
              )}
              {contactHref && (
                <a href={contactHref}>
                  <Icon kind="mail" />
                  联系我
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
