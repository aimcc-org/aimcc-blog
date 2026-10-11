import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserProfile } from "./UserProfile.js";

const meta = {
  title: "Blog/Profile/Profile",
  component: UserProfile,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    name: "AIMCC",
    role: "Front-end Developer",
    location: "北京 · 朝阳",
    bio: "专注于前端、AI 应用与 Agent，用技术记录与思考，探索更有趣的可能性。",
    online: true,
    skills: [
      "React",
      "TypeScript",
      "Ant Design",
      "AI / LLM",
      "LangChain",
      "Agent",
      "RAG",
      "Node.js",
      "PostgreSQL",
      "Astro",
      "Vite",
      "Storybook",
      "CSS",
      "Git",
      "Docker",
    ],
    resumeHref: "/about/",
    githubHref: "https://github.com/aimcc-org/aimcc-blog",
    contactHref: "mailto:hello@example.com",
  },
} satisfies Meta<typeof UserProfile>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithAvatar: Story = {
  args: {
    avatar: (
      <img
        src={`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#142846"/><stop offset="1" stop-color="#5486aa"/></linearGradient></defs><rect width="160" height="160" fill="url(#bg)"/><path d="M20 160c0-64 120-64 120 0" fill="#152135"/><ellipse cx="80" cy="72" rx="33" ry="40" fill="#e6b69c"/><path d="M42 88V55c0-48 79-45 77 0l-1 27-14-35-30 19-15-8Z" fill="#172231"/></svg>')}`}
        alt=""
      />
    ),
  },
};
export const Minimal: Story = {
  args: {
    role: undefined,
    location: undefined,
    bio: undefined,
    online: false,
    skills: [],
    resumeHref: undefined,
    githubHref: undefined,
    contactHref: undefined,
  },
};
export const Offline: Story = { args: { online: false } };
export const AllSkills: Story = { args: { maxVisibleSkills: 15 } };
export const LongContent: Story = {
  args: {
    name: "AIMCC · Front-end Developer",
    role: "Front-end Developer & AI Application Engineer",
    location: "北京 · 朝阳 · 中国",
    skills: ["React", "TypeScript", "一个非常长的技能标签用于验证换行和布局"],
  },
};
export const Mobile: Story = {
  globals: { viewport: { value: "iphone6", isRotated: false } },
};
export const Dark: Story = { globals: { theme: "dark" } };
