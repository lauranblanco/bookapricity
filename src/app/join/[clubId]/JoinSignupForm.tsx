"use client";

import { signUpWithRole } from "@/lib/supabase/actions";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FieldLabel } from "@/components/Label";
import { ErrorBlock } from "@/components/ErrorBlock";

export function JoinSignupForm({ clubId }: { clubId: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signUpWithRole(email, password, "member", {
      clubId,
      next: "/book",
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmittedEmail(email);
  }

  if (submittedEmail) {
    return (
      <p className="text-[13.5px] text-[rgba(251,243,228,0.85)]">
        Check <strong className="text-crema">{submittedEmail}</strong> for a confirmation link to
        finish joining.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel className="!text-[rgba(251,243,228,0.7)]">Email</FieldLabel>
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="!border-[rgba(251,243,228,0.5)] !bg-crema !text-tinta"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel className="!text-[rgba(251,243,228,0.7)]">Password</FieldLabel>
          <Input
            type="password"
            required
            minLength={6}
            placeholder="6 characters minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="!border-[rgba(251,243,228,0.5)] !bg-crema !text-tinta"
          />
        </label>

        {error && <ErrorBlock>{error}</ErrorBlock>}

        <Button type="submit" variant="cta" block disabled={isSubmitting} className="mt-1">
          {isSubmitting ? "Joining…" : "Join club"}
        </Button>
      </form>

      <p className="text-[12.5px] text-[rgba(251,243,228,0.8)]">
        Already have an account?{" "}
        <Link href={`/login?next=/join/${clubId}`} className="text-sol hover:underline">
          Log in instead
        </Link>
      </p>
    </div>
  );
}
