"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import clsx from "clsx";
import { STATUS_COLORS, STATUS_LABELS, type Application } from "@/lib/types";

type SortKey = "company" | "applied_date" | "follow_up_date" | "status";

export default function ApplicationsTable({
  applications,
  onSelect,
  onEdit,
}: {
  applications: Application[];
  onSelect: (app: Application) => void;
  onEdit: (app: Application) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("applied_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...applications].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const columns: { key: SortKey; label: string }[] = [
    { key: "company", label: "Company / role" },
    { key: "status", label: "Status" },
    { key: "applied_date", label: "Applied" },
    { key: "follow_up_date", label: "Follow-up" },
  ];

  if (applications.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="font-display font-semibold text-lg mb-1">No applications yet</p>
        <p className="text-sm text-inkSoft">
          Add your first application to start filling in the trail.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden bg-surface shadow-sm border border-border/60 rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surfaceMuted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-5 py-4 font-semibold text-inkSoft text-xs uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-ink transition-colors group"
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <span className={clsx("text-brand/70", sortKey !== col.key && "opacity-0 group-hover:opacity-40 transition-opacity")}>
                      {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
          {sorted.map((app) => {
            const colors = STATUS_COLORS[app.status];
            return (
              <tr
                key={app.id}
                className="hover:bg-surfaceMuted/40 cursor-pointer transition-colors group"
                onClick={() => onSelect(app)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={clsx("w-1 h-10 rounded-full", colors.bg.replace("bg-", "bg-opacity-100 bg-").replace("Soft", ""))} />
                    <div>
                      <p className="font-semibold text-ink group-hover:text-brand transition-colors">{app.company}</p>
                      <p className="text-inkSoft text-xs mt-0.5">{app.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border",
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    <span className={clsx("w-1.5 h-1.5 rounded-full", colors.dot)} />
                    {STATUS_LABELS[app.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-inkSoft whitespace-nowrap font-medium text-sm">
                  {format(parseISO(app.applied_date), "MMM d, yyyy")}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {app.follow_up_date ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amberSoft/50 text-[#8a611f] border border-amber/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                      {format(parseISO(app.follow_up_date), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-inkSoft/50">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
