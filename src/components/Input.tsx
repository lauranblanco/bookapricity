import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        "w-full rounded-none border bg-white px-[11px] py-[9px] font-sans text-[13px] text-tinta placeholder:text-tinta-600",
        invalid ? "border-bad" : "border-[rgba(42,33,24,0.3)]",
        "disabled:cursor-not-allowed disabled:opacity-[.45]",
        className,
      )}
      {...props}
    />
  );
}
