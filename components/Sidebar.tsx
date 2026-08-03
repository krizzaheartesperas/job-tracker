"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";
import type { Profile } from "@/lib/types";
import PersonSwitcher from "@/components/PersonSwitcher";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/applications", label: "Applications", icon: ListIcon },
  { href: "/interview", label: "Mock Interview", icon: InterviewIcon },
];

export default function Sidebar({
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

  const currentProfile =
    profiles.find((p) => p.user_id === currentUserId) ??
    profiles.find((p) => p.display_name.toLowerCase() === defaultPersonKey);
  const initial = currentProfile?.display_name?.[0]?.toUpperCase() ?? (email ? email[0].toUpperCase() : "?");

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-border bg-surface px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-6">
        <span className="w-8 h-8 rounded-md bg-brand-gradient shadow-glow" />
        <span className="font-display font-semibold text-lg tracking-tight">Kei and Mere&apos;s Tracker</span>
      </div>

      {/* Person Switcher */}
      {profiles.length > 0 && (
        <div className="px-1 mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-inkSoft/60 mb-2 px-1">
            Viewing
          </p>
          <PersonSwitcher
            profiles={profiles}
            currentUserId={currentUserId}
            defaultPersonKey={defaultPersonKey}
            layout="vertical"
          />
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={`${link.href}${querySuffix}`}
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

      {/* Workspace members */}
      <div className="pt-4 border-t border-border space-y-3">
        {profiles.length > 1 && (
          <div className="px-2 flex items-center gap-1">
            {profiles.map((p) => (
              <span
                key={p.user_id}
                title={p.display_name}
                className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 ring-2 ring-surface -ml-1 first:ml-0"
                style={{ backgroundColor: p.accent_color }}
              >
                {p.display_name[0]}
              </span>
            ))}
            <span className="text-[10px] text-inkSoft ml-1.5">Shared workspace</span>
          </div>
        )}
        <div className="flex items-center gap-3 px-2">
          <span
            className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0"
            style={{ backgroundColor: currentProfile?.accent_color ?? "#5B5FEF" }}
          >
            {initial}
          </span>
          <span className="text-sm text-inkSoft truncate flex-1">{currentProfile?.display_name ?? email}</span>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-inkSoft hover:text-ink shrink-0"
          >
            <SignOutIcon className="w-4 h-4" />
          </button>
        </div>
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

function InterviewIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 9h8M8 13h5M15 17l2-2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
