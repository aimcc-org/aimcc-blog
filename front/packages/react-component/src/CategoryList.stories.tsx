import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryList } from "./CategoryList.js";

const meta = {
  title: "Blog/Category/CategoryList",
  component: CategoryList,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    categories: [
      { name: "前端开发", count: 12 },
      { name: "AI / LLM", count: 8 },
      { name: "工程实践", count: 6 },
      { name: "生活随笔", count: 3 },
    ],
  },
} satisfies Meta<typeof CategoryList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithLinks: Story = {
  args: {
    categories: [
      {
        name: "前端开发",
        count: 12,
        href: "/categories/frontend/",
        active: true,
      },
      { name: "AI / LLM", count: 8, href: "/categories/ai/" },
      { name: "工程实践", count: 6, href: "/categories/engineering/" },
    ],
  },
};
export const WithoutCounts: Story = {
  args: { categories: [{ name: "前端开发" }, { name: "AI / LLM" }] },
};
export const Empty: Story = { args: { categories: [] } };
export const LongNames: Story = {
  args: {
    categories: [
      { name: "前端工程化与人工智能应用开发实践", count: 128 },
      { name: "AReallyLongUnbrokenCategoryNameForLayoutTesting", count: 0 },
    ],
  },
};
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Dark: Story = { globals: { theme: "dark" } };
