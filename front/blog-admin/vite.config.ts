import { loadEnv, defineConfig } from "vite";
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, ".");
  return {
    // 打包产物部署在 /admin/ 路径下（nginx 的 location /admin/），
    // 所以 js/css 的引用要带这个前缀，否则会去根路径 /assets 找文件导致 404。
    // 判断用 command 而不是 mode：command 只有 serve / build 两种，
    // 以后即使加 --mode staging 也不会把 base 弄丢
    base: command === "build" ? "/admin/" : "/",
    resolve: {
      alias: { "@": new URL("./src", import.meta.url).pathname },
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: 4322,
      proxy: {
        "/api": {
          target: env.API_PROXY_TARGET ?? "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
