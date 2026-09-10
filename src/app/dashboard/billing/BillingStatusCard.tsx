import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PlanStatus = "inactive" | "active" | "past_due" | "cancelled";

const STATUS_STYLES: Record<PlanStatus, { border: string; bg: string; text: string }> = {
  inactive: { border: "border-[rgba(42,33,24,0.2)]", bg: "bg-white", text: "text-tinta" },
  active: { border: "border-ok", bg: "bg-ok-100", text: "text-ok-900" },
  past_due: { border: "border-sol", bg: "bg-warn-100", text: "text-warn-900" },
  cancelled: { border: "border-[rgba(42,33,24,0.2)]", bg: "bg-white", text: "text-tinta" },
};

const STATUS_LABEL: Record<PlanStatus, string> = {
  inactive: "Inactive",
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
};

// The status card is always visible — its border/background/text recolor by
// status, and the caller decides what goes on the right (a badge for
// inactive/past_due, a "Manage subscription" button for active — see 4c/4d).
export function BillingStatusCard({
  status,
  children,
}: {
  status: PlanStatus;
  children?: ReactNode;
}) {
  const style = STATUS_STYLES[status];

  return (
    <div className={cn("flex items-center justify-between border p-4", style.border, style.bg)}>
      <div>
        <div
          className={cn(
            "font-mono text-[10px] font-medium uppercase tracking-[.1em]",
            style.text,
          )}
        >
          Plan status
        </div>
        <div className={cn("mt-1 font-heading text-2xl font-medium", style.text)}>
          {STATUS_LABEL[status]}
        </div>
      </div>
      {children}
    </div>
  );
}
