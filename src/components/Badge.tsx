import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "confirmed"
  | "cancelled"
  | "planActive"
  | "pastDue"
  | "inactive"
  | "cancelledPlan"
  | "admin"
  | "member";

const TONE_CLASSES: Record<BadgeTone, string> = {
  confirmed: "bg-ok-100 text-ok-900",
  cancelled: "bg-crema-200 text-tinta-800",
  planActive: "bg-ok text-white",
  pastDue: "bg-warn-100 text-warn-900",
  inactive: "bg-white text-tinta-800 border border-[rgba(42,33,24,0.35)]",
  cancelledPlan: "bg-bad-100 text-bad-900",
  admin: "bg-umbral text-white",
  member: "bg-umbral-100 text-umbral-700",
};

export function Badge({
  tone,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-none px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[.09em]",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
