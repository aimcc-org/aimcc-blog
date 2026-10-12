import { useRef, useState } from "react";
import {
  createDraft,
  readDraftStore,
  type Draft,
  type DraftStore,
} from "@/utils/drafts";
export function useDraftState(mode: "edit" | "manage") {
  const [recovery, setRecovery] = useState<Draft | null>(null);
  const [cacheError, setCacheError] = useState(false);
  const lastCached = useRef<string | null>(null);
  const [store, setStore] = useState<DraftStore>(() =>
    readDraftStore(null, null),
  );
  const [editorDraft, setEditorDraft] = useState<Draft>(() => createDraft());
  const [editingStarted, setEditingStarted] = useState(false);
  const draft =
    mode === "edit"
      ? editorDraft
      : (store.drafts.find((item) => item.id === store.activeId) ??
        editorDraft);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("正在读取草稿…");
  const [message, setMessage] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [validation, setValidation] = useState<string[] | null>(null);
  const lastSaved = useRef<string | null>(null);

  return {
    recovery,
    setRecovery,
    cacheError,
    setCacheError,
    lastCached,
    store,
    setStore,
    editorDraft,
    setEditorDraft,
    editingStarted,
    setEditingStarted,
    draft,
    loaded,
    setLoaded,
    saveStatus,
    setSaveStatus,
    message,
    setMessage,
    storageError,
    setStorageError,
    validation,
    setValidation,
    lastSaved,
  };
}
