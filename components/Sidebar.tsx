"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/applications", label: "Applications", icon: ListIcon },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = email ? email[0].toUpperCase() : "?";

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-border bg-surface px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <span className="w-8 h-8 rounded-md bg-brand-gradient shadow-glow" />
        <span className="font-display font-semibold text-lg tracking-tight">Kei and Mere&apos;s Tracker</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-ink text-white shadow-soft"
                  : "text-inkSoft hover:bg-surfaceMuted hover:text-ink"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border flex items-center gap-3 px-2">
        <span className="w-8 h-8 rounded-full bg-brand-gradient text-white text-xs font-semibold flex items-center justify-center shrink-0">
          {initial}
        </span>
        <span className="text-sm text-inkSoft truncate flex-1">{email}</span>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="text-inkSoft hover:text-ink shrink-0"
        >
          <SignOutIcon className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="4" width="18" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="10.5" width="18" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="17" width="18" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M15 3H19a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
