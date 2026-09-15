"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";

// Catches any otherwise-unhandled render/effect error below the root
// layout (e.g. the billing page's Paddle init throwing on a missing env
// var) so it degrades to this instead of a blank page or Next's raw,
// unbranded error screen.
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-crema p-4">
      <div className="w-full max-w-md border border-[rgba(42,33,24,0.2)] bg-white p-7 text-center">
        <BrandMark size={28} className="mx-auto mb-4" />
        <h1 className="font-heading text-xl font-semibold text-tinta">Something went wrong</h1>
        <p className="mt-2 text-[13px] text-tinta-800">
          This page hit an unexpected error. Try again, or come back in a moment.
        </p>
        <Button type="button" variant="primary" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
