"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NavTabItem } from "@/components/NavTabs";

// Small screens can't fit a full row of nav tabs (that's what pushed the
// leftmost tabs off-screen behind the header's contrast bar). Below `md`
// we collapse the tabs into this hamburger + dropdown instead.
export function MobileNavMenu({
  items,
  theme,
}: {
  items: NavTabItem[];
  theme: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const active = items.find(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`),
  )?.href;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center border",
          theme === "dark"
            ? "border-[rgba(251,243,228,0.35)] text-crema"
            : "border-[rgba(42,33,24,0.3)] text-tinta",
        )}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          className={cn(
            "absolute inset-x-0 top-full z-20 border-b",
            theme === "dark"
              ? "border-[rgba(251,243,228,0.15)] bg-umbral"
              : "border-[rgba(42,33,24,0.15)] bg-crema",
          )}
        >
          {items.map((item) => {
            const isActive = item.href === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-3 font-heading text-[13px] font-semibold",
                  theme === "dark"
                    ? isActive
                      ? "bg-white/[.08] text-white"
                      : "text-[rgba(251,243,228,0.78)] hover:bg-white/[.08] hover:text-white"
                    : isActive
                      ? "bg-[rgba(42,33,24,0.06)] text-tinta"
                      : "text-tinta-800 hover:bg-[rgba(42,33,24,0.06)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
