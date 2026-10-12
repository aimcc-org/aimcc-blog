import type { PublishWorkspace } from "@/types/editor";
export interface ArticleInformationProps {
  editor: Pick<
    PublishWorkspace,
    | "draft"
    | "disabled"
    | "setDraft"
    | "selection"
    | "taxonomy"
    | "taxonomyStatus"
    | "setTaxonomyAttempt"
    | "coverFailed"
    | "setCoverFailed"
  >;
}
