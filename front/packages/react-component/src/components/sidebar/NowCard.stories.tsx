import type { Meta, StoryObj } from "@storybook/react-vite";
import { NowCard } from "./NowCard.js";
const meta = {
  title: "Blog/Cards/NowCard",
  component: NowCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "AIMCC\nAI LAB.",
    description: "记录正在发生的智能协作实验，将想法变成可以使用的产品。",
    activities: ["探索 Agent 与工作流", "构建个人知识系统", "打磨博客与组件库"],
  },
} satisfies Meta<typeof NowCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Minimal: Story = {
  args: { description: undefined, activities: [] },
};
export const LongContent: Story = {
  args: {
    title: "持续探索前端与智能协作的可能性",
    activities: [
      "设计一个足够长的动态条目，验证内容换行时卡片是否保持自然的阅读节奏",
    ],
  },
};
