import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback } from "../components/avatar.js";
const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { children: <AvatarFallback>AI</AvatarFallback> },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
