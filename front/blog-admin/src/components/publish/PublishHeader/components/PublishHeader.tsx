import "../styles/index.css";
import type { PublishHeaderProps } from "../types";
import { Button, Dropdown, Space, Typography } from "antd";

import { validateDraft } from "@/utils/drafts";

export default function PublishHeader({ editor }: PublishHeaderProps) {
  const {
    draft,
    storageError,
    editingStarted,
    saveStatus,
    loaded,
    publishing,
    importing,
    addDraft,
    setMessage,
    setPublishError,
    disabled,
    fileInput,
    setValidation,
    download,
    taxonomyStatus,
    publish,
    loadFile,
  } = editor;
  return (
    <>
      <header className="publish-header">
        <div>
          <Typography.Title level={4}>发布文章</Typography.Title>
          <Typography.Text type={storageError ? "danger" : "secondary"}>
            {editingStarted || draft.publishedArticleId || storageError
              ? saveStatus
              : "新文章 · 输入后自动保存"}
          </Typography.Text>
        </div>
        <Space wrap>
          <Button href="/">管理草稿</Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "new",
                  label: "新建文章",
                  disabled: !loaded || publishing || storageError || importing,
                  onClick: () => {
                    addDraft();
                    setMessage("");
                    setPublishError("");
                  },
                },
                {
                  key: "import",
                  label: "导入 Markdown",
                  disabled: disabled || storageError || importing,
                  onClick: () => fileInput.current?.click(),
                },
                {
                  key: "check",
                  label: "检查文章",
                  disabled: disabled,
                  onClick: () => setValidation(validateDraft(draft)),
                },
                {
                  key: "export",
                  label: "导出 Markdown",
                  disabled: !loaded || publishing,
                  onClick: download,
                },
              ],
            }}
          >
            <Button loading={importing}>更多操作</Button>
          </Dropdown>
          <Button
            type="primary"
            loading={publishing}
            disabled={disabled || importing || taxonomyStatus !== "ready"}
            onClick={() => void publish()}
          >
            {draft.publishedArticleId ? "已发布" : "发布文章"}
          </Button>
        </Space>
      </header>
      <input
        ref={fileInput}
        type="file"
        accept=".md,.markdown,text/markdown"
        hidden
        aria-label="选择 Markdown 文件"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void loadFile(file);
        }}
      />
    </>
  );
}
