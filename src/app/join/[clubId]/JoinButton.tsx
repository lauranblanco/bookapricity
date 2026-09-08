"use client";

import { joinClub } from "@/lib/clubs/actions";
import { useState } from "react";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";

export function JoinButton({ clubId }: { clubId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setError(null);
    setIsSubmitting(true);

    const result = await joinClub(clubId);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="cta" block onClick={handleClick} disabled={isSubmitting}>
        {isSubmitting ? "Joining…" : "Join club"}
      </Button>
      {error && <ErrorBlock>{error}</ErrorBlock>}
    </div>
  );
}
