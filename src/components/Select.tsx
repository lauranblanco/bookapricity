import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Select({
  invalid,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cn(
        "w-full rounded-none border bg-white px-[10px] py-[9px] font-sans text-[13px] text-tinta",
        invalid ? "border-bad" : "border-[rgba(42,33,24,0.3)]",
        "disabled:cursor-not-allowed disabled:opacity-[.45]",
        className,
      )}
      {...props}
    />
  );
}
