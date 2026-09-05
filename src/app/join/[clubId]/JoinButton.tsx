"use client";

import { joinClub } from "@/lib/clubs/actions";
import { useState } from "react";

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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleClick}
        disabled={isSubmitting}
        className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Joining..." : "Join club"}
      </button>
    </div>
  );
}
