import type { Meta, StoryObj } from "@storybook/react-vite";
import { AmbientCard } from "./AmbientCard.js";
const meta = {
  title: "Blog/Cards/AmbientCard",
  component: AmbientCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    image: "/images/ai-workflow-city.png",
    slogan: "IDEAS\nTO\nPRODUCTS.",
  },
} satisfies Meta<typeof AmbientCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const LongSlogan: Story = {
  args: { slogan: "让想法成为产品\n让实践成为记录" },
};
