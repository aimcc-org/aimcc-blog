import type { PublishPageProps } from "../types";
import { Typography } from "antd";
import { usePublishWorkspace } from "@/pages/PublishPage/hooks/usePublishWorkspace";
import PublishHeader from "@/components/publish/PublishHeader";
import PublishFeedback from "@/components/publish/PublishFeedback";
import ArticleInformation from "@/components/publish/ArticleInformation";
import WritingPanels from "@/components/publish/WritingPanels";
import ArticleOutline from "@/components/publish/ArticleOutline";
import "../styles/publish.css";
export default function PublishPage({ accountId }: PublishPageProps) {
  const editor = usePublishWorkspace(accountId);
  return (
    <div className="publish-page">
      <PublishHeader editor={editor} />
      <PublishFeedback editor={editor} />
      <ArticleInformation editor={editor} />
      <WritingPanels editor={editor} />
      <ArticleOutline editor={editor} />
      <Typography.Text type="secondary">
        公开发布 · 发布成功后自动清理当前本地草稿和编辑缓存
      </Typography.Text>
    </div>
  );
}
