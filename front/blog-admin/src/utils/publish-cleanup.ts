import { readDraftStore, type Draft, type DraftStore } from "./drafts.ts";
import { readEditingCacheStore, writeEditingCache } from "./editing-cache.ts";

/** Remove only the confirmed published article, retaining other drafts and caches. */
export function clearPublishedDraft(
  storage: Pick<Storage, "getItem" | "setItem">,
  draftKey: string,
  cacheKey: string,
  published: Draft,
): { store: DraftStore; saved: string; cached: string } {
  const raw = storage.getItem(draftKey);
  const store = raw
    ? readDraftStore(raw, null)
    : { version: 1 as const, activeId: "", drafts: [] };
  const cache = readEditingCacheStore(storage.getItem(cacheKey));
  const savedDraft = store.drafts.find((item) => item.id === published.id);
  const snapshot = cache.entries[published.id]?.snapshots.at(-1);
  if (
    [savedDraft, snapshot].some(
      (item) => item && item.updatedAt > published.updatedAt,
    )
  ) {
    throw new Error(
      "另一标签页更新了这篇草稿，已保留新版本；请在文章管理中核对后清理。",
    );
  }
  // Persist a receipt first so an interrupted cleanup cannot offer this article for recovery.
  writeEditingCache(storage, cacheKey, published);
  const drafts = store.drafts.filter((item) => item.id !== published.id);
  const next = {
    ...store,
    drafts,
    activeId:
      store.activeId === published.id
        ? (drafts.find((item) => !item.deletedAt)?.id ?? "")
        : store.activeId,
  };
  const saved = JSON.stringify(next);
  storage.setItem(draftKey, saved);
  const remainingCache = readEditingCacheStore(storage.getItem(cacheKey));
  delete remainingCache.entries[published.id];
  if (remainingCache.latestKey === published.id)
    remainingCache.latestKey = null;
  const cached = JSON.stringify(remainingCache);
  storage.setItem(cacheKey, cached);
  return { store: next, saved, cached };
}
