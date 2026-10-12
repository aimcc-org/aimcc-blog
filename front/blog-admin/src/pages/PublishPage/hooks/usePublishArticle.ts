import { useRef, useState } from "react";
import { articleService } from "@/services/articles";
import { AdminApiError } from "@/services/request";
import { articlePayload, type ArticleTaxonomy } from "@/utils/publishing";
import type { useDraftWorkspace } from "@/hooks/useDraftWorkspace";
export function usePublishArticle(
  workspace: ReturnType<typeof useDraftWorkspace>,
  taxonomy: ArticleTaxonomy,
  taxonomyStatus: string,
) {
  const { draft, loaded, setMessage, finishPublication } = workspace;
  const [publishing, setPublishing] = useState(false);
  const publishingLock = useRef(false);
  const [publishError, setPublishError] = useState("");
  async function publish() {
    if (
      publishingLock.current ||
      !loaded ||
      taxonomyStatus !== "ready" ||
      draft.publishedArticleId
    )
      return;
    setPublishError("");
    setMessage("");
    try {
      articlePayload(draft, taxonomy);
    } catch (cause) {
      setPublishError(
        cause instanceof Error ? cause.message : "请检查文章信息",
      );
      return;
    }
    publishingLock.current = true;
    setPublishing(true);
    try {
      const id = await articleService.publish(draft, taxonomy);
      try {
        finishPublication(id);
      } catch (cause) {
        setPublishError(
          cause instanceof Error
            ? cause.message
            : "文章已发布，但本地清理失败。",
        );
      }
    } catch (cause) {
      setPublishError(
        cause instanceof AdminApiError && cause.code === 401
          ? "登录已过期，请重新登录后发布；本地草稿已保留。"
          : cause instanceof AdminApiError
            ? cause.message
            : "未能确认发布结果，请先查看博客确认是否已发布，再决定是否重试；本地草稿已保留。",
      );
    } finally {
      publishingLock.current = false;
      setPublishing(false);
    }
  }

  return { publishing, publishError, setPublishError, publish };
}
