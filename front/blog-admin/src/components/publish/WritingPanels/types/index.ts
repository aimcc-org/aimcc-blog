import type { PublishWorkspace } from "@/types/editor";
export interface WritingPanelsProps {
  editor: Pick<
    PublishWorkspace,
    | "previewOnly"
    | "setPreviewOnly"
    | "disabled"
    | "draft"
    | "setDraft"
    | "wordCount"
    | "coverFailed"
    | "setCoverFailed"
    | "previewWidth"
    | "setPreviewWidth"
  >;
}
