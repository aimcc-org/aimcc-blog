import { loadEnv, defineConfig } from "vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    resolve: {
      alias: { "@": new URL("./src", import.meta.url).pathname },
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: 4322,
      proxy: {
        "/api": {
          target: env.API_PROXY_TARGET ?? "http://47.96.92.202:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
