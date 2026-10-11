import type { Meta, StoryObj } from "@storybook/react-vite";
import { Header } from "./Header.js";

const meta = {
  title: "Blog/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, height: "420px" } },
  },
  args: {
    title: "AIMCC Blog",
    links: [
      { href: "/", label: "首页", active: true },
      { href: "/archive/", label: "归档" },
      { href: "/about/", label: "关于" },
    ],
  },
} satisfies Meta<typeof Header>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithActions: Story = {
  args: {
    actions: (
      <button type="button" onClick={() => alert("搜索操作由宿主提供")}>
        搜索
      </button>
    ),
  },
};
export const LongTitle: Story = {
  args: { title: "AIMCC · 前端开发与设计工程的个人博客" },
};

export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Dark: Story = { globals: { theme: "dark" } };

export const Scrolled: Story = { args: { scrolled: true } };
export const ScrolledDark: Story = {
  args: { scrolled: true },
  globals: { theme: "dark" },
};
export const ScrollDemo: Story = {
  render: (args) => (
    <div
      style={{
        minHeight: "220vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <Header {...args} overlay tone="inverse" />
      <section
        style={{
          padding: "160px max(24px, calc((100% - 940px) / 2)) 100px",
          background: "linear-gradient(120deg, #122e57, #275ca4 60%, #39898b)",
          color: "white",
        }}
      >
        <p>HEADER / SCROLL PREVIEW</p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 58px)", margin: "24px 0" }}>
          思考、记录与分享
        </h1>
        <p>向下滚动显示浮动玻璃导航，继续滚动保持可见。</p>
      </section>
      <main style={{ maxWidth: 940, margin: "auto", padding: "48px 24px" }}>
        {Array.from({ length: 6 }, (_, index) => (
          <article
            key={index}
            style={{
              padding: "36px 0",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <p style={{ color: "var(--color-muted)" }}>
              2026 / 10 / {String(8 - index).padStart(2, "0")}
            </p>
            <h2>
              {
                [
                  "构建更自然的阅读体验",
                  "用组件连接设计与代码",
                  "探索前端与 AI 的可能性",
                ][index % 3]
              }
            </h2>
            <p style={{ lineHeight: 1.8 }}>
              内容穿过导航背景时，可以观察模糊、边缘折射和柔和高光。返回页面顶部，导航恢复宽布局。
            </p>
          </article>
        ))}
      </main>
    </div>
  ),
};
