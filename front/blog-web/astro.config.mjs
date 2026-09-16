import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { profiles, profileNames } from './profiles.config.mjs';

const profileName = process.env.SITE_PROFILE ?? 'main';

if (!profileNames.includes(profileName)) {
  throw new Error(`Unknown SITE_PROFILE "${profileName}". Expected one of: ${profileNames.join(', ')}`);
}

const profile = profiles[profileName];

export default defineConfig({
  site: profile.site.url,
  output: 'static',
  outDir: `./dist/${profileName}`,
  integrations: [react(), sitemap()],
  vite: {
    define: {
      'import.meta.env.SITE_PROFILE': JSON.stringify(profileName),
    },
  },
});
