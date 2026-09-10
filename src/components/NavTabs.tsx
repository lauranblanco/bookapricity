"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavTabItem = { href: string; label: string; shortLabel?: string };

// Picks the tab whose href is the longest matching prefix of the current
// path, so e.g. "/dashboard/resources/new" activates "Resources" and not
// "Reservations" (whose href "/dashboard" is also a prefix).
function activeHref(pathname: string | null, items: NavTabItem[]): string | null {
  if (!pathname) return null;
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (b.href.length > a.href.length ? b : a)).href;
}

const ACTIVE_UNDERLINE = "shadow-[inset_0_-3px_0_#E2683F]";

export function AdminNavTabs({
  items,
  layout = "desktop",
}: {
  items: NavTabItem[];
  layout?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const active = activeHref(pathname, items);

  return (
    <div
      className={
        layout === "desktop"
          ? "flex items-stretch gap-0.5 overflow-x-auto"
          : "grid grid-cols-4"
      }
    >
      {items.map((item) => {
        const isActive = item.href === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center whitespace-nowrap transition-colors duration-[120ms] ease-out",
              layout === "desktop"
                ? "px-3.5 text-[12.5px]"
                : "min-h-11 justify-center px-2 text-center text-[11.5px]",
              isActive
                ? cn("font-heading font-semibold text-white", ACTIVE_UNDERLINE)
                : "font-sans text-[rgba(251,243,228,0.78)] hover:bg-white/[.08] hover:text-white",
            )}
          >
            {layout === "mobile" ? (item.shortLabel ?? item.label) : item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function MemberNavTabs({
  items,
  layout,
}: {
  items: NavTabItem[];
  layout: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const active = activeHref(pathname, items);

  return (
    <div className={layout === "desktop" ? "flex items-stretch gap-0.5" : "grid grid-cols-2 bg-white"}>
      {items.map((item) => {
        const isActive = item.href === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center whitespace-nowrap transition-colors duration-[120ms] ease-out",
              layout === "desktop"
                ? "px-3.5 text-[12.5px]"
                : "min-h-11 justify-center px-3 py-3 text-[12.5px]",
              isActive
                ? cn("font-heading font-semibold text-tinta", ACTIVE_UNDERLINE)
                : "font-sans text-tinta-800 hover:bg-[rgba(42,33,24,0.06)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
