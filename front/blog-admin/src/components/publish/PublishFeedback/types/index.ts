import type { PublishWorkspace } from "@/types/editor";
export interface PublishFeedbackProps {
  editor: Pick<
    PublishWorkspace,
    | "cacheError"
    | "publishError"
    | "message"
    | "draft"
    | "validation"
    | "recovery"
    | "setRecovery"
    | "restoreDraft"
  >;
}
