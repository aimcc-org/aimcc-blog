import assert from "node:assert/strict";
import test from "node:test";
import { createDraft, readDraftStore } from "../src/lib/admin-drafts.ts";
import {
  articlePayload,
  draftTaxonomy,
  fetchTaxonomyOptions,
  publishArticle,
} from "../src/lib/admin-publishing.ts";

const taxonomy = {
  categories: [{ id: 3, name: "技术" }],
  tags: [
    { id: 7, name: "React" },
    { id: 9, name: "前端" },
  ],
};

test("load options from the existing tags and categorys endpoints", async (t) => {
  const paths = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    paths.push(url);
    return Response.json({ code: 200, data: taxonomy.tags });
  });
  assert.deepEqual(await fetchTaxonomyOptions("/api", "/tags"), taxonomy.tags);
  await fetchTaxonomyOptions("/api", "/categorys");
  assert.deepEqual(paths, ["/api/tags", "/api/categorys"]);
});

test("empty options remain valid but failures and invalid IDs do not", async (t) => {
  for (const body of [
    { code: 500, data: [] },
    { code: 200, data: [{ id: "7", name: "React" }] },
    {
      code: 200,
      data: [
        { id: 7, name: "React" },
        { id: 7, name: "duplicate" },
      ],
    },
  ]) {
    t.mock.method(globalThis, "fetch", async () => Response.json(body));
    await assert.rejects(fetchTaxonomyOptions("/api", "/tags"));
    t.mock.restoreAll();
  }
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ code: 200, data: [] }),
  );
  assert.deepEqual(await fetchTaxonomyOptions("/api", "/tags"), []);
});

test("publish multi-selected IDs with backend fields and retain Markdown content", async () => {
  const draft = createDraft({
    title: " 标题 ",
    description: "摘要",
    content: "# 正文\n\n**内容**",
    category: "技术",
    categoryId: 3,
    tags: "React, 前端",
    tagIds: [7, 9, 7],
    cover: "https://example.com/cover.png",
  });
  const id = await publishArticle(draft, taxonomy, async (path, body) => {
    assert.equal(path, "/articles");
    assert.deepEqual(body, {
      title: "标题",
      summary: "摘要",
      content: draft.content,
      coverImage: draft.cover,
      readingMinutes: 1,
      categoryId: 3,
      tagIds: [7, 9],
      isTop: 0,
    });
    return 42;
  });
  assert.equal(id, 42);
  assert.equal(draft.publishedArticleId, undefined);
});

test("resolve legacy names, allow no classification, reject unavailable selections", () => {
  const draft = createDraft({
    title: "标题",
    content: "正文",
    category: "技术",
    tags: "React，前端",
  });
  assert.deepEqual(draftTaxonomy(draft, taxonomy), {
    categoryId: 3,
    tagIds: [7, 9],
  });
  assert.equal(
    articlePayload(
      { ...draft, category: "", categoryId: null, tags: "", tagIds: [] },
      taxonomy,
    ).categoryId,
    null,
  );
  for (const fields of [
    { category: "不存在" },
    { tags: "不存在" },
    { tagIds: [999] },
    { categoryId: 999 },
    { title: "" },
    { publishedArticleId: 42 },
  ]) {
    assert.throws(() => articlePayload({ ...draft, ...fields }, taxonomy));
  }
});

test("publication failure is propagated and malformed success is rejected", async () => {
  const draft = createDraft({ title: "标题", content: "正文" });
  await assert.rejects(
    publishArticle(draft, taxonomy, async () => {
      throw new Error("登录已过期");
    }),
    /登录已过期/,
  );
  for (const id of [null, "42", 0, -1])
    await assert.rejects(
      publishArticle(draft, taxonomy, async () => id),
      /文章 ID/,
    );
});

test("selected IDs and publication receipt survive local draft recovery", () => {
  const draft = createDraft({
    categoryId: 3,
    tagIds: [7, 9],
    publishedArticleId: 42,
  });
  const store = { version: 1, activeId: draft.id, drafts: [draft] };
  assert.deepEqual(readDraftStore(JSON.stringify(store), null), store);
  assert.throws(() =>
    readDraftStore(
      JSON.stringify({ ...store, drafts: [{ ...draft, tagIds: ["7"] }] }),
      null,
    ),
  );
});
