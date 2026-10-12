import { cva } from "class-variance-authority";
export const tabsListVariants = cva("rc-tabs__list", {
  variants: {
    variant: { default: "rc-tabs__list--default", line: "rc-tabs__list--line" },
  },
  defaultVariants: { variant: "default" },
});
