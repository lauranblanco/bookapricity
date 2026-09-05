"use client";

import { createCheckoutTransaction } from "@/lib/paddle/actions";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: string) => void };
      Initialize: (options: { token: string }) => void;
      Checkout: { open: (options: { transactionId: string }) => void };
    };
  }
}

export function SubscribeButton() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paddleReady, setPaddleReady] = useState(false);

  function handlePaddleLoad() {
    if (!window.Paddle) return;
    if (process.env.NEXT_PUBLIC_PADDLE_ENV !== "production") {
      window.Paddle.Environment.set("sandbox");
    }
    window.Paddle.Initialize({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
    });
    setPaddleReady(true);
  }

  async function handleClick() {
    setError(null);
    setIsSubmitting(true);

    const result = await createCheckoutTransaction();

    setIsSubmitting(false);

    if (result.error || !result.transactionId) {
      setError(result.error ?? "Could not start checkout");
      return;
    }

    window.Paddle?.Checkout.open({ transactionId: result.transactionId });
  }

  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={handlePaddleLoad}
      />
      <div className="flex flex-col gap-2">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleClick}
          disabled={isSubmitting || !paddleReady}
          className="self-start rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Starting checkout..." : "Subscribe"}
        </button>
      </div>
    </>
  );
}
