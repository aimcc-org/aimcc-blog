import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { MarkdownReader } from "./MarkdownReader.js";

// Keep editor code and third-party CSS out of reader-only bundles and SSR.
const SourceEditor = lazy(async () => {
  const [{ default: Editor }, commands] = await Promise.all([
    import("@uiw/react-md-editor/nohighlight"),
    import("@uiw/react-md-editor/commands-cn"),
  ]);
  const toolbar = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.hr,
    {
      ...commands.title2,
      icon: <strong>H2</strong>,
      buttonProps: {
        "aria-label": "插入二级标题(ctrl + 2)",
        title: "插入二级标题(ctrl + 2)",
      },
    },
    commands.divider,
    commands.link,
    {
      ...commands.quote,
      buttonProps: {
        "aria-label": "插入引用(ctrl + q)",
        title: "插入引用(ctrl + q)",
      },
    },
    commands.code,
    commands.codeBlock,
    commands.image,
    commands.table,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
  ];
  return {
    default: (props: React.ComponentProps<typeof Editor>) => (
      <Editor {...props} commands={toolbar} />
    ),
  };
});

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  previewOnly?: boolean;
  placeholder?: string;
  height?: number;
  className?: string;
  previewHeader?: ReactNode;
  emptyPreview?: ReactNode;
}

export function MarkdownEditor({
  value,
  onChange,
  disabled = false,
  previewOnly = false,
  placeholder = "开始 Markdown 写作…",
  height = 530,
  className = "",
  previewHeader,
  emptyPreview = "在左侧开始写作，预览会实时更新。",
}: MarkdownEditorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <section
      className={`aimcc-markdown-editor ${className}`.trim()}
      data-preview-only={previewOnly}
      aria-label="Markdown 编辑与预览"
    >
      {!previewOnly && (
        <div className="aimcc-markdown-editor__source">
          <div className="aimcc-markdown-editor__heading">
            <span>Markdown 编辑</span>
            <span>MD</span>
          </div>
          {mounted ? (
            <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
              <SourceEditor
                value={value}
                onChange={(next) => {
                  if (!disabled) onChange(next ?? "");
                }}
                preview="edit"
                extraCommands={[]}
                commandsFilter={(command) => ({
                  ...command,
                  buttonProps: { ...command.buttonProps, disabled },
                })}
                height={height}
                minHeight={320}
                visibleDragbar={false}
                highlightEnable={false}
                textareaProps={{
                  "aria-label": "Markdown 正文",
                  placeholder,
                  disabled,
                  spellCheck: false,
                }}
              />
            </Suspense>
          ) : (
            <p role="status">正在加载编辑器…</p>
          )}
          <div className="aimcc-markdown-editor__footer">
            <span>{value.length} 字符</span>
            <span>支持 Markdown / GFM</span>
          </div>
        </div>
      )}
      <div className="aimcc-markdown-editor__preview">
        <div className="aimcc-markdown-editor__heading">
          <span>文章预览</span>
          <span>● 实时</span>
        </div>
        <article
          className="aimcc-markdown-editor__article"
          aria-label="Markdown 预览"
        >
          {previewHeader}
          {value ? (
            <MarkdownReader source={value} />
          ) : (
            <div className="aimcc-markdown-editor__empty">{emptyPreview}</div>
          )}
        </article>
      </div>
    </section>
  );
}
