import * as React from "react";
import { cn } from "../../../../utils/cn.js";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("rc-input", className)}
      {...props}
    />
  );
}

export { Input };
