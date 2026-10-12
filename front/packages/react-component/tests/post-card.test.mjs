import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PostCard } from "../dist/index.js";

test("host metadata and stats slots retain the shared card navigation and summary", () => {
  const html = renderToStaticMarkup(
    createElement(PostCard, {
      href: "/article/?id=42",
      post: {
        title: "文章",
        description: "摘要",
        cover: "/cover.png",
        tags: ["React"],
      },
      metadata: createElement("span", { "aria-label": "另有 2 个标签" }, "+2"),
      footer: createElement("span", null, "12 次阅读"),
      showCoverArrow: false,
    }),
  );
  assert.match(html, /href="\/article\/\?id=42"/);
  assert.match(html, /摘要/);
  assert.match(html, /另有 2 个标签/);
  assert.match(html, /12 次阅读/);
  assert.doesNotMatch(html, /<time|›/);
});

test("bookmark action stays outside the article link and tags precede the title", () => {
  const html = renderToStaticMarkup(
    createElement(PostCard, {
      href: "/article/?id=9",
      post: {
        title: "测试标题",
        category: "前端",
        tags: ["React", "Less", "Astro"],
        publishedAt: "2026-10-09",
      },
      action: createElement("button", { "aria-pressed": false }, "收藏"),
    }),
  );
  assert.ok(html.indexOf("前端") < html.indexOf("<h2>"));
  assert.match(html, /另有 2 个标签/);
  assert.match(html, /<time/);
  assert.ok(html.indexOf("</a>") < html.indexOf("<button"));
});
