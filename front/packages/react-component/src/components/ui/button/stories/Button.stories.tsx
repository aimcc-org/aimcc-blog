import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../components/button.js";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "操作按钮" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Disabled: Story = { args: { disabled: true } };
export const Dark: Story = { globals: { theme: "dark" } };
export const Link: Story = {
  render: () => (
    <Button asChild variant="link">
      <a href="#example">查看详情</a>
    </Button>
  ),
};
