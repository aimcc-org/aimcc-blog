import assert from "node:assert/strict";
import test from "node:test";
import { fetchCategories } from "../src/lib/categories.ts";

test("load categories and keep categories with zero articles", async (t) => {
  const data = [{ id: 1, name: "Project", articleCount: 0 }];
  const controller = new AbortController();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/categorys");
    assert.equal(options.signal, controller.signal);
    return Response.json({ code: 200, message: "success", data });
  });
  assert.deepEqual(await fetchCategories("/api", controller.signal), data);
});

test("failed and malformed category responses never use local categories", async (t) => {
  for (const response of [
    new Response(null, { status: 503 }),
    Response.json({ code: 500, data: null }),
    Response.json({ code: 200, data: [null] }),
  ]) {
    const mock = t.mock.method(globalThis, "fetch", async () => response);
    assert.deepEqual(await fetchCategories("/api"), []);
    mock.mock.restore();
  }
});
