import { createClient } from "@/lib/supabase/server";
import PipelineTrail from "@/components/PipelineTrail";
import StatCards from "@/components/StatCards";
import UpcomingFollowUps from "@/components/UpcomingFollowUps";
import { ApplicationsOverTime, StatusBreakdown } from "@/components/StatsCharts";
import type { Application } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("applications")
    .select("*")
    .order("applied_date", { ascending: true });

  const applications = (data ?? []) as Application[];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkSoft">
          Dashboard
        </p>
        <h1 className="font-display font-semibold text-3xl mt-1 tracking-tight">
          Where things stand
        </h1>
      </div>

      <StatCards applications={applications} />

      <PipelineTrail applications={applications} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-2">Applications over time</h2>
          <ApplicationsOverTime applications={applications} />
        </div>
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-2">Status breakdown</h2>
          <StatusBreakdown applications={applications} />
        </div>
      </div>

      <UpcomingFollowUps applications={applications} />
    </div>
  );
}
