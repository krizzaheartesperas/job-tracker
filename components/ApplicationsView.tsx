"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import ApplicationsTable from "@/components/ApplicationsTable";
import KanbanBoard from "@/components/KanbanBoard";
import ApplicationModal from "@/components/ApplicationModal";
import ApplicationViewModal from "@/components/ApplicationViewModal";
import { STATUS_LABELS, STATUSES, type ApplicationWithOwner, type Profile, type Status } from "@/lib/types";

export default function ApplicationsView({
  applications,
  currentUserId,
  showOwner,
  personFilter = "all",
  profiles = [],
}: {
  applications: ApplicationWithOwner[];
  currentUserId: string | null;
  showOwner: boolean;
  personFilter?: string;
  profiles?: Profile[];
}) {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationWithOwner | undefined>(undefined);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchesQuery =
        query.trim() === "" ||
        a.company.toLowerCase().includes(query.toLowerCase()) ||
        a.role.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [applications, query, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<Status, number>> = {};
    for (const app of filtered) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return counts;
  }, [filtered]);

  function openNew() {
    setSelectedApp(undefined);
    setViewModalOpen(false);
    setEditModalOpen(true);
  }

  function openEdit(app: ApplicationWithOwner) {
    if (currentUserId && app.user_id !== currentUserId) return;
    setSelectedApp(app);
    setViewModalOpen(false);
    setEditModalOpen(true);
  }

  function openView(app: ApplicationWithOwner) {
    setSelectedApp(app);
    setEditModalOpen(false);
    setViewModalOpen(true);
  }

  const activeProfile = profiles.find(
    (p) => p.display_name.toLowerCase() === personFilter.toLowerCase()
  );

  const pageTitle =
    personFilter === "all"
      ? "Every step of the way"
      : activeProfile
      ? `${activeProfile.display_name}'s applications`
      : "Every step of the way";

  return (
    <div
      className={clsx(
        view === "kanban"
          ? "flex flex-col h-[calc(100vh-6.5rem)] md:h-[calc(100vh-4.5rem)]"
          : "space-y-6"
      )}
    >
      {/* Page header */}
      <div className={clsx("shrink-0", view === "kanban" ? "space-y-4 pb-4" : "space-y-6")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkSoft">
              Applications
            </p>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="font-display font-semibold text-2xl md:text-3xl tracking-tight">
                {pageTitle}
              </h1>
              {activeProfile && (
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: activeProfile.accent_color }}
                />
              )}
            </div>
            {view === "kanban" && (
              <p className="text-sm text-inkSoft mt-1">
                {filtered.length} application{filtered.length !== 1 ? "s" : ""}
                {query || statusFilter !== "all" ? " matching filters" : ""}
              </p>
            )}
          </div>
          <button
            onClick={openNew}
            className="btn-primary shadow-soft hover:shadow-softLg transition-shadow shrink-0"
          >
            + Add application
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-surface px-3 py-2.5 shadow-[0_1px_2px_rgba(20,22,31,0.03)]">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-inkSoft/50 pointer-events-none" />
            <input
              className="input pl-9 bg-surfaceMuted/30 border-border/50 focus:border-brand transition-colors rounded-lg h-9"
              placeholder="Search company or role…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className="input w-auto min-w-[140px] bg-surfaceMuted/30 border-border/50 focus:border-brand transition-colors rounded-lg cursor-pointer h-9"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          {view === "kanban" && (
            <div className="hidden lg:flex items-center gap-1.5 ml-1">
              {STATUSES.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-mono text-inkSoft bg-surfaceMuted/50 px-2 py-1 rounded-md border border-border/40"
                >
                  {STATUS_LABELS[s].slice(0, 3)} {statusCounts[s] ?? 0}
                </span>
              ))}
            </div>
          )}

          <div className="ml-auto flex rounded-lg border border-border/60 overflow-hidden bg-surfaceMuted/30 p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={clsx(
                "px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all duration-200",
                view === "kanban"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-inkSoft hover:text-ink"
              )}
            >
              Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={clsx(
                "px-3.5 py-1.5 text-sm font-semibold rounded-md transition-all duration-200",
                view === "table"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-inkSoft hover:text-ink"
              )}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="flex-1 min-h-0">
          <KanbanBoard
            applications={filtered}
            currentUserId={currentUserId}
            showOwner={showOwner}
            onSelect={openView}
            onEdit={openEdit}
          />
        </div>
      ) : (
        <ApplicationsTable
          applications={filtered}
          currentUserId={currentUserId}
          showOwner={showOwner}
          onSelect={openView}
          onEdit={openEdit}
        />
      )}

      {editModalOpen && (
        <ApplicationModal application={selectedApp} onClose={() => setEditModalOpen(false)} />
      )}

      {viewModalOpen && selectedApp && (
        <ApplicationViewModal
          application={selectedApp}
          currentUserId={currentUserId}
          onClose={() => setViewModalOpen(false)}
          onEdit={() => openEdit(selectedApp)}
        />
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
