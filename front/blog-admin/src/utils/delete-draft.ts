import { readDraftStore, type DraftStore } from "./drafts.ts";
import { readEditingCacheStore, mergeEditingCache } from "./editing-cache.ts";

export function deleteLocalDraft(
  storage: Pick<Storage, "getItem" | "setItem">,
  draftKey: string,
  cacheKey: string,
  id: string,
  expectedSaved: string | null,
  expectedCached: string | null,
): { store: DraftStore; saved: string; cached: string } {
  if (
    storage.getItem(draftKey) !== expectedSaved ||
    storage.getItem(cacheKey) !== expectedCached
  )
    throw new Error("另一标签页已更新草稿，请刷新后重试。");
  const store = readDraftStore(expectedSaved, null);
  const cache = readEditingCacheStore(expectedCached);
  const drafts = mergeEditingCache(store, cache).drafts.filter(
    (item) => item.id !== id,
  );
  const next = {
    ...store,
    drafts,
    activeId:
      store.activeId === id
        ? (drafts.find((item) => !item.deletedAt)?.id ?? "")
        : store.activeId,
  };
  delete cache.entries[id];
  if (cache.latestKey === id) cache.latestKey = null;
  const cached = JSON.stringify(cache);
  const saved = JSON.stringify(next);
  // If the store write fails, the saved draft remains available for retry.
  storage.setItem(cacheKey, cached);
  storage.setItem(draftKey, saved);
  return { store: next, saved, cached };
}
