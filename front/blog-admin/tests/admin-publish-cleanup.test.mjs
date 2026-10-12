import assert from "node:assert/strict";
import test from "node:test";
import { createDraft, readDraftStore } from "../src/lib/admin-drafts.ts";
import {
  readEditingCache,
  readEditingCacheStore,
  mergeEditingCache,
  writeEditingCache,
} from "../src/lib/admin-edit-cache.ts";
import { clearPublishedDraft } from "../src/lib/admin-publish-cleanup.ts";
function fixture() {
  const a = createDraft({ title: "发布目标", content: "正文" });
  const b = createDraft({ title: "其他草稿", content: "保留内容" });
  const store = { version: 1, activeId: a.id, drafts: [a, b] };
  const data = new Map([["drafts", JSON.stringify(store)]]);
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  writeEditingCache(storage, "cache", b);
  writeEditingCache(storage, "cache", a);
  return { a, b, storage, data };
}
test("confirmed publication removes only its draft and all snapshots without recovery resurrection", () => {
  const { a, b, storage } = fixture();
  const result = clearPublishedDraft(storage, "drafts", "cache", {
    ...a,
    publishedArticleId: 42,
  });
  assert.deepEqual(result.store.drafts, [b]);
  assert.equal(result.store.activeId, b.id);
  const cache = readEditingCacheStore(result.cached);
  assert.equal(cache.entries[a.id], undefined);
  assert.deepEqual(cache.entries[b.id].snapshots, [b]);
  assert.equal(readEditingCache(result.cached, result.store), null);
  assert.deepEqual(
    mergeEditingCache(readDraftStore(result.saved, null), cache).drafts,
    [b],
  );
});
test("publishing an older draft preserves the newest draft recovery", () => {
  const { a, b, storage } = fixture();
  storage.setItem("cache", null);
  writeEditingCache(storage, "cache", a);
  writeEditingCache(storage, "cache", b);
  clearPublishedDraft(storage, "drafts", "cache", {
    ...a,
    publishedArticleId: 42,
  });
  assert.equal(readEditingCache(storage.getItem("cache")).id, b.id);
});
test("cleanup of the last draft never restores it after reload", () => {
  const { a, storage } = fixture();
  storage.setItem(
    "drafts",
    JSON.stringify({ version: 1, activeId: a.id, drafts: [a] }),
  );
  storage.setItem("cache", null);
  writeEditingCache(storage, "cache", a);
  const result = clearPublishedDraft(storage, "drafts", "cache", {
    ...a,
    publishedArticleId: 42,
  });
  assert.equal(result.store.drafts.length, 0);
  assert.equal(readEditingCache(result.cached), null);
  assert.ok(
    readDraftStore(result.saved, null).drafts.every((item) => item.id !== a.id),
  );
});
test("newer edits from another tab prevent cleanup without modifying storage", () => {
  const { a, b, storage, data } = fixture();
  const newer = {
    ...a,
    content: "新版本",
    updatedAt: "2099-01-01T00:00:00.000Z",
  };
  storage.setItem(
    "drafts",
    JSON.stringify({ version: 1, activeId: a.id, drafts: [newer, b] }),
  );
  const before = [...data];
  assert.throws(
    () =>
      clearPublishedDraft(storage, "drafts", "cache", {
        ...a,
        publishedArticleId: 42,
      }),
    /另一标签页/,
  );
  assert.deepEqual([...data], before);
});
test("failed draft-store write retains a publication receipt and suppresses recovery", () => {
  const { a, storage } = fixture();
  const failing = {
    ...storage,
    setItem: (key, value) => {
      if (key === "drafts") throw new Error("storage full");
      storage.setItem(key, value);
    },
  };
  assert.throws(
    () =>
      clearPublishedDraft(failing, "drafts", "cache", {
        ...a,
        publishedArticleId: 42,
      }),
    /storage full/,
  );
  assert.equal(readEditingCache(storage.getItem("cache")), null);
  assert.equal(
    readEditingCacheStore(storage.getItem("cache")).entries[a.id]
      .publishedArticleId,
    42,
  );
});
