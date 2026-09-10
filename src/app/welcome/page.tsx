import { AuthCard } from "@/components/AuthCard";
import { LinkButton } from "@/components/Button";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthCard>
        <h4 className="mb-2 font-heading text-[22px] font-semibold tracking-[-.01em] text-tinta">
          You&apos;re all set
        </h4>
        <p className="mb-4 text-[13.5px] text-tinta-800">
          Thanks for subscribing. It can take a few moments for your payment to be confirmed —
          your plan status will update automatically once it is.
        </p>
        <LinkButton href="/dashboard/billing" variant="primary">
          Back to billing
        </LinkButton>
      </AuthCard>
    </main>
  );
}
