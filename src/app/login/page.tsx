import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { AuthCard } from "@/components/AuthCard";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthCard>
        <h4 className="mb-1 font-heading text-[22px] font-semibold tracking-[-.01em] text-tinta">
          Log in
        </h4>
        <p className="mb-[18px] text-[12.5px] text-tinta-600">Admins and members, same door.</p>
        <LoginForm next={searchParams.next} />
        <p className="mt-3.5 text-[12.5px] text-tinta-800">
          No club yet?{" "}
          <Link href="/signup" className="text-umbral hover:text-resol">
            Create one.
          </Link>
        </p>
      </AuthCard>
    </main>
  );
}
