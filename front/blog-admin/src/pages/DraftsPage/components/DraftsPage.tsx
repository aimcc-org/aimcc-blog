import type { DraftsPageProps } from "../types";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import DraftManager from "@/components/drafts/DraftManager";
export default function DraftsPage({ accountId }: DraftsPageProps) {
  const workspace = useDraftWorkspace(accountId, "manage");
  return (
    <DraftManager
      store={workspace.store}
      disabled={!workspace.loaded || workspace.storageError}
      saveStatus={workspace.saveStatus}
      message={workspace.storageError ? "" : workspace.message}
      onNew={() => workspace.openEditor()}
      onEdit={workspace.openEditor}
      onDelete={workspace.deleteDraft}
    />
  );
}
