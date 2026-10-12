import type { PublishWorkspace } from "@/types/editor";
export interface PublishHeaderProps {
  editor: Pick<
    PublishWorkspace,
    | "draft"
    | "storageError"
    | "editingStarted"
    | "saveStatus"
    | "loaded"
    | "publishing"
    | "importing"
    | "addDraft"
    | "setMessage"
    | "setPublishError"
    | "disabled"
    | "fileInput"
    | "setValidation"
    | "download"
    | "taxonomyStatus"
    | "publish"
    | "loadFile"
  >;
}
