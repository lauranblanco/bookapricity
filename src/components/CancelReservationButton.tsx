"use client";

import { cancelReservation } from "@/lib/reservations/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { ErrorBlock } from "@/components/ErrorBlock";
import { cn } from "@/lib/cn";

export function CancelReservationButton({
  reservationId,
  disabled,
  disabledReason,
  bordered,
  className,
}: {
  reservationId: string;
  disabled?: boolean;
  disabledReason?: string;
  bordered?: boolean;
  className?: string;
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
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isSubmitting}
        title={disabled ? disabledReason : undefined}
        className={cn(bordered && "border border-bad", className)}
      >
        {isSubmitting ? "Cancelling…" : "Cancel"}
      </Button>
      {error && <ErrorBlock className="max-w-[220px]">{error}</ErrorBlock>}
    </div>
  );
}
