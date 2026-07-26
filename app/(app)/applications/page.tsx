import { getApplicationsWithOwners, resolvePersonFilter } from "@/lib/workspace";
import ApplicationsView from "@/components/ApplicationsView";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { person?: string };
}) {
  const { applications, profiles, allProfiles, currentUserId } = await getApplicationsWithOwners({
    orderAscending: false,
  });

  const personFilter = resolvePersonFilter(searchParams.person, allProfiles, currentUserId);
  const filteredApplications =
    personFilter === "all"
      ? applications
      : applications.filter(
          (a) => a.owner.display_name.toLowerCase() === personFilter.toLowerCase()
        );

  return (
    <ApplicationsView
      applications={filteredApplications}
      currentUserId={currentUserId}
      showOwner={personFilter === "all"}
      personFilter={personFilter}
      profiles={profiles}
    />
  );
}
