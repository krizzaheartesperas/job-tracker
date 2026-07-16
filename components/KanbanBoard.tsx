"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import clsx from "clsx";
import { updateApplicationStatus } from "@/lib/actions";
import { STATUS_LABELS, STATUS_COLORS, type Application, type Status } from "@/lib/types";

const COLUMNS: Status[] = ["applied", "screening", "interview", "offer", "rejected"];

export default function KanbanBoard({
  applications,
  onSelect,
  onEdit,
}: {
  applications: Application[];
  onSelect: (app: Application) => void;
  onEdit: (app: Application) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDrop(status: Status) {
    if (!dragId) return;
    const app = applications.find((a) => a.id === dragId);
    setOverCol(null);
    setDragId(null);
    if (!app || app.status === status) return;
    startTransition(() => {
      updateApplicationStatus(app.id, status);
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {COLUMNS.map((status) => {
        const items = applications.filter((a) => a.status === status);
        const colors = STATUS_COLORS[status];
        
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
            onDrop={() => handleDrop(status)}
            className={clsx(
              "rounded-xl p-3 min-h-[300px] border transition-all duration-200 flex flex-col",
              overCol === status 
                ? `border-brand bg-brand/5 scale-[1.02] shadow-sm` 
                : `border-border bg-surfaceMuted/30 hover:bg-surfaceMuted/50`
            )}
          >
            <div className="flex items-center justify-between mb-4 px-2 py-1">
              <div className="flex items-center gap-2">
                <div className={clsx("w-2 h-2 rounded-full", colors.dot)} />
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-inkSoft bg-surface rounded-full px-2 py-0.5 shadow-sm border border-border/50">
                {items.length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {items.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={() => setDragId(app.id)}
                  onClick={() => onSelect(app)}
                  className={clsx(
                    "card p-3.5 cursor-grab active:cursor-grabbing hover:shadow-softLg transition-all duration-200 border-l-4 group bg-surface relative",
                    colors.border,
                    dragId === app.id && "opacity-50 scale-95 shadow-none",
                    isPending && "pointer-events-none"
                  )}
                >
                  <button 
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-inkSoft hover:text-brand"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(app);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <p className="text-sm font-semibold text-ink truncate pr-6 group-hover:text-brand transition-colors">{app.company}</p>
                  <p className="text-xs text-inkSoft truncate mt-0.5">{app.role}</p>
                  {app.follow_up_date && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber/80"></span>
                      <p className="text-[11px] text-amber-700 font-medium">
                        Follow up {format(parseISO(app.follow_up_date), "MMM d")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-inkSoft/70 text-center py-4">Drop here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
