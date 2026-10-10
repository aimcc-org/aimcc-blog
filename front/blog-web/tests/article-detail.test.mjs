import assert from "node:assert/strict";
import test from "node:test";
import {
  articleDetailHref,
  fetchArticleDetail,
} from "../src/lib/article-detail.ts";

const article = {
  id: 42,
  title: "API 文章",
  content: "# 正文",
  summary: null,
  publishedAt: null,
  readingMinutes: 2,
};

test("API articles link to the static detail page with their id", () => {
  assert.equal(articleDetailHref(42), "/article/?id=42");
});

test("load the selected article and forward the abort signal", async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/articles/42");
    assert.equal(options.signal, controller.signal);
    return Response.json({ code: 200, data: article });
  });
  assert.deepEqual(
    await fetchArticleDetail("/api", "42", controller.signal),
    article,
  );
});

test("reject invalid links without sending a request", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected request");
  });
  for (const id of ["", "0", "-1", "abc", "1/2", "1.5", "9007199254740992"]) {
    await assert.rejects(fetchArticleDetail("/api", id), /链接无效/);
  }
  assert.equal(mock.mock.callCount(), 0);
});

test("distinguish missing articles from network and invalid response errors", async (t) => {
  for (const [response, error] of [
    [new Response(null, { status: 404 }), /不存在或已下线/],
    [Response.json({ code: 404, data: null }), /不存在或已下线/],
    [new Response(null, { status: 503 }), /加载失败/],
    [Response.json({ code: 500, data: null }), /加载失败/],
    [Response.json({ code: 200, data: { ...article, id: 99 } }), /无效数据/],
    [
      Response.json({ code: 200, data: { ...article, content: null } }),
      /无效数据/,
    ],
  ]) {
    const mock = t.mock.method(globalThis, "fetch", async () => response);
    await assert.rejects(fetchArticleDetail("/api", "42"), error);
    mock.mock.restore();
  }
});
