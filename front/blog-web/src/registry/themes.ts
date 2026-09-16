import type { ThemeName } from '@/types/profile';

export const themeRegistry: Record<ThemeName, { className: string }> = {
  minimal: { className: 'theme-minimal' },
  fuwari: { className: 'theme-fuwari' },
};
