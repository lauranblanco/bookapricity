import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full border-collapse border border-[rgba(42,33,24,0.2)] bg-white",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-b-2 border-[rgba(42,33,24,0.4)] bg-crema-100", className)}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-3 py-[9px] text-left font-mono text-[10px] font-medium uppercase tracking-[.1em] text-tinta-800",
        className,
      )}
      {...props}
    />
  );
}

export function TableRow({
  muted,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { muted?: boolean }) {
  return (
    <tr
      className={cn(
        "border-b border-[rgba(42,33,24,0.12)]",
        muted && "bg-[#FCFAF5] text-tinta-600",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-3 font-sans text-[13px]", className)} {...props} />;
}
