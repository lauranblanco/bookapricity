import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Field label used above every input/select across the app: mono, uppercase,
// tracked — the "IBM Plex Mono 500, 10px uppercase, tracking .1em" token.
export function FieldLabel({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "font-mono text-[10px] font-medium uppercase tracking-[.1em] text-tinta-600",
        className,
      )}
      {...props}
    />
  );
}
