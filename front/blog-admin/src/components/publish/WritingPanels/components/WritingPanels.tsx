import "../styles/index.css";
import type { WritingPanelsProps } from "../types";
import { Button, Card, Col, Row, Segmented, Space, Typography } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { isSafeCover } from "@/utils/drafts";
import { sample } from "@/components/publish/WritingPanels/utils/editor-sample";
import SourceEditor from "@/components/editor/SourceEditor";

export default function WritingPanels({ editor }: WritingPanelsProps) {
  const {
    previewOnly,
    setPreviewOnly,
    disabled,
    draft,
    setDraft,
    wordCount,
    coverFailed,
    setCoverFailed,
    previewWidth,
    setPreviewWidth,
  } = editor;
  return (
    <>
      <Row gutter={[16, 16]} align="stretch">
        {!previewOnly && (
          <Col xs={24} lg={13} className="publish-writing-column">
            <Card
              size="small"
              title="正文"
              className="publish-writing-card"
              extra={
                <Space>
                  <Segmented
                    size="small"
                    options={[
                      { label: "编辑", value: false },
                      { label: "预览", value: true },
                    ]}
                    value={previewOnly}
                    onChange={setPreviewOnly}
                  />
                  <Button
                    size="small"
                    disabled={disabled || !!draft.content}
                    onClick={() => setDraft({ ...draft, content: sample })}
                  >
                    插入示例
                  </Button>
                </Space>
              }
            >
              <SourceEditor
                value={draft.content}
                placeholder={sample}
                disabled={disabled}
                onChange={(content) => setDraft({ ...draft, content })}
              />
              <div className="publish-editor-meta">
                <Typography.Text type="secondary">
                  {wordCount.toLocaleString()} 字 · 预计{" "}
                  {wordCount ? Math.max(1, Math.ceil(wordCount / 400)) : 0}{" "}
                  分钟阅读
                </Typography.Text>
                <Typography.Text type="secondary">
                  支持 Markdown / GFM
                </Typography.Text>
              </div>
            </Card>
          </Col>
        )}
        <Col
          xs={24}
          lg={previewOnly ? 24 : 11}
          className="publish-writing-column"
        >
          <Card
            size="small"
            title="实时预览"
            className="publish-writing-card"
            extra={
              <Space wrap>
                {previewOnly && (
                  <Button size="small" onClick={() => setPreviewOnly(false)}>
                    返回编辑
                  </Button>
                )}
                <Segmented
                  size="small"
                  aria-label="预览尺寸"
                  value={previewWidth}
                  onChange={setPreviewWidth}
                  options={[
                    { value: "desktop", label: "桌面" },
                    { value: "tablet", label: "平板" },
                    { value: "phone", label: "手机" },
                  ]}
                />
              </Space>
            }
          >
            <div className={`markdown-preview preview-${previewWidth}`}>
              {draft.cover && isSafeCover(draft.cover) && !coverFailed && (
                <img
                  src={draft.cover}
                  alt="文章封面"
                  onError={() => setCoverFailed(true)}
                />
              )}
              {draft.title && (
                <Typography.Title>{draft.title}</Typography.Title>
              )}
              <Typography.Text>
                {draft.category} {draft.tags}
              </Typography.Text>
              <Typography.Paragraph>{draft.description}</Typography.Paragraph>
              {!draft.content && (
                <Typography.Text type="secondary">
                  在左侧开始写作，预览会实时更新。
                </Typography.Text>
              )}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {draft.content}
              </ReactMarkdown>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
