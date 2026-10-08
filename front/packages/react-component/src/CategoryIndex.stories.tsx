import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryIndex } from "./CategoryIndex.js";
import {
  sidebarProfile,
  categoryIndex,
} from "../.storybook/sidebar-fixtures.js";
const meta = {
  title: "Blog/Category/CategoryIndex",
  component: CategoryIndex,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "280px" }}>
        <Story />
      </div>
    ),
  ],
  args: { categories: categoryIndex },
} satisfies Meta<typeof CategoryIndex>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Empty: Story = { args: { categories: [] } };
export const WithoutLinks: Story = {
  args: { categories: categoryIndex.map(({ href, ...item }) => item) },
};
export const LongNames: Story = {
  args: {
    categories: [
      { name: "前端开发、设计工程与智能协作的长期实践", count: 128 },
      { name: "AI", count: 0 },
    ],
  },
};
