import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "../components/textarea.js";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { "aria-label": "正文", placeholder: "请输入正文" },
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true, value: "只读内容" } };
export const Dark: Story = { globals: { theme: "dark" } };
