export const blogUrl = (
  import.meta.env.VITE_BLOG_URL ?? "http://localhost:4321"
).replace(/\/$/, "");
