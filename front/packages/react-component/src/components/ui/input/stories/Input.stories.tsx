import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../components/input.js";
const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: { "aria-label": "输入内容", placeholder: "输入内容" },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
