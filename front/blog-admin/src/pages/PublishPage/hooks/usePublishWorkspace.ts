import { useEffect, useState } from "react";
import { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
import { useTaxonomy } from "./useTaxonomy";
import { usePublishArticle } from "./usePublishArticle";
import { useMarkdownFiles } from "./useMarkdownFiles";
import { draftTaxonomy } from "@/utils/publishing";
export function usePublishWorkspace(accountId: string) {
  const workspace = useDraftWorkspace(accountId, "edit");
  const taxonomy = useTaxonomy();
  const publishing = usePublishArticle(
    workspace,
    taxonomy.taxonomy,
    taxonomy.taxonomyStatus,
  );
  const files = useMarkdownFiles(workspace);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [previewWidth, setPreviewWidth] = useState("desktop");
  useEffect(() => setCoverFailed(false), [workspace.draft.cover]);
  return {
    ...workspace,
    ...taxonomy,
    ...publishing,
    ...files,
    previewOnly,
    setPreviewOnly,
    coverFailed,
    setCoverFailed,
    previewWidth,
    setPreviewWidth,
    selection: draftTaxonomy(workspace.draft, taxonomy.taxonomy),
    wordCount: workspace.draft.content.replace(/\s/g, "").length,
    disabled:
      !workspace.loaded ||
      publishing.publishing ||
      !!workspace.draft.publishedArticleId,
  };
}
