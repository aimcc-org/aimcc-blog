/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SITE_PROFILE: 'main';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
