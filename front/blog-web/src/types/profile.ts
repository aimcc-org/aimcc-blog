export type ProfileName = 'main';
export type ThemeName = 'minimal' | 'fuwari';
export type LayoutName = 'centered' | 'sidebar' | 'wide';
export type HomeTemplateName = 'hero' | 'blog';
export type PostTemplateName = 'reading' | 'classic';
export type ArchiveTemplateName = 'timeline' | 'grid';
export type ContentOwner = 'main' | 'shared';

export interface SiteProfile {
  id: ProfileName;
  site: {
    title: string;
    description: string;
    url: string;
    lang: string;
  };
  theme: ThemeName;
  layouts: {
    default: LayoutName;
    post: LayoutName;
  };
  templates: {
    home: HomeTemplateName;
    post: PostTemplateName;
    archive: ArchiveTemplateName;
  };
  features: {
    toc: boolean;
    search: boolean;
    profileCard: boolean;
  };
  content: {
    owners: ContentOwner[];
  };
}
