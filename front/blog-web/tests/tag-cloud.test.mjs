import assert from "node:assert/strict";
import test from "node:test";
import { fetchTagCloud } from "../src/lib/tag-cloud.ts";

test("load external tags and pass the abort signal", async (t) => {
  const controller = new AbortController();
  const data = [
    { articleCount: 3, id: 2, name: "后端" },
    { articleCount: 2, id: 1, name: "Java" },
    { articleCount: 1, id: 3, name: "建站" },
    { articleCount: 1, id: 4, name: "踩坑" },
  ];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/tags");
    assert.equal(options.signal, controller.signal);
    return Response.json({ code: 200, message: "success", data });
  });
  assert.deepEqual(await fetchTagCloud("/api", controller.signal), data);
});

test("empty tag cloud is a successful response", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ code: 200, data: [] }),
  );
  assert.deepEqual(await fetchTagCloud("/api"), []);
});

test("ignore HTTP, business and malformed tag responses", async (t) => {
  for (const response of [
    new Response(null, { status: 503 }),
    Response.json({ code: 500, data: [] }),
    Response.json({ code: 200, data: {} }),
    Response.json({ code: 200, data: [null] }),
    Response.json({ code: 200, data: [{ id: 1, name: 42, articleCount: 1 }] }),
  ]) {
    const mock = t.mock.method(globalThis, "fetch", async () => response);
    assert.deepEqual(await fetchTagCloud("/api"), []);
    mock.mock.restore();
  }
});

test("network errors do not break the profile", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("offline");
  });
  assert.deepEqual(await fetchTagCloud("/api"), []);
});

test("cancelled tag requests leave the profile empty", async (t) => {
  const controller = new AbortController();
  controller.abort();
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => {
    signal.throwIfAborted();
    throw new Error("expected an aborted signal");
  });
  assert.deepEqual(await fetchTagCloud("/api", controller.signal), []);
});
