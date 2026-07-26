import { createClient } from "@/lib/supabase/server";
import type { Application, ApplicationWithOwner, Profile } from "@/lib/types";

/** Canonical workspace members shown in the person switcher. */
export const WORKSPACE_MEMBERS = [
  { displayName: "Kei", accentColor: "#5B5FEF", emailLocal: "krizzaheart.esperas" },
  { displayName: "Meredith", accentColor: "#14B8A6", emailLocal: "meredithroncejero09" },
] as const;

/** Keep only Kei + Meredith, preferring proper display names over email-prefix fallbacks. */
export function getWorkspaceProfiles(profiles: Profile[]): Profile[] {
  const result: Profile[] = [];

  for (const { displayName, accentColor, emailLocal } of WORKSPACE_MEMBERS) {
    const match =
      profiles.find((p) => p.display_name.toLowerCase() === displayName.toLowerCase()) ??
      profiles.find((p) => p.display_name.toLowerCase() === emailLocal.toLowerCase());

    if (match) {
      result.push({
        ...match,
        display_name: displayName,
        accent_color: accentColor,
      });
    }
  }

  return result;
}

function getMemberUserIds(allProfiles: Profile[], personFilter: string): string[] {
  const member = WORKSPACE_MEMBERS.find(
    (m) => m.displayName.toLowerCase() === personFilter.toLowerCase()
  );
  if (!member) return [];

  return allProfiles
    .filter(
      (p) =>
        p.display_name.toLowerCase() === member.displayName.toLowerCase() ||
        p.display_name.toLowerCase() === member.emailLocal.toLowerCase()
    )
    .map((p) => p.user_id);
}

/** Map the signed-in user to their workspace profile (handles email-prefix duplicates). */
export function resolveCurrentWorkspaceProfile(
  allProfiles: Profile[],
  currentUserId: string | null
): Profile | undefined {
  if (!currentUserId) return undefined;

  const owner = buildOwnerMap(allProfiles).get(currentUserId);
  if (!owner) return undefined;

  return getWorkspaceProfiles(allProfiles).find(
    (p) => p.display_name.toLowerCase() === owner.display_name.toLowerCase()
  );
}

/** Resolve ?person= from the URL; default to the signed-in user's workspace. */
export function resolvePersonFilter(
  personParam: string | undefined,
  allProfiles: Profile[],
  currentUserId: string | null
): string {
  if (personParam === "all") return "all";
  if (personParam) return personParam;

  const current = resolveCurrentWorkspaceProfile(allProfiles, currentUserId);
  if (current) return current.display_name.toLowerCase();
  return "all";
}

export function getCurrentProfile(
  profiles: Profile[],
  currentUserId: string | null
): Profile | undefined {
  return profiles.find((p) => p.user_id === currentUserId);
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = createClient();
  try {
    const { data } = await supabase.from("profiles").select("*");
    return (data ?? []) as Profile[];
  } catch {
    return [];
  }
}

export async function getProfiles(): Promise<Profile[]> {
  const all = await getAllProfiles();
  return getWorkspaceProfiles(all);
}

function buildOwnerMap(allProfiles: Profile[]): Map<string, { display_name: string; accent_color: string; user_id: string }> {
  const map = new Map<string, { display_name: string; accent_color: string; user_id: string }>();

  for (const member of WORKSPACE_MEMBERS) {
    const matches = allProfiles.filter(
      (p) =>
        p.display_name.toLowerCase() === member.displayName.toLowerCase() ||
        p.display_name.toLowerCase() === member.emailLocal.toLowerCase()
    );
    for (const p of matches) {
      map.set(p.user_id, {
        display_name: member.displayName,
        accent_color: member.accentColor,
        user_id: p.user_id,
      });
    }
  }

  return map;
}

export async function getApplicationsWithOwners(options?: {
  personFilter?: string;
  orderAscending?: boolean;
}): Promise<{
  applications: ApplicationWithOwner[];
  profiles: Profile[];
  allProfiles: Profile[];
  currentUserId: string | null;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allProfiles = await getAllProfiles();
  const profiles = getWorkspaceProfiles(allProfiles);
  const ownerMap = buildOwnerMap(allProfiles);

  let query = supabase
    .from("applications")
    .select("*")
    .order("applied_date", { ascending: options?.orderAscending ?? true });

  // Filter by person if specified (includes duplicate account user_ids)
  if (options?.personFilter && options.personFilter !== "all") {
    const userIds = getMemberUserIds(allProfiles, options.personFilter);
    if (userIds.length === 1) {
      query = query.eq("user_id", userIds[0]);
    } else if (userIds.length > 1) {
      query = query.in("user_id", userIds);
    }
  }

  const { data } = await query;
  const apps = (data ?? []) as Application[];

  const applications: ApplicationWithOwner[] = apps.map((app) => ({
    ...app,
    owner: ownerMap.get(app.user_id) ?? {
      display_name: "Unknown",
      accent_color: "#6B7086",
      user_id: app.user_id,
    },
  }));

  return {
    applications,
    profiles,
    allProfiles,
    currentUserId: user?.id ?? null,
  };
}
