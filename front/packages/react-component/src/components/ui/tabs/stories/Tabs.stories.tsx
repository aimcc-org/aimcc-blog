import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/tabs.js";
const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="drafts">
      <TabsList aria-label="文章类型">
        <TabsTrigger value="drafts">草稿</TabsTrigger>
        <TabsTrigger value="trash">回收站</TabsTrigger>
      </TabsList>
      <TabsContent value="drafts">草稿内容</TabsContent>
      <TabsContent value="trash">回收站内容</TabsContent>
    </Tabs>
  ),
};
export const Dark: Story = { ...Default, globals: { theme: "dark" } };
