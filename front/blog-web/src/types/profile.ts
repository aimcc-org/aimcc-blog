export type ProfileName = 'main';
export type ContentOwner = 'main' | 'shared';

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
