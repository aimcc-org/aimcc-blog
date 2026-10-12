import * as React from "react";
import { cn } from "../../../../utils/cn.js";
import { ChevronDownIcon } from "lucide-react";

function NativeSelect({
  className,
  size = "default",
  wrapperClassName,
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
  wrapperClassName?: string;
}) {
  return (
    <div
      className={cn("rc-native-select", wrapperClassName)}
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn("rc-native-select__control", className)}
        {...props}
      />
      <ChevronDownIcon
        className="rc-native-select__icon"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("rc-native-select__option", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("rc-native-select__option", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
