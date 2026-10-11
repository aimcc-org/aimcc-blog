import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuickLinks } from "./QuickLinks.js";
const meta = {
  title: "Blog/Cards/QuickLinks",
  component: QuickLinks,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: "QUICK LINKS",
    links: [
      { label: "电子简历", href: "/about/" },
      {
        label: "GitHub",
        href: "https://github.com/aimcc-org/aimcc-blog",
        external: true,
      },
      { label: "关于我", href: "/about/" },
      { label: "文章归档", href: "/archive/" },
    ],
  },
} satisfies Meta<typeof QuickLinks>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Empty: Story = { args: { links: [] } };
export const LongLabels: Story = {
  args: {
    links: [{ label: "查看我的项目、研究与工程实践记录", href: "#projects" }],
  },
};
