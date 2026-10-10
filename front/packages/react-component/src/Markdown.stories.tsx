import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MarkdownReader } from "./MarkdownReader";
import { MarkdownEditor } from "./MarkdownEditor";
import "./markdown-editor.css";

const source = `## Markdown 写作\n\n用 **文字** 记录想法，支持 [链接](https://example.com)、~~删除线~~ 与表格。\n\n> 编辑预览与文章阅读使用同一套样式。\n\n- [x] 阅读组件\n- [ ] 完成文章\n\n| 功能 | 支持 |\n| --- | --- |\n| GFM | ✓ |\n\n\`\`\`typescript\nconst idea = 'Hello, world!';\n\`\`\`\n`;
const meta = {
  title: "Content/Markdown",
  component: MarkdownReader,
  args: { source },
  parameters: { layout: "padded" },
} satisfies Meta<typeof MarkdownReader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Reader: Story = {};
export const Dark: Story = {
  decorators: [
    (Story) => (
      <div
        className="aimcc-theme-dark"
        style={{ background: "var(--color-bg)", padding: 24 }}
      >
        <Story />
      </div>
    ),
  ],
};
function EditorDemo() {
  const [value, setValue] = useState(source);
  return <MarkdownEditor value={value} onChange={setValue} />;
}
export const Editor: Story = { render: () => <EditorDemo /> };
export const DarkEditor: Story = { ...Dark, render: () => <EditorDemo /> };
export const PreviewOnly: Story = {
  render: () => (
    <MarkdownEditor value={source} onChange={() => {}} previewOnly />
  ),
};
export const Disabled: Story = {
  render: () => <MarkdownEditor value={source} onChange={() => {}} disabled />,
};
