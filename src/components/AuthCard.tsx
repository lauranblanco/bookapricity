import type { HTMLAttributes } from "react";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/cn";

// The card shell shared by login, signup and create-club — a bordered box
// sitting directly on the crema page background (no fill contrast, per the
// system's rule-driven elevation), with the brand lockup + Umbricity
// signature always on top. Join uses its own umbral-background treatment
// instead — it's deliberately the one screen that doesn't look like this.
export function AuthCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("w-full max-w-md border border-[rgba(42,33,24,0.2)] bg-crema p-7", className)}
      {...props}
    >
      <div className="mb-[22px]">
        <div className="flex items-center gap-2">
          <BrandMark variant="color" size={22} />
          <span className="font-heading text-[13px] font-semibold tracking-[-.01em] text-umbral">
            BookApricity
          </span>
        </div>
        <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[.2em] text-tinta-600">
          an umbricity product
        </p>
      </div>
      {children}
    </div>
  );
}
