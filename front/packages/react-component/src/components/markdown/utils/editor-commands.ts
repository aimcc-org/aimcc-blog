export interface EditorCommand {
  label: string;
  icon: string;
  before: string;
  after?: string;
  placeholder?: string;
  shortcut?: string;
  line?: boolean;
}

export const editorCommands: EditorCommand[] = [
  {
    label: "粗体",
    icon: "B",
    before: "**",
    after: "**",
    placeholder: "粗体",
    shortcut: "b",
  },
  {
    label: "斜体",
    icon: "I",
    before: "*",
    after: "*",
    placeholder: "斜体",
    shortcut: "i",
  },
  {
    label: "删除线",
    icon: "S",
    before: "~~",
    after: "~~",
    placeholder: "删除线",
  },
  { label: "分隔线", icon: "—", before: "\n\n---\n\n" },
  {
    label: "二级标题",
    icon: "H2",
    before: "## ",
    placeholder: "标题",
    shortcut: "2",
    line: true,
  },
  {
    label: "链接",
    icon: "↗",
    before: "[",
    after: "](https://)",
    placeholder: "链接文字",
    shortcut: "l",
  },
  {
    label: "引用",
    icon: "❞",
    before: "> ",
    placeholder: "引用",
    shortcut: "q",
    line: true,
  },
  {
    label: "行内代码",
    icon: "</>",
    before: "`",
    after: "`",
    placeholder: "代码",
  },
  {
    label: "代码块",
    icon: "```",
    before: "\n```\n",
    after: "\n```\n",
    placeholder: "代码",
  },
  {
    label: "图片",
    icon: "▧",
    before: "![",
    after: "](https://)",
    placeholder: "图片描述",
  },
  {
    label: "表格",
    icon: "▦",
    before: "\n| 列 1 | 列 2 |\n| --- | --- |\n| 内容 | 内容 |\n",
  },
  {
    label: "无序列表",
    icon: "•",
    before: "- ",
    placeholder: "列表项",
    line: true,
  },
  {
    label: "有序列表",
    icon: "1.",
    before: "1. ",
    placeholder: "列表项",
    line: true,
  },
  {
    label: "任务列表",
    icon: "☑",
    before: "- [ ] ",
    placeholder: "任务",
    line: true,
  },
];

/** Prefix selected lines individually; inline commands wrap the selection. */
export function applyEditorCommand(
  value: string,
  start: number,
  end: number,
  command: EditorCommand,
) {
  const from =
    command.line && start > 0 ? value.lastIndexOf("\n", start - 1) + 1 : start;
  const selected = value.slice(from, end) || command.placeholder || "";
  const insertion = command.line
    ? selected
        .split("\n")
        .map((line) => command.before + line)
        .join("\n")
    : command.before + selected + (command.after ?? "");
  return {
    from,
    to: end,
    insertion,
    value: value.slice(0, from) + insertion + value.slice(end),
    selectionStart: from + command.before.length,
    selectionEnd: command.line
      ? from + insertion.length
      : from + command.before.length + selected.length,
  };
}
