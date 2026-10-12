import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../button/components/button.js";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../components/dialog.js";
const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>打开弹层</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>搜索文章</DialogTitle>
        <DialogDescription>主题与焦点管理示例。</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
};
export const Dark: Story = { ...Default, globals: { theme: "dark" } };
