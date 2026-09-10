"use client";

import { signUpWithRole, resendSignupConfirmation } from "@/lib/supabase/actions";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { FieldLabel } from "@/components/Label";
import { ErrorBlock } from "@/components/ErrorBlock";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

const SIGNUP_NEXT = "/onboarding/create-club";

// The same "week" gesture used in the hero poster and the empty states —
// here it doubles as a lightweight progress cue, not a literal step tracker.
function WeekStrip({ filled }: { filled: number }) {
  return (
    <div className="mb-[18px] grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className={i < filled ? "h-1.5 bg-resol" : "h-1.5 bg-crema-200"} />
      ))}
    </div>
  );
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAlreadyRegistered(false);
    setIsSubmitting(true);

    const result = await signUpWithRole(email, password, "admin", { next: SIGNUP_NEXT });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.alreadyRegistered) {
      setAlreadyRegistered(true);
      return;
    }

    setSubmittedEmail(email);
  }

  async function handleResend() {
    if (!submittedEmail || resendState === "sending") return;
    setResendState("sending");
    await resendSignupConfirmation(submittedEmail, SIGNUP_NEXT);
    setResendState("sent");
  }

  if (submittedEmail) {
    return (
      <div>
        <WeekStrip filled={2} />
        <h4 className="mb-2 font-heading text-[22px] font-semibold tracking-[-.01em] text-tinta">
          Check your inbox
        </h4>
        <p className="mb-4 text-[13.5px] text-tinta-800">
          We sent a confirmation link to <strong>{submittedEmail}</strong>. Open it and you&apos;ll
          land straight on club setup.
        </p>
        <div className="border border-[rgba(42,33,24,0.2)] bg-white p-3">
          <p className="text-[12.5px] text-tinta-800">
            Didn&apos;t arrive in a minute?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-umbral underline hover:text-resol"
            >
              {resendState === "sending" ? "Resending…" : resendState === "sent" ? "Sent" : "Resend"}
            </button>{" "}
            ·{" "}
            <button
              type="button"
              onClick={() => setSubmittedEmail(null)}
              className="text-umbral underline hover:text-resol"
            >
              Use another email
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WeekStrip filled={1} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1.5">
          <FieldLabel>Password</FieldLabel>
          <PasswordInput
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <ErrorBlock>{error}</ErrorBlock>}
        {alreadyRegistered && (
          <ErrorBlock>
            An account with this email already exists.{" "}
            <Link href="/login" className="underline">
              Log in instead
            </Link>
            .
          </ErrorBlock>
        )}

        <Button type="submit" variant="primary" block disabled={isSubmitting} className="mt-1">
          {isSubmitting ? "Signing up…" : "Sign up"}
        </Button>
      </form>

      <div className="my-3.5 flex items-center gap-2.5">
        <span className="h-px flex-1 bg-[rgba(42,33,24,0.15)]" />
        <span className="font-mono text-[10px] uppercase tracking-[.1em] text-tinta-600">or</span>
        <span className="h-px flex-1 bg-[rgba(42,33,24,0.15)]" />
      </div>
      <GoogleSignInButton next={SIGNUP_NEXT} intent="admin_signup" label="Sign up with Google" />
    </div>
  );
}
