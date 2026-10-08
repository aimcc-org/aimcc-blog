import { SidebarUserProfile } from "@aimcc/react-component";
import type { PersonalProfile } from "@/types/profile";
export default function SidebarProfile({
  profile,
}: {
  profile: PersonalProfile;
}) {
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
      skills={profile.skills}
      resumeHref={profile.resumeUrl}
      githubHref={profile.githubUrl ?? undefined}
      contactHref={profile.email ? `mailto:${profile.email}` : undefined}
    />
  );
}
