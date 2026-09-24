/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_PROFILE: "main";
  readonly PUBLIC_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __aimccReadingProgressHandler?: () => void;
  __aimccReadingProgressRoot?: HTMLElement;
}
