import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "../../ui/avatar/components/avatar.js";

/** Keep arbitrary host avatar content and initials inside the same themed frame. */
export function ProfileAvatar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Avatar asChild className="profile-avatar">
      <div className={className} aria-hidden="true">
        <AvatarFallback className="profile-avatar__fallback">
          {children}
        </AvatarFallback>
      </div>
    </Avatar>
  );
}
