"use client";

import { cancelReservation } from "@/lib/reservations/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setError(null);
    setIsSubmitting(true);

    const result = await cancelReservation(reservationId);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        onClick={handleClick}
        disabled={isSubmitting}
        className="text-sm text-red-600 underline disabled:opacity-50"
      >
        {isSubmitting ? "Cancelling..." : "Cancel"}
      </button>
    </div>
  );
}
