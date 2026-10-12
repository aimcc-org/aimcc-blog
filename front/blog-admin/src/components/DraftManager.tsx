import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Popconfirm,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { isSafeCover, type Draft, type DraftStore } from "@/lib/admin-drafts";
interface Props {
  store: DraftStore;
  disabled: boolean;
  saveStatus: string;
  message: string;
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
export default function DraftManager({
  store,
  disabled,
  saveStatus,
  message,
  onNew,
  onEdit,
  onDelete,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const drafts = store.drafts.filter((item) => !item.deletedAt);
  const categories = [
    ...new Set(drafts.map((item) => item.category.trim()).filter(Boolean)),
  ];
  const rows = drafts
    .filter(
      (item) =>
        (!category || item.category.trim() === category) &&
        `${item.title} ${item.description} ${item.tags}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "zh-CN")
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <Space wrap>
        <Typography.Title level={2}>文章管理</Typography.Title>
        <Button type="primary" disabled={disabled} onClick={onNew}>
          新建文章
        </Button>
      </Space>
      <Row gutter={[24, 24]}>
        {[
          { title: "本地草稿", value: drafts.length },
          { title: "文章分类", value: categories.length },
        ].map((item) => (
          <Col xs={24} sm={12} key={item.title}>
            <Card>
              <Statistic {...item} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Input.Search
            aria-label="搜索文章"
            placeholder="搜索标题、摘要或标签"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            aria-label="筛选文章分类"
            style={{ minWidth: 160 }}
            value={category}
            onChange={setCategory}
            options={[
              { value: "", label: "全部分类" },
              ...[
                ...new Set(
                  drafts.map((item) => item.category.trim()).filter(Boolean),
                ),
              ].map((name) => ({ value: name, label: name })),
            ]}
          />
          <Select
            aria-label="文章排序"
            value={sort}
            onChange={setSort}
            options={[
              { value: "latest", label: "最近更新" },
              { value: "title", label: "标题排序" },
            ]}
          />
        </Space>
        <Table<Draft>
          rowKey="id"
          dataSource={rows}
          scroll={{ x: 900 }}
          pagination={false}
          columns={[
            {
              title: "文章",
              key: "article",
              render: (_, item) => (
                <Space>
                  {item.cover && isSafeCover(item.cover) && (
                    <img
                      src={item.cover}
                      alt=""
                      style={{ width: 64, height: 40, objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.hidden = true;
                      }}
                    />
                  )}
                  <div>
                    <Typography.Text strong>
                      {item.title.trim() || "未命名文章"}
                    </Typography.Text>{" "}
                    <Tooltip title="清理浏览器缓存后，本地草稿会丢失，请及时发布或导出备份。">
                      <Tag>本地缓存</Tag>
                    </Tooltip>
                    <Typography.Paragraph>
                      {item.description ||
                        `${item.content.length} 字符 · 尚未添加摘要`}
                    </Typography.Paragraph>
                  </div>
                </Space>
              ),
            },
            {
              title: "分类 / 标签",
              key: "category",
              render: (_, item) => (
                <>
                  <Tag>{item.category || "未分类"}</Tag>
                  <div>{item.tags || "暂无标签"}</div>
                </>
              ),
            },
            {
              title: "状态",
              key: "status",
              render: (_, item) => (
                <Tag>{item.publishedArticleId ? "已发布" : "草稿"}</Tag>
              ),
            },
            {
              title: "最后更新",
              dataIndex: "updatedAt",
              render: (date: string) => new Date(date).toLocaleString("zh-CN"),
            },
            {
              title: "操作",
              key: "actions",
              render: (_, item) => (
                <Space>
                  <Button disabled={disabled} onClick={() => onEdit(item.id)}>
                    继续编辑
                  </Button>
                  <Popconfirm
                    title="删除这篇本地草稿？"
                    description="删除后无法恢复，建议先导出 Markdown 备份。"
                    okText="删除"
                    cancelText="取消"
                    disabled={disabled}
                    onConfirm={() => onDelete(item.id)}
                  >
                    <Button danger disabled={disabled}>
                      删除草稿
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
        <Typography.Text type="secondary">
          共 {rows.length} 篇文章 · 草稿仅保存在当前浏览器
        </Typography.Text>
      </Card>
      <Alert
        type={message ? "success" : "info"}
        title={message || saveStatus}
      />
      <Alert
        type="warning"
        showIcon
        title="草稿自动保存在当前浏览器。清理浏览器缓存后，本地草稿会丢失，请及时发布，也可导出 Markdown 备份。"
      />
    </Space>
  );
}
