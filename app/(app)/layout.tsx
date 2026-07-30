import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAllProfiles, getWorkspaceProfiles, resolveCurrentWorkspaceProfile } from "@/lib/workspace";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import WelcomePopup from "@/components/WelcomePopup";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allProfiles = await getAllProfiles();
  const profiles = getWorkspaceProfiles(allProfiles);
  const defaultPersonKey =
    resolveCurrentWorkspaceProfile(allProfiles, user?.id ?? null)?.display_name.toLowerCase() ??
    null;

  return (
    <div className="min-h-screen flex bg-bg">
      <WelcomePopup />
      <Suspense fallback={<aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-border bg-surface" />}>
        <Sidebar
          email={user?.email ?? ""}
          profiles={profiles}
          currentUserId={user?.id ?? null}
          defaultPersonKey={defaultPersonKey}
        />
      </Suspense>
      <div className="flex-1 min-w-0 flex flex-col">
        <Suspense fallback={<header className="md:hidden border-b border-border bg-surface h-24" />}>
          <MobileNav
            email={user?.email ?? ""}
            profiles={profiles}
            currentUserId={user?.id ?? null}
            defaultPersonKey={defaultPersonKey}
          />
        </Suspense>
        <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-6 py-5 md:py-7 min-h-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
