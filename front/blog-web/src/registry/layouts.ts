import CenteredLayout from '@/layouts/centered/CenteredLayout.astro';
import SidebarLayout from '@/layouts/sidebar/SidebarLayout.astro';
import WideLayout from '@/layouts/wide/WideLayout.astro';
import type { LayoutName } from '@/types/profile';

export const layoutRegistry = {
  centered: CenteredLayout,
  sidebar: SidebarLayout,
  wide: WideLayout,
} satisfies Record<LayoutName, typeof CenteredLayout>;
