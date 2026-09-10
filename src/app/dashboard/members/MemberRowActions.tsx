"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMemberRole, removeMember } from "@/lib/members/actions";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";

export function MemberRowActions({
  memberId,
  role,
  align = "end",
}: {
  memberId: string;
  role: "admin" | "member";
  align?: "end" | "start";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleRoleToggle() {
    setError(null);
    setIsPending(true);

    const result = await updateMemberRole(memberId, role === "admin" ? "member" : "admin");

    setIsPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  async function handleRemove() {
    if (
      !window.confirm(
        "Remove this member from the club? Their upcoming reservations will be cancelled.",
      )
    ) {
      return;
    }

    setError(null);
    setIsPending(true);

    const result = await removeMember(memberId);

    setIsPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className={`flex flex-col gap-1 ${align === "end" ? "items-end" : "items-start"}`}>
      <div className="flex flex-wrap gap-3 whitespace-nowrap">
        <Button
          type="button"
          variant="ghost"
          onClick={handleRoleToggle}
          disabled={isPending}
          className="!px-1 !py-0.5 text-[11.5px]"
        >
          {role === "admin" ? "Make member" : "Make admin"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleRemove}
          disabled={isPending}
          className="!px-1 !py-0.5 text-[11.5px]"
        >
          Remove
        </Button>
      </div>
      {error && <ErrorBlock className="max-w-[240px]">{error}</ErrorBlock>}
    </div>
  );
}
