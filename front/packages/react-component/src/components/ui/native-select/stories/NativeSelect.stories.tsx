import type { Meta, StoryObj } from "@storybook/react-vite";
import { NativeSelect } from "../components/native-select.js";
const meta = {
  title: "UI/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
  args: {
    "aria-label": "选择分类",
    children: <option value="frontend">前端开发</option>,
  },
} satisfies Meta<typeof NativeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
