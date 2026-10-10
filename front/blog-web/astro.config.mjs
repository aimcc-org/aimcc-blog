import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { profiles, profileNames } from "./profiles.config.mjs";

const profileName = process.env.SITE_PROFILE ?? "main";

if (!profileNames.includes(profileName)) {
  throw new Error(
    `Unknown SITE_PROFILE "${profileName}". Expected one of: ${profileNames.join(", ")}`,
  );
}

const profile = profiles[profileName];

export default defineConfig({
  site: profile.site.url,
  output: "static",
  outDir: `./dist/${profileName}`,
  integrations: [
    react(),
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/admin") }),
  ],
  vite: {
    ssr: { noExternal: ["@aimcc/react-component"] },
    resolve: { dedupe: ["react", "react-dom"] },
    optimizeDeps: {
      include: [
        "@aimcc/react-component > react-markdown",
        "@aimcc/react-component > remark-gfm",
        "@aimcc/react-component > rehype-slug",
        "@aimcc/react-component > @uiw/react-md-editor/nohighlight",
        "@aimcc/react-component > @uiw/react-md-editor/commands-cn",
      ],
    },
    plugins: [tailwindcss()],
    define: {
      "import.meta.env.SITE_PROFILE": JSON.stringify(profileName),
    },
    server: {
      proxy: {
        "/api": {
          target: process.env.API_PROXY_TARGET ?? "http://47.96.92.202:8080",
          changeOrigin: true,
        },
      },
      fs: {
        allow: [".."],
      },
    },
  },
});
