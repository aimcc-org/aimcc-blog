import { cva } from "class-variance-authority";
export const buttonVariants = cva("rc-button", {
  variants: {
    variant: {
      default: "rc-button--primary",
      destructive: "rc-button--destructive",
      outline: "rc-button--outline",
      secondary: "rc-button--secondary",
      ghost: "rc-button--ghost",
      link: "rc-button--link",
    },
    size: {
      default: "rc-button--md",
      xs: "rc-button--xs",
      sm: "rc-button--sm",
      lg: "rc-button--lg",
      icon: "rc-button--icon",
      "icon-xs": "rc-button--icon-xs",
      "icon-sm": "rc-button--icon-sm",
      "icon-lg": "rc-button--icon-lg",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});
