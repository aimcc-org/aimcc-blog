export type ProfileName = "main";
export type ContentOwner = "main" | "shared";

export interface PersonalProfile {
  nickname: string;
  avatar: string | null;
  role?: string;
  location?: string;
  online?: boolean;
  bio: string | null;
  skills?: string[];
  resumeUrl?: string;
  githubUrl: string | null;
  email: string | null;
  now?: {
    description: string;
    activities: string[];
  };
}

export interface SiteProfile {
  id: ProfileName;
  site: {
    title: string;
    description: string;
    url: string;
    lang: string;
  };
  features: {
    toc: boolean;
    search: boolean;
  };
  content: {
    owners: ContentOwner[];
  };
}
