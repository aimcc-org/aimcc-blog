import { useEffect, useState } from "react";
import type { ApiTag } from "@/lib/api";
import { readTagIds, toggleTagHref } from "@/lib/tag-filter";
import { getTagCloud } from "@/lib/api";
import { SidebarUserProfile } from "@aimcc/react-component";
import type { PersonalProfile } from "@/types/profile";
export default function SidebarProfile({
  profile,
}: {
  profile: PersonalProfile;
}) {
  const [tags, setTags] = useState<ApiTag[]>([]);
  const [activeTagIds, setActiveTagIds] = useState<number[]>([]);
  useEffect(() => {
    const syncTag = () => setActiveTagIds(readTagIds(window.location.search));
    syncTag();
    document.addEventListener("astro:page-load", syncTag);
    window.addEventListener("popstate", syncTag);
    window.addEventListener("aimcc:tag-filter-change", syncTag);
    return () => {
      document.removeEventListener("astro:page-load", syncTag);
      window.removeEventListener("popstate", syncTag);
      window.removeEventListener("aimcc:tag-filter-change", syncTag);
    };
  }, []);
  useEffect(() => {
    setTags([]);
    const controller = new AbortController();
    void getTagCloud(controller.signal).then((result) => {
      if (!controller.signal.aborted) setTags(result);
    });
    return () => controller.abort();
  }, []);

  return (
    <SidebarUserProfile
      name={profile.nickname}
      role={profile.role}
      location={profile.location}
      bio={profile.bio ?? undefined}
      avatar={
        profile.avatar ? (
          <img src={profile.avatar} alt="" width={80} height={80} />
        ) : undefined
      }
      online={profile.online}
      tags={tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        href: toggleTagHref(activeTagIds, tag.id),
        active: activeTagIds.includes(tag.id),
      }))}
      onTagClick={(tag, event) => {
        if (
          window.location.pathname !== "/" ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        event.stopPropagation();
        window.history.pushState(null, "", tag.href);
        window.dispatchEvent(new Event("aimcc:tag-filter-change"));
      }}
      resumeHref={profile.resumeUrl}
      githubHref={profile.githubUrl ?? undefined}
      contactHref={profile.email ? `mailto:${profile.email}` : undefined}
    />
  );
}
