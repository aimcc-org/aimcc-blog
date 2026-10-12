import { useDraftState } from "./useDraftState";
import { useDraftPersistence } from "./useDraftPersistence";

import { createDraft, type Draft } from "@/utils/drafts";
import { writeEditingCache, recoverEditingCache } from "@/utils/editing-cache";
import { clearPublishedDraft } from "@/utils/publish-cleanup";
import { deleteLocalDraft } from "@/utils/delete-draft";
export function useDraftWorkspace(accountId: string, mode: "edit" | "manage") {
  const draftKey = `aimcc.admin.drafts.${accountId}`;
  const cacheKey = `aimcc.admin.edit-cache.${accountId}`;
  const state = useDraftState(mode);
  useDraftPersistence(state, accountId, mode);
  const {
    recovery,
    setRecovery,
    cacheError,
    setCacheError,
    lastCached,
    store,
    setStore,
    setEditorDraft,
    editingStarted,
    setEditingStarted,
    draft,
    loaded,
    saveStatus,
    setSaveStatus,
    message,
    setMessage,
    storageError,
    setStorageError,
    validation,
    setValidation,
    lastSaved,
  } = state;
  function cacheDraft(updated: Draft) {
    // Cache in the same input event: closing the page before effects run
    // must not lose the latest keystroke or article metadata.
    try {
      if (localStorage.getItem(cacheKey) !== lastCached.current) {
        throw new Error("另一标签页已更新编辑缓存");
      }
      writeEditingCache(localStorage, cacheKey, updated);
      lastCached.current = localStorage.getItem(cacheKey);
      setCacheError(false);
    } catch {
      setCacheError(true);
    }
    setRecovery(null);
  }

  function setDraft(value: Draft) {
    const updated = { ...value, updatedAt: new Date().toISOString() };
    cacheDraft(updated);
    setEditorDraft(updated);
    setEditingStarted(true);
    setStore((current) => ({
      ...current,
      activeId: updated.id,
      drafts: current.drafts.some((item) => item.id === updated.id)
        ? current.drafts.map((item) =>
            item.id === updated.id ? updated : item,
          )
        : [updated, ...current.drafts],
    }));
    setValidation(null);
  }

  function addDraft(value = createDraft()) {
    const url = new URL(window.location.href);
    url.searchParams.delete("draft");
    window.history.replaceState(null, "", url);
    setEditorDraft(value);
    setEditingStarted(true);
    cacheDraft(value);
    setStore((current) => ({
      ...current,
      activeId: value.id,
      drafts: [value, ...current.drafts],
    }));
    setValidation(null);
  }

  function openEditor(id?: string) {
    if (!loaded || storageError) return;
    const next = id
      ? { ...store, activeId: id }
      : (() => {
          const value = createDraft();
          return {
            ...store,
            activeId: value.id,
            drafts: [value, ...store.drafts],
          };
        })();
    try {
      if (localStorage.getItem(draftKey) !== lastSaved.current)
        throw new Error("conflict");
      const saved = JSON.stringify(next);
      localStorage.setItem(draftKey, saved);
      lastSaved.current = saved;
      cacheDraft(next.drafts.find((item) => item.id === next.activeId)!);
      window.location.assign(
        id ? `/publish/?draft=${encodeURIComponent(id)}` : "/publish/",
      );
    } catch {
      setStorageError(true);
      setSaveStatus("无法安全保存草稿，请刷新后重试；当前内容已保留。");
    }
  }

  function deleteDraft(id: string) {
    try {
      const cleaned = deleteLocalDraft(
        localStorage,
        draftKey,
        cacheKey,
        id,
        lastSaved.current,
        lastCached.current,
      );
      lastSaved.current = cleaned.saved;
      lastCached.current = cleaned.cached;
      setStore(cleaned.store);
      setMessage("本地草稿及编辑缓存已删除。");
    } catch (cause) {
      setStorageError(true);
      setSaveStatus(
        cause instanceof Error ? cause.message : "删除失败，请刷新后重试。",
      );
    }
  }
  function finishPublication(id: number) {
    const published = { ...draft, publishedArticleId: id };
    setEditorDraft(published);
    setEditingStarted(false);
    setRecovery(null);
    setValidation(null);
    try {
      const cleaned = clearPublishedDraft(
        localStorage,
        draftKey,
        cacheKey,
        published,
      );
      lastSaved.current = cleaned.saved;
      lastCached.current = cleaned.cached;
      setStore(cleaned.store);
      setCacheError(false);
      setStorageError(false);
      setSaveStatus("已发布 · 本地草稿已清理");
      setMessage("文章发布成功，本地草稿及编辑缓存已清理。");
      const url = new URL(window.location.href);
      url.searchParams.delete("draft");
      window.history.replaceState(null, "", url);
    } catch (cause) {
      setStorageError(true);
      setCacheError(true);
      setSaveStatus("文章已发布，本地清理未完成");
      throw new Error(
        cause instanceof Error
          ? `文章已发布，请勿重复发布。${cause.message}`
          : "文章已发布，但本地草稿清理失败，请在文章管理中核对。",
      );
    }
  }
  function restoreDraft() {
    if (!recovery) return;
    const restored = recoverEditingCache(store, recovery);
    const recovered = restored.drafts.find(
      (item) => item.id === restored.activeId,
    )!;
    cacheDraft(recovered);
    setEditorDraft(recovered);
    setEditingStarted(true);
    setStore(restored);
    setRecovery(null);
    setValidation(null);
    setMessage("已恢复草稿，可继续写作。");
  }
  return {
    draft,
    store,
    loaded,
    saveStatus,
    message,
    setMessage,
    storageError,
    cacheError,
    recovery,
    setRecovery,
    validation,
    setValidation,
    editingStarted,
    setDraft,
    addDraft,
    openEditor,
    deleteDraft,
    finishPublication,
    restoreDraft,
  };
}
