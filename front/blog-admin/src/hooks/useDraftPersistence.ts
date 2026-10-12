import { useEffect } from "react";
import { createDraft, readDraftStore, type DraftStore } from "@/utils/drafts";
import {
  readEditingCache,
  readEditingCacheStore,
  mergeEditingCache,
} from "@/utils/editing-cache";
import type { useDraftState } from "./useDraftState";
export function useDraftPersistence(
  state: ReturnType<typeof useDraftState>,
  accountId: string,
  mode: "edit" | "manage",
) {
  const draftKey = `aimcc.admin.drafts.${accountId}`;
  const cacheKey = `aimcc.admin.edit-cache.${accountId}`;
  const {
    setRecovery,
    cacheError,
    setCacheError,
    lastCached,
    store,
    setStore,
    setEditorDraft,
    editingStarted,
    setEditingStarted,
    loaded,
    setLoaded,
    setSaveStatus,
    storageError,
    setStorageError,
    lastSaved,
  } = state;
  useEffect(() => {
    let savedStore: DraftStore | undefined;
    let persistedStore: DraftStore | undefined;
    setEditingStarted(false);
    setEditorDraft(createDraft());
    try {
      const saved = localStorage.getItem(draftKey);
      lastSaved.current = saved;
      const legacy = saved
        ? null
        : localStorage.getItem(`aimcc.admin.draft.${accountId}`);
      savedStore = readDraftStore(saved, legacy);
      if (saved || legacy) persistedStore = savedStore;
      else setEditorDraft(savedStore.drafts[0]);
      setStore(savedStore);
    } catch {
      setStorageError(true);
      setSaveStatus("无法读取草稿，原数据已保留；请导出当前内容备份");
    }
    try {
      const raw = localStorage.getItem(cacheKey);
      lastCached.current = raw;
      const cache = readEditingCacheStore(raw, persistedStore);
      let merged = savedStore
        ? mergeEditingCache(savedStore, cache)
        : undefined;
      if (merged && !persistedStore && Object.keys(cache.entries).length) {
        const drafts = merged.drafts.filter((item) =>
          Object.hasOwn(cache.entries, item.id),
        );
        merged = {
          ...merged,
          drafts,
          activeId: cache.latestKey ?? drafts[0].id,
        };
      }
      if (merged) setStore(merged);
      if (mode === "edit") {
        const selectedId = new URLSearchParams(window.location.search).get(
          "draft",
        );
        const selected = selectedId
          ? merged?.drafts.find(
              (item) => item.id === selectedId && !item.deletedAt,
            )
          : undefined;
        // "Continue editing" in article management is an explicit selection.
        if (selected) {
          setEditorDraft(selected);
          setEditingStarted(true);
          setRecovery(null);
          if (merged) setStore({ ...merged, activeId: selected.id });
        } else setRecovery(readEditingCache(raw, persistedStore));
      }
      if (localStorage.getItem(cacheKey) !== raw) throw new Error("缓存已更新");
      const upgraded = JSON.stringify(cache);
      localStorage.setItem(cacheKey, upgraded);
      lastCached.current = upgraded;
    } catch {
      setCacheError(true);
    }
    setLoaded(true);
  }, [draftKey, accountId, cacheKey, mode]);

  useEffect(() => {
    if (!loaded || storageError || (mode === "edit" && !editingStarted)) return;
    try {
      if (localStorage.getItem(draftKey) !== lastSaved.current) {
        setStorageError(true);
        setSaveStatus("另一标签页已更新草稿，请导出当前内容后刷新，避免覆盖");
        return;
      }
      const saved = JSON.stringify(store);
      localStorage.setItem(draftKey, saved);
      lastSaved.current = saved;
      setSaveStatus("已保存到当前浏览器 · 草稿不会同步到其他设备");
    } catch {
      setStorageError(true);
      setSaveStatus("保存失败，请导出 Markdown 备份");
    }
  }, [store, draftKey, cacheKey, loaded, storageError, mode, editingStarted]);

  useEffect(() => {
    if (!storageError && !cacheError) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [storageError, cacheError]);
}
