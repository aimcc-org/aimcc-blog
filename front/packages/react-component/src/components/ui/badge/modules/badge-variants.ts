import { cva } from "class-variance-authority";
export const badgeVariants = cva("rc-badge", {
  variants: {
    variant: {
      default: "rc-badge--primary",
      secondary: "rc-badge--secondary",
      destructive: "rc-badge--destructive",
      outline: "rc-badge--outline",
      ghost: "rc-badge--ghost",
      link: "rc-badge--link",
    },
  },
  defaultVariants: { variant: "default" },
});
