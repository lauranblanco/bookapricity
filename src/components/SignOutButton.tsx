"use client";

import { signOut } from "@/lib/supabase/actions";
import { useRouter } from "next/navigation";
import { Button, type ButtonVariant } from "@/components/Button";

export function SignOutButton({
  variant = "secondary",
  className,
}: {
  variant?: ButtonVariant;
  className?: string;
}) {
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant={variant} size="sm" onClick={handleClick} className={className}>
      Sign out
    </Button>
  );
}
