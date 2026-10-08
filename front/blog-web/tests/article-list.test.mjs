import assert from "node:assert/strict";
import test from "node:test";
import { fetchArticleList } from "../src/lib/article-list.ts";

const data = {
  records: [
    {
      id: 1,
      title: "API 文章",
      publishedAt: "2026-10-08T10:00:00",
      summary: null,
      tags: [],
      readingMinutes: 2,
    },
  ],
  current: 2,
  size: 20,
  total: 42,
};
test("request the latest article page and forward abort signal", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const parsed = new URL(url, "https://example.test");
    assert.equal(parsed.pathname, "/api/articles");
    assert.equal(parsed.searchParams.get("page"), "2");
    assert.equal(parsed.searchParams.get("size"), "20");
    assert.equal(parsed.searchParams.get("sort"), "new");
    assert.equal(options.signal, controller.signal);
    return Response.json({ code: 200, data });
  });
  assert.deepEqual(await fetchArticleList("/api", 2, controller.signal), data);
});
test("reject failed HTTP responses", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 503 }),
  );
  await assert.rejects(fetchArticleList("/api"), /503/);
});
test("reject business errors and invalid pagination", async (t) => {
  for (const envelope of [
    { code: 500, data },
    { code: 200, data: { ...data, current: 1 } },
    { code: 200, data: { ...data, size: 0 } },
    { code: 200, data: { ...data, records: null } },
  ]) {
    const mock = t.mock.method(globalThis, "fetch", async () =>
      Response.json(envelope),
    );
    await assert.rejects(fetchArticleList("/api", 2), /无效数据/);
    mock.mock.restore();
  }
});
test("accept an empty first page", async (t) => {
  const empty = { records: [], current: 1, size: 20, total: 0 };
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ code: 200, data: empty }),
  );
  assert.deepEqual(await fetchArticleList("/api"), empty);
});
