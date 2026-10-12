import assert from "node:assert/strict";
import test from "node:test";
import { adminRequest, AdminApiError } from "../src/services/request.ts";
function mockSession(t) {
  const entries = new Map([["aimcc.admin.token", "test-token"]]);
  const previous = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key) => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value),
      removeItem: (key) => entries.delete(key),
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "sessionStorage", previous);
    else delete globalThis.sessionStorage;
  });
  return entries;
}
test("session requests retain the token, GET method and timeout", async (t) => {
  mockSession(t);
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/admin/session");
    assert.equal(options.method, "GET");
    assert.equal(options.headers.satoken, "test-token");
    assert.equal(options.body, undefined);
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ code: 200, data: "account" });
  });
  assert.equal(await adminRequest("/session"), "account");
});
test("publication requests keep JSON payload and authenticated POST", async (t) => {
  mockSession(t);
  const body = { title: "文章", content: "正文", readingMinutes: 2 };
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/admin/articles");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.equal(options.headers.satoken, "test-token");
    assert.deepEqual(JSON.parse(options.body), body);
    return Response.json({ code: 200, data: 42 });
  });
  assert.equal(await adminRequest("/articles", body), 42);
});
test("expired sessions clear the token and preserve the API error", async (t) => {
  const entries = mockSession(t);
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ code: 401, message: "登录已过期" }),
  );
  await assert.rejects(
    adminRequest("/session"),
    (error) =>
      error instanceof AdminApiError &&
      error.code === 401 &&
      error.message === "登录已过期",
  );
  assert.equal(entries.has("aimcc.admin.token"), false);
});
test("network failures propagate without clearing the session", async (t) => {
  const entries = mockSession(t);
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("network offline");
  });
  await assert.rejects(adminRequest("/articles", {}), /network offline/);
  assert.equal(entries.get("aimcc.admin.token"), "test-token");
});
