import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleTimeline } from "./ArticleTimeline.js";

const meta = {
  title: "Blog/ArticleTimeline",
  component: ArticleTimeline,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "46rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    articles: [
      {
        id: 1,
        title: "用 Storybook 开发通用 React 组件",
        publishedAt: "2026-10-08T16:00:00+08:00",
        summary: "让组件在独立环境中调试，再接入博客页面。",
        tags: ["React", "Storybook"],
        readingMinutes: 5,
      },
      {
        id: 2,
        title: "时间线按天聚合的实现",
        publishedAt: "2026-10-08T09:00:00+08:00",
        summary: "同一天发布的多篇文章集中展示，跨页数据也能合并。",
        tags: ["前端"],
        readingMinutes: 3,
      },
      {
        id: 3,
        title: "文章列表接口与分页",
        publishedAt: "2026-10-07T14:00:00+08:00",
        tags: ["API"],
        readingMinutes: 4,
      },
      {
        id: 4,
        title: "从零搭建个人博客",
        publishedAt: "2026-10-01T10:00:00+08:00",
      },
    ],
  },
} satisfies Meta<typeof ArticleTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { articles: [] } };
export const Loading: Story = { args: { articles: [], loading: true } };
export const Failed: Story = {
  args: {
    articles: [],
    error: "文章加载失败，请稍后重试。",
    onRetry: () => {},
  },
};
export const MorePages: Story = {
  args: { hasMore: true, onLoadMore: () => {} },
};
export const TimeZoneBoundary: Story = {
  args: {
    articles: [
      {
        id: 5,
        title: "UTC 10 月 7 日，北京时间已是 10 月 8 日",
        publishedAt: "2026-10-07T17:00:00Z",
      },
      {
        id: 6,
        title: "北京时间同一天",
        publishedAt: "2026-10-08T08:00:00+08:00",
      },
    ],
  },
};
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Dark: Story = { globals: { theme: "dark" } };
