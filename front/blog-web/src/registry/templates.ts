import BlogHome from '@/templates/home/BlogHome.astro';
import HeroHome from '@/templates/home/HeroHome.astro';
import ClassicPost from '@/templates/post/ClassicPost.astro';
import ReadingPost from '@/templates/post/ReadingPost.astro';
import GridArchive from '@/templates/archive/GridArchive.astro';
import TimelineArchive from '@/templates/archive/TimelineArchive.astro';
import type { ArchiveTemplateName, HomeTemplateName, PostTemplateName } from '@/types/profile';

export const homeTemplateRegistry = {
  blog: BlogHome,
  hero: HeroHome,
} satisfies Record<HomeTemplateName, typeof BlogHome>;

export const postTemplateRegistry = {
  classic: ClassicPost,
  reading: ReadingPost,
} satisfies Record<PostTemplateName, typeof ClassicPost>;

export const archiveTemplateRegistry = {
  grid: GridArchive,
  timeline: TimelineArchive,
} satisfies Record<ArchiveTemplateName, typeof GridArchive>;
