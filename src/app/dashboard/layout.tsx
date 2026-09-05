import { getCurrentProfile } from "@/lib/supabase/queries";
import { SignOutButton } from "@/components/SignOutButton";
import Link from "next/link";
import { redirect } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Reservations" },
  { href: "/dashboard/resources", label: "Resources" },
  { href: "/dashboard/members", label: "Members" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/book");
  }

  if (!profile.club_id) {
    redirect("/onboarding/create-club");
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
