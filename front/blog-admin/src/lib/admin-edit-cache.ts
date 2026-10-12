import {
  createDraft,
  readDraftStore,
  type Draft,
  type DraftStore,
} from "./admin-drafts.ts";

export interface EditingCacheEntry {
  key: string;
  status: "draft" | "published";
  snapshots: Draft[];
  publishedArticleId?: number;
}

export interface EditingCacheStore {
  version: 2;
  latestKey: string | null;
  entries: Record<string, EditingCacheEntry>;
}

export function hasEditingContent(draft: Draft): boolean {
  return [
    draft.title,
    draft.description,
    draft.content,
    draft.category,
    draft.tags,
    draft.slug,
    draft.cover,
  ].some((value) => value.trim().length > 0);
}

function validateSnapshot(draft: Draft): void {
  readDraftStore(
    JSON.stringify({ version: 1, activeId: draft?.id, drafts: [draft] }),
    null,
  );
}

function entryFor(draft: Draft): EditingCacheEntry {
  return {
    key: draft.id,
    status: draft.publishedArticleId ? "published" : "draft",
    snapshots: [draft],
    ...(draft.publishedArticleId
      ? { publishedArticleId: draft.publishedArticleId }
      : {}),
  };
}

/** Upgrade the single-snapshot cache and retain existing locally saved articles. */
export function readEditingCacheStore(
  raw: string | null,
  savedStore?: DraftStore,
): EditingCacheStore {
  let cache: EditingCacheStore = { version: 2, latestKey: null, entries: {} };
  if (raw) {
    const value = JSON.parse(raw);
    if (value?.version === 1 && value.draft) {
      validateSnapshot(value.draft);
      cache.latestKey = value.draft.id;
      cache.entries[value.draft.id] = entryFor(value.draft);
    } else if (
      value?.version === 2 &&
      value.entries &&
      typeof value.entries === "object" &&
      !Array.isArray(value.entries)
    ) {
      if (
        value.latestKey !== null &&
        (typeof value.latestKey !== "string" ||
          !Object.hasOwn(value.entries, value.latestKey))
      )
        throw new Error("编辑缓存格式不正确");
      for (const [key, entry] of Object.entries(value.entries) as [
        string,
        EditingCacheEntry,
      ][]) {
        if (
          !entry ||
          entry.key !== key ||
          !["draft", "published"].includes(entry.status) ||
          !Array.isArray(entry.snapshots) ||
          !entry.snapshots.length ||
          (entry.status === "published" &&
            (!Number.isSafeInteger(entry.publishedArticleId) ||
              entry.publishedArticleId! <= 0))
        )
          throw new Error("编辑缓存格式不正确");
        for (const snapshot of entry.snapshots) {
          validateSnapshot(snapshot);
          if (snapshot.id !== key) throw new Error("编辑缓存快照 key 不一致");
        }
      }
      cache = value;
    } else throw new Error("编辑缓存格式不正确");
  }
  if (savedStore) {
    for (const draft of savedStore.drafts) {
      const entry = cache.entries[draft.id];
      if (!entry) cache.entries[draft.id] = entryFor(draft);
      else {
        if (draft.updatedAt > entry.snapshots.at(-1)!.updatedAt)
          entry.snapshots.push(draft);
        if (draft.publishedArticleId) {
          entry.status = "published";
          entry.publishedArticleId = draft.publishedArticleId;
        }
      }
    }
    // Never search older keys when the most recent article is published/empty.
    if (!raw) cache.latestKey = savedStore.activeId;
  }
  return cache;
}

export function readEditingCache(
  raw: string | null,
  savedStore?: DraftStore,
): Draft | null {
  const cache = readEditingCacheStore(raw, savedStore);
  const entry = cache.latestKey ? cache.entries[cache.latestKey] : undefined;
  if (!entry || entry.status === "published") return null;
  if (savedStore?.drafts.find((draft) => draft.id === entry.key)?.deletedAt)
    return null;
  const latest = entry.snapshots.at(-1)!;
  return !latest.deletedAt &&
    !latest.publishedArticleId &&
    hasEditingContent(latest)
    ? latest
    : null;
}

/** Each article keeps its key and appends versions; publication is a terminal marker. */
export function writeEditingCache(
  storage: Pick<Storage, "getItem" | "setItem">,
  key: string,
  draft: Draft,
): void {
  const cache = readEditingCacheStore(storage.getItem(key));
  const existing = cache.entries[draft.id];
  const entry = existing ?? entryFor(draft);
  if (
    existing &&
    JSON.stringify(entry.snapshots.at(-1)) !== JSON.stringify(draft)
  )
    entry.snapshots.push(draft);
  if (draft.publishedArticleId) {
    entry.status = "published";
    entry.publishedArticleId = draft.publishedArticleId;
  }
  cache.entries[draft.id] = entry;
  // The newest created key wins. Editing/publishing an older article must
  // not hide the newest article or cause recovery to fall back to older keys.
  if (!existing) cache.latestKey = draft.id;
  storage.setItem(key, JSON.stringify(cache));
}

/** Article management still uses the local draft store, including cache-only edits. */
export function mergeEditingCache(
  store: DraftStore,
  cache: EditingCacheStore,
): DraftStore {
  const drafts = [...store.drafts];
  for (const entry of Object.values(cache.entries)) {
    const snapshot = entry.snapshots.at(-1)!;
    const index = drafts.findIndex((draft) => draft.id === entry.key);
    const saved = drafts[index];
    let draft =
      !saved || (!saved.deletedAt && snapshot.updatedAt > saved.updatedAt)
        ? snapshot
        : saved;
    if (entry.status === "published")
      draft = { ...draft, publishedArticleId: entry.publishedArticleId };
    if (index < 0) drafts.push(draft);
    else drafts[index] = draft;
  }
  return { ...store, drafts };
}

/** Keep a newer/deleted saved draft intact when recovering an older snapshot. */
export function recoverEditingCache(
  store: DraftStore,
  cached: Draft,
): DraftStore {
  const current = store.drafts.find((item) => item.id === cached.id);
  const recoverAsNew =
    current && (current.deletedAt || current.updatedAt > cached.updatedAt);
  const recovered = recoverAsNew
    ? createDraft({ ...cached, deletedAt: undefined })
    : cached;
  return {
    ...store,
    activeId: recovered.id,
    drafts: store.drafts.some((item) => item.id === recovered.id)
      ? store.drafts.map((item) =>
          item.id === recovered.id ? recovered : item,
        )
      : [recovered, ...store.drafts],
  };
}
