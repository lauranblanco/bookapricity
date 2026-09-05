import { getCurrentProfile } from "@/lib/supabase/queries";
import { SignOutButton } from "@/components/SignOutButton";
import Link from "next/link";
import { redirect } from "next/navigation";

const NAV_ITEMS = [
  { href: "/book", label: "Book a slot" },
  { href: "/my-reservations", label: "My reservations" },
];

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.club_id) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">No club yet</h1>
        <p className="text-gray-600">
          Ask your club admin for an invite link to join a club.
        </p>
        <SignOutButton />
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <nav className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
