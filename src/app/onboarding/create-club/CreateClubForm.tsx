"use client";

import { createClub } from "@/lib/clubs/actions";
import { useState } from "react";
import { Button } from "@/components/Button";
import { FieldLabel } from "@/components/Label";
import { ErrorBlock } from "@/components/ErrorBlock";

export function CreateClubForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createClub(name);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <FieldLabel>Club name</FieldLabel>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Riverside Tennis Club"
          className="w-full rounded-none border border-[rgba(42,33,24,0.3)] bg-white px-[13px] py-[13px] font-heading text-base font-semibold text-tinta"
        />
      </label>

      {error && <ErrorBlock>{error}</ErrorBlock>}

      <Button type="submit" variant="primary" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Creating…" : "Create club"}
      </Button>
    </form>
  );
}
