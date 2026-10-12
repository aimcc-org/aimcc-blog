import type { DraftManagerProps } from "../types";
import { filterDrafts } from "@/components/drafts/DraftManager/utils/filter-drafts";
import DraftTable from "@/components/drafts/DraftTable";
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
  Typography,
} from "antd";

export default function DraftManager({
  store,
  disabled,
  saveStatus,
  message,
  onNew,
  onEdit,
  onDelete,
}: DraftManagerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const drafts = store.drafts.filter((item) => !item.deletedAt);
  const categories = [
    ...new Set(drafts.map((item) => item.category.trim()).filter(Boolean)),
  ];
  const rows = filterDrafts(drafts, query, category, sort);
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
        <DraftTable
          rows={rows}
          disabled={disabled}
          onEdit={onEdit}
          onDelete={onDelete}
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
