import assert from "node:assert/strict";
import test from "node:test";
import { createDraft, readDraftStore } from "../src/lib/admin-drafts.ts";
import {
  readEditingCache,
  writeEditingCache,
  recoverEditingCache,
  readEditingCacheStore,
  mergeEditingCache,
} from "../src/lib/admin-edit-cache.ts";

test("cache the latest text and metadata synchronously before draft save", () => {
  const draft = createDraft({
    title: "缓存标题",
    content: "最新输入",
    cover: "https://example.com/cover.png",
    tags: "React",
  });
  let stored;
  writeEditingCache(
    {
      getItem: () => stored ?? null,
      setItem(key, raw) {
        assert.equal(key, "account-cache");
        stored = raw;
      },
    },
    "account-cache",
    draft,
  );
  assert.deepEqual(readEditingCache(stored), draft);
});
test("empty edits and missing caches do not request recovery", () => {
  assert.equal(readEditingCache(null), null);
  assert.equal(
    readEditingCache(JSON.stringify({ version: 1, draft: createDraft() })),
    null,
  );
});
function memoryStorage(raw = null) {
  return {
    raw,
    getItem() {
      return this.raw;
    },
    setItem(_key, value) {
      this.raw = value;
    },
  };
}

test("one key holds multiple versions and a persistent published marker", () => {
  const storage = memoryStorage();
  const a = createDraft({ content: "第一版" });
  writeEditingCache(storage, "cache", a);
  writeEditingCache(storage, "cache", { ...a, content: "第二版" });
  writeEditingCache(storage, "cache", {
    ...a,
    content: "第二版",
    publishedArticleId: 42,
  });
  const cache = readEditingCacheStore(storage.raw);
  assert.equal(cache.latestKey, a.id);
  assert.equal(cache.entries[a.id].status, "published");
  assert.equal(cache.entries[a.id].publishedArticleId, 42);
  assert.deepEqual(
    cache.entries[a.id].snapshots.map((s) => s.content),
    ["第一版", "第二版", "第二版"],
  );
  assert.equal(readEditingCache(storage.raw), null);
  writeEditingCache(storage, "cache", { ...a, content: "发布后修改" });
  assert.equal(readEditingCache(storage.raw), null);
});

test("published latest A never searches B, C or D for recovery", () => {
  const storage = memoryStorage();
  const drafts = ["D", "C", "B", "A"].map((title) =>
    createDraft({ title, content: title }),
  );
  for (const draft of drafts) writeEditingCache(storage, "cache", draft);
  const a = drafts.at(-1);
  assert.equal(readEditingCache(storage.raw).id, a.id);
  writeEditingCache(storage, "cache", { ...a, publishedArticleId: 42 });
  assert.equal(readEditingCache(storage.raw), null);
  assert.equal(
    Object.keys(readEditingCacheStore(storage.raw).entries).length,
    4,
  );
});

test("publishing older B keeps newest unpublished A as the recovery candidate", () => {
  const storage = memoryStorage();
  const b = createDraft({ content: "B" });
  const a = createDraft({ content: "A 第一版" });
  writeEditingCache(storage, "cache", b);
  writeEditingCache(storage, "cache", a);
  writeEditingCache(storage, "cache", { ...b, publishedArticleId: 42 });
  assert.equal(readEditingCache(storage.raw).id, a.id);
  writeEditingCache(storage, "cache", { ...a, content: "A 第二版" });
  assert.equal(readEditingCache(storage.raw).content, "A 第二版");
  writeEditingCache(storage, "cache", { ...b, content: "B 本地修改" });
  assert.equal(readEditingCacheStore(storage.raw).latestKey, a.id);
  assert.equal(
    readEditingCacheStore(storage.raw).entries[b.id].status,
    "published",
  );
});
test("new empty key suppresses older content and duplicate activation adds no version", () => {
  const storage = memoryStorage();
  writeEditingCache(storage, "cache", createDraft({ content: "旧正文" }));
  const empty = createDraft();
  writeEditingCache(storage, "cache", empty);
  writeEditingCache(storage, "cache", empty);
  assert.equal(readEditingCache(storage.raw), null);
  assert.equal(
    readEditingCacheStore(storage.raw).entries[empty.id].snapshots.length,
    1,
  );
});

test("migrate legacy caches, retain saved entries and honor publication receipts", () => {
  const store = readDraftStore(null, null);
  const draft = createDraft({ content: "缓存文章" });
  const raw = JSON.stringify({ version: 1, draft });
  const cache = readEditingCacheStore(raw, store);
  assert.equal(cache.latestKey, draft.id);
  assert.equal(Object.keys(cache.entries).length, 2);
  assert.equal(mergeEditingCache(store, cache).drafts.length, 2);
  assert.equal(
    readEditingCache(raw, {
      version: 1,
      activeId: draft.id,
      drafts: [{ ...draft, publishedArticleId: 42 }],
    }),
    null,
  );
});

test("management merges latest versions and published status without changing selection", () => {
  const store = readDraftStore(null, null);
  const storage = memoryStorage();
  const draft = {
    ...store.drafts[0],
    content: "最新正文",
    updatedAt: "2099-01-01T00:00:00.000Z",
    publishedArticleId: 42,
  };
  writeEditingCache(storage, "cache", draft);
  const merged = mergeEditingCache(store, readEditingCacheStore(storage.raw));
  assert.equal(merged.activeId, store.activeId);
  assert.equal(merged.drafts[0].content, draft.content);
  assert.equal(merged.drafts[0].publishedArticleId, 42);
  assert.equal(store.drafts[0].content, "");
});
test("invalid cache never becomes a valid empty draft", () => {
  for (const raw of [
    "{",
    "null",
    '{"version":2}',
    JSON.stringify({ version: 1, draft: { id: "invalid" } }),
  ]) {
    assert.throws(() => readEditingCache(raw));
  }
});
test("restore the cached draft without losing other drafts", () => {
  const store = readDraftStore(null, null);
  const other = createDraft({ title: "另一篇文章" });
  store.drafts.push(other);
  const cached = {
    ...store.drafts[0],
    content: "未保存的正文",
    updatedAt: "2099-01-01T00:00:00.000Z",
  };
  const recovered = recoverEditingCache(store, cached);
  assert.equal(recovered.drafts.length, 2);
  assert.equal(recovered.activeId, cached.id);
  assert.equal(recovered.drafts[0].content, cached.content);
  assert.deepEqual(recovered.drafts[1], other);
  assert.equal(store.drafts[0].content, "");
});
test("older cache and deleted drafts recover as a separate draft", () => {
  for (const deletedAt of [undefined, "2026-10-10T00:00:00.000Z"]) {
    const current = {
      ...createDraft({ content: "当前版本" }),
      updatedAt: "2026-10-10T01:00:00.000Z",
      deletedAt,
    };
    const cached = {
      ...current,
      content: "缓存版本",
      updatedAt: "2026-10-10T00:00:00.000Z",
      deletedAt: undefined,
    };
    const restored = recoverEditingCache(
      { version: 1, activeId: current.id, drafts: [current] },
      cached,
    );
    assert.notEqual(restored.activeId, current.id);
    assert.equal(restored.drafts[0].content, "缓存版本");
    assert.equal(restored.drafts[0].deletedAt, undefined);
    assert.deepEqual(restored.drafts[1], current);
  }
});
