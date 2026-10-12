import "../styles/index.css";
import type { CoverSettingsProps } from "../types";
import { coverText } from "@/components/editor/CoverSettings/utils/cover";
import { useEffect, useState } from "react";
import { Button, Form, Input, Space, Typography } from "antd";
import { isSafeCover } from "@/utils/drafts";
export default function CoverSettings({
  value,
  disabled,
  failed,
  onChange,
  onError,
}: CoverSettingsProps) {
  const [text, setText] = useState(() => coverText(value));
  useEffect(() => setText(coverText(value)), [value]);
  return (
    <>
      <Form.Item label="封面图片">
        <div className="cover-preview">
          {value && isSafeCover(value) && !failed ? (
            <img src={value} alt="封面预览" onError={onError} />
          ) : (
            <Space orientation="vertical" align="center">
              <Button disabled title="图片上传暂未开放">
                上传图片（暂未开放）
              </Button>
              <Typography.Text type={value ? "danger" : "secondary"}>
                {value
                  ? "图片无法加载，请检查地址"
                  : "建议尺寸 1200 × 630，可生成封面或填写图片地址"}
              </Typography.Text>
            </Space>
          )}
        </div>
      </Form.Item>
      <Form.Item label="封面文字">
        <Space.Compact style={{ width: "100%" }}>
          <Input
            value={text}
            maxLength={100}
            disabled={disabled}
            placeholder="例如：YAML、Spring Boot"
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            disabled={disabled || !text.trim()}
            onClick={() =>
              onChange(
                `https://placehold.co/1200x630?${new URLSearchParams({ text: text.trim() })}`,
              )
            }
          >
            生成封面
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item label="图片地址">
        <Input
          value={value}
          disabled={disabled}
          placeholder="https://…"
          onChange={(e) => onChange(e.target.value)}
        />
      </Form.Item>
      {value && (
        <Button size="small" disabled={disabled} onClick={() => onChange("")}>
          移除封面
        </Button>
      )}
    </>
  );
}
