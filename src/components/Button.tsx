import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "cta"
  | "outlineInverse";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-umbral text-crema hover:bg-umbral-700 active:bg-umbral-800",
  secondary:
    "bg-transparent text-tinta border border-[rgba(42,33,24,0.35)] hover:bg-[rgba(42,33,24,0.06)]",
  ghost: "bg-transparent text-tinta hover:bg-[rgba(42,33,24,0.06)]",
  destructive: "bg-transparent text-bad hover:bg-bad-100",
  cta: "bg-resol text-white hover:bg-resol-600",
  // Chrome on a solid umbral bar (admin nav "Sign out") — light border/text
  // instead of the tinta-based secondary, which would be invisible there.
  outlineInverse:
    "bg-transparent text-crema border border-[rgba(251,243,228,0.4)] hover:bg-white/[.12]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-[15px]",
};

// min-h-11 (44px) only below the md breakpoint — the touch-target minimum
// applies on mobile; desktop keeps the board's deliberately compact sizing
// (ghost table actions, nav chrome) rather than bloating every button.
const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-start gap-2 rounded-none font-heading font-semibold whitespace-nowrap transition-colors duration-[120ms] ease-out disabled:pointer-events-none disabled:opacity-[.45] md:min-h-0";

function buttonClassName({
  variant = "primary",
  size = "md",
  block,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}) {
  return cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], block && "w-full", className);
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}) {
  return <button className={buttonClassName({ variant, size, block, className })} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  block,
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}) {
  return (
    <Link href={href} className={buttonClassName({ variant, size, block, className })} {...props} />
  );
}
