import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchArticleList,
  fetchArticleListBatch,
} from "../src/lib/article-list.ts";

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
    assert.equal(parsed.searchParams.has("tagId"), false);
    assert.equal(options.signal, controller.signal);
    return Response.json({ code: 200, data });
  });
  assert.deepEqual(await fetchArticleList("/api", 2, controller.signal), data);
});
test("pass tagId on every page of a filtered list", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    const parsed = new URL(url, "https://example.test");
    assert.equal(parsed.searchParams.get("tagId"), "2");
    const current = Number(parsed.searchParams.get("page"));
    return Response.json({ code: 200, data: { ...data, current } });
  });
  await fetchArticleList("/api", 1, undefined, 2);
  await fetchArticleList("/api", 2, undefined, 2);
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

test("multi-select requests each tag, deduplicates articles and preserves pagination", async (t) => {
  const calls = [];
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(options.signal, controller.signal);
    const params = new URL(url, "https://example.test").searchParams;
    const tagId = Number(params.get("tagId"));
    const current = Number(params.get("page"));
    calls.push([tagId, current]);
    const records =
      current === 1
        ? tagId === 1
          ? [{ id: 1 }, { id: 2 }]
          : [{ id: 2 }, { id: 3 }]
        : tagId === 1
          ? [{ id: 4 }]
          : [];
    return Response.json({
      code: 200,
      data: { records, current, size: 2, total: tagId === 1 ? 3 : 2 },
    });
  });
  const first = await fetchArticleListBatch(
    "/api",
    1,
    controller.signal,
    [1, 2, 1],
  );
  assert.deepEqual(
    first.records.map((article) => article.id),
    [1, 2, 3],
  );
  assert.equal(first.hasMore, true);
  const second = await fetchArticleListBatch(
    "/api",
    2,
    controller.signal,
    [1, 2],
  );
  assert.deepEqual(
    second.records.map((article) => article.id),
    [4],
  );
  assert.equal(second.hasMore, false);
  assert.deepEqual(calls, [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ]);
});

test("no selected tags requests the unfiltered list", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(
      new URL(url, "https://example.test").searchParams.has("tagId"),
      false,
    );
    return Response.json({
      code: 200,
      data: { records: [], current: 1, size: 20, total: 0 },
    });
  });
  assert.deepEqual(await fetchArticleListBatch("/api"), {
    records: [],
    hasMore: false,
  });
});

test("category filter accompanies the tag on every page", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    const params = new URL(url, "https://example.test").searchParams;
    assert.equal(params.get("categoryId"), "3");
    assert.equal(params.get("tagId"), "2");
    return Response.json({
      code: 200,
      data: {
        ...data,
        current: Number(params.get("page")),
        records: [{ ...data.records[0], categoryId: 3 }],
      },
    });
  });
  await fetchArticleListBatch("/api", 1, undefined, [2], 3);
  await fetchArticleListBatch("/api", 2, undefined, [2], 3);
});

test("category-filtered responses do not require categoryId in each record", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    const params = new URL(url, "https://example.test").searchParams;
    assert.equal(params.get("categoryId"), "3");
    return Response.json({ code: 200, data: { ...data, current: 1 } });
  });
  assert.deepEqual(await fetchArticleListBatch("/api", 1, undefined, [], 3), {
    records: data.records,
    hasMore: true,
  });
});

test("a failed selected-tag request fails the whole batch", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(null, { status: 503 }),
  );
  await assert.rejects(
    fetchArticleListBatch("/api", 1, undefined, [1, 2]),
    /503/,
  );
});
