import { getApplicationsWithOwners, resolvePersonFilter } from "@/lib/workspace";
import PipelineTrail from "@/components/PipelineTrail";
import StatCards from "@/components/StatCards";
import UpcomingFollowUps from "@/components/UpcomingFollowUps";
import { ApplicationsOverTime, StatusBreakdown } from "@/components/StatsCharts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { person?: string };
}) {
  const { applications, profiles, allProfiles, currentUserId } = await getApplicationsWithOwners({
    orderAscending: true,
  });

  const personFilter = resolvePersonFilter(searchParams.person, allProfiles, currentUserId);
  const filteredApplications =
    personFilter === "all"
      ? applications
      : applications.filter(
          (a) => a.owner.display_name.toLowerCase() === personFilter.toLowerCase()
        );

  const activeProfile = profiles.find(
    (p) => p.display_name.toLowerCase() === personFilter.toLowerCase()
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkSoft">
          Dashboard
        </p>
        <h1 className="font-display font-semibold text-3xl mt-1 tracking-tight">
          {activeProfile
            ? (
              <span>
                {activeProfile.display_name}&apos;s progress{" "}
                <span
                  className="inline-block w-3 h-3 rounded-full align-middle ml-1"
                  style={{ backgroundColor: activeProfile.accent_color }}
                />
              </span>
            )
            : personFilter === "all"
            ? "Combined progress"
            : "Where things stand"}
        </h1>
      </div>

      <StatCards applications={filteredApplications} />

      <PipelineTrail applications={filteredApplications} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-2">Applications over time</h2>
          <ApplicationsOverTime applications={filteredApplications} />
        </div>
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg mb-2">Status breakdown</h2>
          <StatusBreakdown applications={filteredApplications} />
        </div>
      </div>

      <UpcomingFollowUps applications={filteredApplications} showOwner={personFilter === "all"} />
    </div>
  );
}
