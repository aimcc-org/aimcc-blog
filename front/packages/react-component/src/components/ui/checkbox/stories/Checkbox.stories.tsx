import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "../components/checkbox.js";
const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { "aria-label": "选择标签" },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
