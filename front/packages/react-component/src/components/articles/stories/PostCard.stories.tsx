import type { Meta, StoryObj } from "@storybook/react-vite";
import { PostCard } from "../components/PostCard.js";

const meta = {
  title: "Blog/Cards/PostCard",
  component: PostCard,
  tags: ["autodocs"],
  args: {
    href: "/article/?id=1",
    post: {
      title: "构建一个可复用的博客组件库",
      description: "用 React 与 Storybook 独立开发组件，再接入 Astro 页面。",
      publishedAt: "2026-10-08T00:00:00.000Z",
      category: "前端",
      tags: ["React", "Storybook", "Astro"],
      wordCount: 1200,
      readingTime: 4,
    },
  },
} satisfies Meta<typeof PostCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithCover: Story = {
  args: {
    post: {
      ...meta.args.post,
      cover: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#087cff"/><circle cx="400" cy="150" r="120" fill="#00c7ff"/></svg>')}`,
    },
  },
};
export const Minimal: Story = {
  args: { post: { title: "一篇短文", publishedAt: "2026-10-08", tags: [] } },
};
export const LongContent: Story = {
  args: {
    post: {
      ...meta.args.post,
      title: "从页面组件到公共组件库：构建可复用、可调试的前端界面",
      description: "这是一段用于检查长文本截断和卡片布局的描述。".repeat(12),
    },
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Dark: Story = { globals: { theme: "dark" } };

export const CardGrid: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        gap: 20,
        maxWidth: 1200,
      }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <PostCard
          {...args}
          post={{ ...args.post, cover: WithCover.args!.post!.cover }}
          index={index}
          key={index}
        />
      ))}
    </div>
  ),
};
