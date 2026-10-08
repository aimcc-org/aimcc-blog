import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarUserProfile } from "./SidebarUserProfile.js";
import {
  sidebarProfile,
  categoryIndex,
} from "../.storybook/sidebar-fixtures.js";
const meta = {
  title: "Blog/Profile/UserProfile",
  component: SidebarUserProfile,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "280px" }}>
        <Story />
      </div>
    ),
  ],
  args: sidebarProfile,
} satisfies Meta<typeof SidebarUserProfile>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Collapsed: Story = { args: { defaultExpanded: false } };
export const Offline: Story = { args: { online: false } };
export const Minimal: Story = {
  args: {
    role: undefined,
    location: undefined,
    bio: undefined,
    tags: [],
    resumeHref: undefined,
    githubHref: undefined,
    contactHref: undefined,
    online: undefined,
  },
};
export const LongContent: Story = {
  args: {
    name: "AIMCC · 前端开发与设计工程",
    role: "Front-end Developer & AI Application Engineer",
    tags: ["React", "TypeScript", "一个很长的标签用于验证换行"],
  },
};
