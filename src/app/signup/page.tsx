import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { AuthCard } from "@/components/AuthCard";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthCard>
        <SignupForm />
        <p className="mt-3.5 text-[12.5px] text-tinta-800">
          Already have an account?{" "}
          <Link href="/login" className="text-umbral hover:text-resol">
            Log in
          </Link>
        </p>
      </AuthCard>
    </main>
  );
}
