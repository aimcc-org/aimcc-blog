import type { DraftTableProps } from "../types";
import {
  Button,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { isSafeCover, type Draft } from "@/utils/drafts";
export default function DraftTable({
  rows,
  disabled,
  onEdit,
  onDelete,
}: DraftTableProps) {
  return (
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
  );
}
