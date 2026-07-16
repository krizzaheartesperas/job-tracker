import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar email={user?.email ?? ""} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav email={user?.email ?? ""} />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
