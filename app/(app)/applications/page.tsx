import { createClient } from "@/lib/supabase/server";
import ApplicationsView from "@/components/ApplicationsView";
import type { Application } from "@/lib/types";

export default async function ApplicationsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("applications")
    .select("*")
    .order("applied_date", { ascending: false });

  const applications = (data ?? []) as Application[];

  return <ApplicationsView applications={applications} />;
}
