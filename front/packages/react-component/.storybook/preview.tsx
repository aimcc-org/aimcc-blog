import type { Preview } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import "../src/tokens.css";
import "../src/styles.css";
import "./preview.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "主题",
      toolbar: {
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => (
      <div
        className={`storybook-theme${context.globals.theme === "dark" ? " aimcc-theme-dark" : ""}`}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    viewport: { options: INITIAL_VIEWPORTS },
  },
};
export default preview;
