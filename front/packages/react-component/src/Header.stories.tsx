import type { Meta, StoryObj } from "@storybook/react-vite";
import { Header } from "./Header.js";

const meta = {
  title: "Blog/Header",
  component: Header,
  tags: ["autodocs"],
  args: {
    title: "AIMCC Blog",
    links: [
      { href: "/", label: "首页", active: true },
      { href: "/archive/", label: "归档" },
      { href: "/about/", label: "关于" },
    ],
  },
} satisfies Meta<typeof Header>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithActions: Story = {
  args: {
    actions: (
      <button type="button" onClick={() => alert("搜索操作由宿主提供")}>
        搜索
      </button>
    ),
  },
};
export const LongTitle: Story = {
  args: { title: "AIMCC · 前端开发与设计工程的个人博客" },
};

export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Dark: Story = { globals: { theme: "dark" } };
