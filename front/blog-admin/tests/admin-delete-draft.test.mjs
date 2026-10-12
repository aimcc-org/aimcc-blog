import assert from "node:assert/strict";
import test from "node:test";
import { createDraft, readDraftStore } from "../src/utils/drafts.ts";
import {
  mergeEditingCache,
  readEditingCacheStore,
  readEditingCache,
  writeEditingCache,
} from "../src/utils/editing-cache.ts";
import { deleteLocalDraft } from "../src/utils/delete-draft.ts";
function setup() {
  const a = createDraft({ content: "删除内容" }),
    b = createDraft({ content: "保留内容" });
  const data = new Map([
    ["drafts", JSON.stringify({ version: 1, activeId: a.id, drafts: [a, b] })],
  ]);
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  writeEditingCache(storage, "cache", b);
  writeEditingCache(storage, "cache", a);
  return { a, b, storage };
}
test("delete the draft and its cache snapshots without resurrection, retaining other drafts", () => {
  const { a, b, storage } = setup();
  const result = deleteLocalDraft(
    storage,
    "drafts",
    "cache",
    a.id,
    storage.getItem("drafts"),
    storage.getItem("cache"),
  );
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
test("deleting the last draft leaves no target data", () => {
  const { a, b, storage } = setup();
  for (const id of [a.id, b.id])
    deleteLocalDraft(
      storage,
      "drafts",
      "cache",
      id,
      storage.getItem("drafts"),
      storage.getItem("cache"),
    );
  assert.deepEqual(JSON.parse(storage.getItem("drafts")).drafts, []);
  assert.deepEqual(readEditingCacheStore(storage.getItem("cache")).entries, {});
});
test("a concurrent storage update blocks deletion", () => {
  const { a, storage } = setup();
  const saved = storage.getItem("drafts"),
    cached = storage.getItem("cache");
  writeEditingCache(storage, "cache", { ...a, content: "另一标签页的新版本" });
  assert.throws(
    () => deleteLocalDraft(storage, "drafts", "cache", a.id, saved, cached),
    /另一标签页/,
  );
  assert.equal(storage.getItem("drafts"), saved);
  assert.equal(
    readEditingCacheStore(storage.getItem("cache")).entries[a.id].snapshots.at(
      -1,
    ).content,
    "另一标签页的新版本",
  );
});
