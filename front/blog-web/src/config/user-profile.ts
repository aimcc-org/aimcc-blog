import type { UserProfileProps } from "@aimcc/react-component";

// Configure your avatar and personal links here. The about page is the initial
// resume destination; the repository's issue page is the initial contact channel.
export const userProfile = {
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
  contactHref: "https://github.com/aimcc-org/aimcc-blog/issues",
} satisfies UserProfileProps;
