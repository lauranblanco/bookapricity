import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Link expired or already used</h1>
      <p className="text-gray-600">
        This confirmation link is no longer valid. This can happen if it was
        already used, has expired, or your email provider opened it before
        you did. Try signing up or logging in again to get a fresh link.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/signup"
          className="rounded bg-gray-900 px-4 py-2 text-white"
        >
          Sign up again
        </Link>
        <Link href="/login" className="rounded border border-gray-300 px-4 py-2">
          Log in
        </Link>
      </div>
    </main>
  );
}
