import "../styles/index.css";
import type { ArticleInformationProps } from "../types";
import {
  Select,
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  Row,
  Typography,
} from "antd";

import CoverSettings from "@/components/editor/CoverSettings";

export default function ArticleInformation({
  editor,
}: ArticleInformationProps) {
  const {
    draft,
    disabled,
    setDraft,
    selection,
    taxonomy,
    taxonomyStatus,
    setTaxonomyAttempt,
    coverFailed,
    setCoverFailed,
  } = editor;
  return (
    <>
      <Card title="文章信息" size="small" className="publish-information">
        <Form layout="vertical" className="publish-form">
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={9} className="publish-information-section">
              <Form.Item label="文章标题" required>
                <Input
                  placeholder="请输入文章标题…"
                  value={draft.title}
                  maxLength={200}
                  showCount
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </Form.Item>
              <Form.Item label="文章摘要">
                <Input.TextArea
                  rows={3}
                  placeholder="用一段话描述这篇文章的主要内容…"
                  value={draft.description}
                  maxLength={500}
                  showCount
                  disabled={disabled}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={7} className="publish-information-section">
              <Form.Item label="分类">
                <Select
                  aria-label="文章分类"
                  allowClear
                  placeholder="请选择分类"
                  value={selection.categoryId ?? undefined}
                  disabled={disabled || taxonomyStatus !== "ready"}
                  options={taxonomy.categories.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onChange={(categoryId) =>
                    setDraft({
                      ...draft,
                      categoryId: categoryId ?? null,
                      category:
                        taxonomy.categories.find(
                          (item) => item.id === categoryId,
                        )?.name ?? "",
                    })
                  }
                />
                {draft.category &&
                  !taxonomy.categories.some(
                    (item) => item.id === selection.categoryId,
                  ) && (
                    <Typography.Text type="warning">
                      原分类：{draft.category}（请重新选择）
                    </Typography.Text>
                  )}
              </Form.Item>
              <Form.Item label="标签（可多选）">
                <Select
                  aria-label="文章标签"
                  placeholder="请选择标签"
                  mode="multiple"
                  allowClear
                  value={selection.tagIds}
                  disabled={disabled || taxonomyStatus !== "ready"}
                  options={taxonomy.tags.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onClear={() => setDraft({ ...draft, tags: "", tagIds: [] })}
                  onChange={(tagIds) =>
                    setDraft({
                      ...draft,
                      tagIds,
                      tags: taxonomy.tags
                        .filter((item) => tagIds.includes(item.id))
                        .map((item) => item.name)
                        .join(", "),
                    })
                  }
                />

                {draft.tags &&
                  (draft.tagIds === undefined ||
                    selection.tagIds.some(
                      (id) => !taxonomy.tags.some((tag) => tag.id === id),
                    )) && (
                    <Typography.Text type="warning">
                      原草稿标签：{draft.tags}。请核对后选择。
                    </Typography.Text>
                  )}
              </Form.Item>
              {taxonomyStatus === "loading" && (
                <Typography.Text>正在加载分类和标签…</Typography.Text>
              )}
              {taxonomyStatus === "error" && (
                <Alert
                  type="error"
                  title="分类或标签加载失败"
                  action={
                    <Button
                      onClick={() => setTaxonomyAttempt((value) => value + 1)}
                    >
                      重新加载
                    </Button>
                  }
                />
              )}
            </Col>
            <Col xs={24} md={12} lg={8} className="publish-information-section">
              <Collapse
                ghost
                size="small"
                defaultActiveKey={["advanced"]}
                items={[
                  {
                    key: "advanced",
                    label: "封面设置",
                    children: (
                      <>
                        <CoverSettings
                          value={draft.cover}
                          disabled={disabled}
                          failed={coverFailed}
                          onChange={(cover) => setDraft({ ...draft, cover })}
                          onError={() => setCoverFailed(true)}
                        />
                      </>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
}
