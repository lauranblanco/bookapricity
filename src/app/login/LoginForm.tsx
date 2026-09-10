"use client";

import { signInWithPassword } from "@/lib/supabase/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/Input";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/Button";
import { FieldLabel } from "@/components/Label";
import { ErrorBlock } from "@/components/ErrorBlock";

export function LoginForm({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signInWithPassword(email, password);

    setIsSubmitting(false);

    if (result.error) {
      setError(
        result.error.toLowerCase().includes("invalid login credentials")
          ? "Wrong email or password. Try again."
          : result.error,
      );
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <FieldLabel>Password</FieldLabel>
        <PasswordInput
          required
          invalid={Boolean(error)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {error && <ErrorBlock>{error}</ErrorBlock>}

      <Button type="submit" variant="primary" block disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
