import type { PublishFeedbackProps } from "../types";
import { Alert, Button, Space } from "antd";

import { blogUrl } from "@/config";

export default function PublishFeedback({ editor }: PublishFeedbackProps) {
  const {
    cacheError,
    publishError,
    message,
    draft,
    validation,
    recovery,
    setRecovery,
    restoreDraft,
  } = editor;
  return (
    <>
      {cacheError && (
        <Alert
          type="warning"
          showIcon
          title="编辑缓存不可用或已被其他标签页更新，请导出 Markdown 备份；原有缓存已保留。"
        />
      )}
      {publishError && <Alert type="error" showIcon title={publishError} />}
      {message && <Alert type="success" showIcon title={message} />}
      {draft.publishedArticleId && (
        <Alert
          type="success"
          title={
            <a href={`${blogUrl}/article/?id=${draft.publishedArticleId}`}>
              查看已发布文章
            </a>
          }
        />
      )}
      {validation && (
        <Alert
          type={validation.length ? "error" : "success"}
          title={
            validation.length ? validation.join("；") : "文章信息检查通过。"
          }
        />
      )}
      {recovery && (
        <Alert
          type="info"
          title="有一篇未完成的草稿"
          description={recovery.title || "未命名文章"}
          action={
            <Space>
              <Button onClick={() => setRecovery(null)}>暂不恢复</Button>
              <Button type="primary" onClick={restoreDraft}>
                恢复草稿
              </Button>
            </Space>
          }
        />
      )}
    </>
  );
}
