"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import type { Profile } from "@/lib/types";

export default function PersonSwitcher({
  profiles,
  currentUserId,
  defaultPersonKey,
  layout = "vertical",
}: {
  profiles: Profile[];
  currentUserId: string | null;
  defaultPersonKey?: string | null;
  layout?: "vertical" | "horizontal";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const ownKey =
    defaultPersonKey ??
    profiles.find((p) => p.user_id === currentUserId)?.display_name.toLowerCase() ??
    null;
  const personParam = searchParams.get("person");

  // No param = your workspace; ?person=all = everyone; ?person=kei = Kei's workspace
  const current =
    personParam === "all"
      ? "all"
      : personParam ?? ownKey ?? "all";

  function setPerson(person: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (person === "all") {
      params.set("person", "all");
    } else if (person === ownKey) {
      params.delete("person");
    } else {
      params.set("person", person);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  const options = [
    { key: "all", label: "All", color: null },
    ...profiles.map((p) => ({
      key: p.display_name.toLowerCase(),
      label: p.display_name,
      color: p.accent_color,
    })),
  ];

  return (
    <div
      className={clsx(
        "bg-surfaceMuted/60 rounded-lg p-1 border border-border/40",
        layout === "vertical" ? "flex flex-col gap-0.5" : "grid grid-cols-2 gap-0.5"
      )}
    >
      {options.map((opt) => {
        const active = current === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setPerson(opt.key)}
            className={clsx(
              "flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-semibold transition-all duration-200",
              layout === "vertical" && "w-full",
              active
                ? "bg-surface text-ink shadow-sm border border-border/50"
                : "text-inkSoft hover:text-ink hover:bg-surface/50"
            )}
          >
            {opt.color ? (
              <span
                className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/50"
                style={{ backgroundColor: opt.color }}
              />
            ) : (
              <span className="w-2 h-2 rounded-full shrink-0 bg-gradient-to-br from-brand to-brand2 ring-1 ring-white/50" />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
