import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../button/components/button.js";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../components/collapsible.js";
const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
} satisfies Meta<typeof Collapsible>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button variant="outline">简介与标签</Button>
      </CollapsibleTrigger>
      <CollapsibleContent>保留独立展开状态。</CollapsibleContent>
    </Collapsible>
  ),
};
