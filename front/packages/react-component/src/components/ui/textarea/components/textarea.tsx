import * as React from "react";
import { cn } from "../../../../utils/cn.js";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("rc-textarea", className)}
      {...props}
    />
  );
}

export { Textarea };
