"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import ApplicationsTable from "@/components/ApplicationsTable";
import KanbanBoard from "@/components/KanbanBoard";
import ApplicationModal from "@/components/ApplicationModal";
import ApplicationViewModal from "@/components/ApplicationViewModal";
import { STATUS_LABELS, STATUSES, type Application, type Status } from "@/lib/types";

export default function ApplicationsView({
  applications,
}: {
  applications: Application[];
}) {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  
  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  const [selectedApp, setSelectedApp] = useState<Application | undefined>(undefined);

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

  function openNew() {
    setSelectedApp(undefined);
    setViewModalOpen(false);
    setEditModalOpen(true);
  }

  function openEdit(app: Application) {
    setSelectedApp(app);
    setViewModalOpen(false);
    setEditModalOpen(true);
  }

  function openView(app: Application) {
    setSelectedApp(app);
    setEditModalOpen(false);
    setViewModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkSoft">
            Applications
          </p>
          <h1 className="font-display font-semibold text-3xl mt-1 tracking-tight">Every step of the way</h1>
        </div>
        <button onClick={openNew} className="btn-primary shadow-soft hover:shadow-softLg transition-shadow">
          + Add application
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs bg-surface border-border/60 focus:border-brand transition-colors shadow-sm rounded-lg"
          placeholder="Search company or role…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input max-w-[180px] bg-surface border-border/60 focus:border-brand transition-colors shadow-sm rounded-lg cursor-pointer"
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

        <div className="ml-auto flex rounded-lg border border-border/60 overflow-hidden shadow-sm bg-surface p-1">
          <button
            onClick={() => setView("kanban")}
            className={clsx(
              "px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200",
              view === "kanban" ? "bg-ink text-white shadow-sm" : "text-inkSoft hover:text-ink hover:bg-surfaceMuted/50"
            )}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("table")}
            className={clsx(
              "px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200",
              view === "table" ? "bg-ink text-white shadow-sm" : "text-inkSoft hover:text-ink hover:bg-surfaceMuted/50"
            )}
          >
            Table
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard applications={filtered} onSelect={openView} onEdit={openEdit} />
      ) : (
        <ApplicationsTable applications={filtered} onSelect={openView} onEdit={openEdit} />
      )}

      {editModalOpen && (
        <ApplicationModal application={selectedApp} onClose={() => setEditModalOpen(false)} />
      )}
      
      {viewModalOpen && selectedApp && (
        <ApplicationViewModal application={selectedApp} onClose={() => setViewModalOpen(false)} onEdit={() => openEdit(selectedApp)} />
      )}
    </div>
  );
}
