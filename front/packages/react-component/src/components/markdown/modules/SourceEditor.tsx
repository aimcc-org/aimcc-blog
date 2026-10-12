import { useRef } from "react";
import { Button } from "../../ui/button/components/button.js";
import { Textarea } from "../../ui/textarea/components/textarea.js";
import {
  applyEditorCommand,
  editorCommands,
  type EditorCommand,
} from "../utils/editor-commands.js";

interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
  height: number;
}

export default function SourceEditor({
  value,
  onChange,
  disabled,
  placeholder,
  height,
}: SourceEditorProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  const apply = (command: EditorCommand) => {
    const textarea = input.current;
    if (disabled || !textarea) return;
    const result = applyEditorCommand(
      value,
      textarea.selectionStart,
      textarea.selectionEnd,
      command,
    );
    textarea.focus();
    textarea.setSelectionRange(result.from, result.to);
    // Native insertion preserves undo history where the browser supports it.
    if (!document.execCommand?.("insertText", false, result.insertion)) {
      textarea.setRangeText(result.insertion, result.from, result.to, "end");
      onChange(result.value);
    }
    requestAnimationFrame(() =>
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd),
    );
  };
  return (
    <div>
      <div
        className="markdown-source__toolbar"
        role="toolbar"
        aria-label="Markdown 格式工具"
      >
        {editorCommands.map((command) => (
          <Button
            key={command.label}
            type="button"
            variant="ghost"
            size="icon-sm"
            className="markdown-source__command"
            disabled={disabled}
            aria-label={`插入${command.label}`}
            title={`${command.label}${command.shortcut ? ` (Ctrl/⌘ + ${command.shortcut})` : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => apply(command)}
          >
            <span aria-hidden="true">{command.icon}</span>
          </Button>
        ))}
      </div>
      <Textarea
        ref={input}
        value={value}
        onChange={(event) => {
          if (!disabled) onChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (
            !(event.ctrlKey || event.metaKey) ||
            event.altKey ||
            event.shiftKey
          )
            return;
          const command = editorCommands.find(
            (item) => item.shortcut === event.key.toLowerCase(),
          );
          if (!command) return;
          event.preventDefault();
          apply(command);
        }}
        aria-label="Markdown 正文"
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        className="markdown-source__input"
        style={{ height: Math.max(320, height) }}
      />
    </div>
  );
}
