import { AuthCard } from "@/components/AuthCard";
import { LinkButton } from "@/components/Button";

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthCard>
        <p className="mb-4 text-[12.5px] text-tinta-800">
          This link has expired or was already used. Confirmation links last one hour.
        </p>
        <div className="flex gap-2">
          <LinkButton href="/signup" variant="primary">
            Sign up again
          </LinkButton>
          <LinkButton href="/login" variant="secondary">
            Log in
          </LinkButton>
        </div>
      </AuthCard>
    </main>
  );
}
