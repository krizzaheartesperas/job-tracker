"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import type { Profile } from "@/lib/types";
import PersonSwitcher from "@/components/PersonSwitcher";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
];

export default function MobileNav({
  email,
  profiles,
  currentUserId,
  defaultPersonKey,
}: {
  email: string;
  profiles: Profile[];
  currentUserId: string | null;
  defaultPersonKey: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const personQs = searchParams.get("person");
  const querySuffix = personQs ? `?person=${encodeURIComponent(personQs)}` : "";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="md:hidden border-b border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-brand-gradient" />
          <span className="font-display font-semibold">Kei and Mere&apos;s Tracker</span>
        </div>
        <button onClick={handleSignOut} className="text-xs text-inkSoft">
          Sign out
        </button>
      </div>
      <nav className="flex gap-1 mt-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={`${link.href}${querySuffix}`}
            className={clsx(
              "flex-1 text-center px-3 py-2 rounded-md text-sm font-medium",
              pathname === link.href ? "bg-ink text-white" : "text-inkSoft bg-surfaceMuted"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {profiles.length > 0 && (
        <div className="mt-3">
          <PersonSwitcher
            profiles={profiles}
            currentUserId={currentUserId}
            defaultPersonKey={defaultPersonKey}
            layout="horizontal"
          />
        </div>
      )}
      <p className="text-[11px] text-inkSoft mt-2 truncate">{email}</p>
    </header>
  );
}
