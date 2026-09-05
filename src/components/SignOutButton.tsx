"use client";

import { signOut } from "@/lib/supabase/actions";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleClick} className="text-sm text-gray-600 underline">
      Sign out
    </button>
  );
}
