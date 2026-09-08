import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function ErrorBlock({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-l-[3px] border-bad bg-bad-100 px-[11px] py-[9px] font-sans text-[12.5px] text-bad-900",
        className,
      )}
      role="alert"
      {...props}
    />
  );
}
