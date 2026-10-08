import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CategoryIndex,
  SidebarUserProfile,
  UserProfile,
  QuickLinks,
} from "../dist/index.js";
const render = (component, props) =>
  renderToStaticMarkup(createElement(component, props));

test("category index stays one level, preserves zero counts and supplied links", () => {
  const html = render(CategoryIndex, {
    categories: [
      { name: "前端", count: 12, href: "/categories/frontend/", active: true },
      { name: "随笔", count: 0 },
    ],
  });
  assert.equal((html.match(/<li>/g) ?? []).length, 2);
  assert.equal((html.match(/<ul>/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<details|<summary/);
  assert.match(html, /aria-label="0 篇文章"/);
  assert.doesNotMatch(html, /aria-label="共 .*篇文章"/);
  assert.match(html, /<h2[^>]*>分类<\/h2>/);
  assert.match(html, /href="\/categories\/frontend\/" aria-current="page"/);
  assert.equal((html.match(/<a /g) ?? []).length, 1);
});

test("compact profile supports collapsed introduction, offline state and tag overflow", () => {
  const html = render(SidebarUserProfile, {
    name: "AIMCC",
    bio: "介绍",
    tags: ["React", "TypeScript", "Astro"],
    maxVisibleTags: 1,
    online: false,
    defaultExpanded: false,
  });
  assert.match(html, /<details class="sidebar-user-profile__summary">/);
  assert.match(html, /aria-label="离线"/);
  assert.match(html, /<h3>标签<\/h3>/);
  assert.doesNotMatch(html, /技能/);
  assert.match(html, /aria-label="另外 2 个标签：TypeScript、Astro"/);
  assert.doesNotMatch(html, /<li>TypeScript<\/li>/);
  assert.doesNotMatch(html, /aria-label="个人链接"/);
});

test("both profile designs can render together with separate accessible headings", () => {
  const html = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(UserProfile, { name: "Existing" }),
      createElement(SidebarUserProfile, { name: "Sidebar" }),
    ),
  );
  const ids = [...html.matchAll(/<h2 id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, 2);
  assert.equal(new Set(ids).size, 2);
  assert.match(html, /class="user-profile"/);
  assert.match(html, /class="sidebar-user-profile"/);
});

test("external profile tags preserve clickable ids and selected state", () => {
  const html = render(SidebarUserProfile, {
    name: "AIMCC",
    tags: [
      { id: 2, name: "后端", href: "/?tagId=2#posts", active: true },
      { id: 1, name: "Java", href: "/?tagId=1#posts" },
      { id: 3, name: "建站", href: "/?tagId=3#posts" },
    ],
    maxVisibleTags: 2,
  });
  assert.match(
    html,
    /href="\/\?tagId=2#posts" data-tag-id="2" aria-current="true"/,
  );
  assert.match(html, /href="\/\?tagId=1#posts" data-tag-id="1"/);
  assert.match(html, /另外 1 个标签：建站/);
  assert.doesNotMatch(html, /\[object Object\]/);
});

test("quick links preserve internal navigation and protect new-window links", () => {
  const html = render(QuickLinks, {
    links: [
      { label: "关于", href: "/about/" },
      {
        label: "GitHub",
        href: "https://github.com/aimcc-org/aimcc-blog",
        external: true,
      },
    ],
  });
  assert.match(html, /<a href="\/about\/">/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
});
