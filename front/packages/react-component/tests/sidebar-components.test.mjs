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

test("compact profile supports collapsed introduction, offline state and skill overflow", () => {
  const html = render(SidebarUserProfile, {
    name: "AIMCC",
    bio: "介绍",
    skills: ["React", "TypeScript", "Astro"],
    maxVisibleSkills: 1,
    online: false,
    defaultExpanded: false,
  });
  assert.match(html, /<details class="sidebar-user-profile__summary">/);
  assert.match(html, /aria-label="离线"/);
  assert.match(html, /aria-label="另外 2 项技能：TypeScript、Astro"/);
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
