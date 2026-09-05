"use client";

import { createReservation } from "@/lib/reservations/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BookSlotButton({
  resourceId,
  startIso,
  label,
  disabled,
}: {
  resourceId: string;
  startIso: string;
  label: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setError(null);
    setIsSubmitting(true);

    const result = await createReservation(resourceId, startIso);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClick}
        disabled={disabled || isSubmitting}
        className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? "Booking..." : label}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
