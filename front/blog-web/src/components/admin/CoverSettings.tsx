import { useEffect, useState } from "react";
import { isSafeCover } from "@/lib/admin-drafts";
import AdminIcon from "./AdminIcon";

function coverText(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "placehold.co"
      ? (url.searchParams.get("text") ?? "")
      : "";
  } catch {
    return "";
  }
}

export default function CoverSettings({
  value,
  disabled,
  failed,
  onChange,
  onError,
}: {
  value: string;
  disabled: boolean;
  failed: boolean;
  onChange: (value: string) => void;
  onError: () => void;
}) {
  const [text, setText] = useState(() => coverText(value));
  useEffect(() => setText(coverText(value)), [value]);

  return (
    <section className="admin-cover-settings" aria-label="封面图设置">
      <h3>封面图</h3>
      <div className="admin-cover-layout">
        <div className="admin-cover-frame">
          {value && isSafeCover(value) && !failed ? (
            <img src={value} alt="封面预览" onError={onError} />
          ) : (
            <div>
              <AdminIcon name="file" />
              <span>
                {failed || (value && !isSafeCover(value))
                  ? "图片无法加载，请检查地址"
                  : "输入文字，生成文章封面"}
              </span>
              <small>1200 × 630</small>
            </div>
          )}
        </div>
        <div className="admin-cover-controls">
          <label htmlFor="cover-text">封面文字</label>
          <div className="admin-cover-generator">
            <input
              id="cover-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="例如：YAML、Spring Boot"
              maxLength={100}
              disabled={disabled}
            />
            <button
              type="button"
              className="admin-button"
              disabled={disabled || !text.trim()}
              onClick={() =>
                onChange(
                  `https://placehold.co/1200x630?${new URLSearchParams({ text: text.trim() })}`,
                )
              }
            >
              生成封面
            </button>
          </div>
          <label htmlFor="cover-url">图片地址</label>
          <input
            id="cover-url"
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://placehold.co/1200x630?text=YAML"
            disabled={disabled}
          />
          <div className="admin-cover-actions">
            <button
              type="button"
              className="admin-button"
              disabled
              title="图片上传暂未开放"
            >
              上传图片（暂未开放）
            </button>
            {value && (
              <button
                type="button"
                className="admin-button"
                disabled={disabled}
                onClick={() => onChange("")}
              >
                移除封面
              </button>
            )}
          </div>
          <p>支持 placehold.co 文字图片链接，也可直接粘贴图片地址。</p>
        </div>
      </div>
    </section>
  );
}
