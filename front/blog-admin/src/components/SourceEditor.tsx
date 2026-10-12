import { useRef } from "react";
import { Button, Input, Space } from "antd";
import type { TextAreaRef } from "antd/es/input/TextArea";
import {
  applyEditorCommand,
  editorCommands,
  type EditorCommand,
} from "@/lib/editor-commands";
export default function SourceEditor({
  value,
  onChange,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
}) {
  const input = useRef<TextAreaRef>(null);
  const apply = (command: EditorCommand) => {
    const textarea = input.current?.resizableTextArea?.textArea;
    if (disabled || !textarea) return;
    const result = applyEditorCommand(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
      command,
    );
    textarea.focus();
    textarea.setSelectionRange(result.from, result.to);
    if (!document.execCommand?.("insertText", false, result.insertion))
      onChange(result.value);
    requestAnimationFrame(() =>
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd),
    );
  };
  return (
    <Space orientation="vertical" style={{ width: "100%" }}>
      <Space
        wrap
        size={2}
        className="markdown-toolbar"
        role="toolbar"
        aria-label="Markdown 格式工具"
      >
        {editorCommands.map((command) => (
          <Button
            key={command.label}
            type="text"
            size="small"
            disabled={disabled}
            title={command.label}
            aria-label={`插入${command.label}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply(command)}
          >
            {command.icon}
          </Button>
        ))}
      </Space>
      <Input.TextArea
        ref={input}
        aria-label="Markdown 正文"
        autoSize={{ minRows: 20 }}
        className="markdown-source"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
          const command = editorCommands.find(
            (item) => item.shortcut === e.key.toLowerCase(),
          );
          if (command) {
            e.preventDefault();
            apply(command);
          }
        }}
      />
    </Space>
  );
}
