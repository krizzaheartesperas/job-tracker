"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import clsx from "clsx";
import { updateApplicationStatus } from "@/lib/actions";
import { STATUS_LABELS, STATUS_COLORS, type ApplicationWithOwner, type Status } from "@/lib/types";

const COLUMNS: Status[] = ["applied", "screening", "interview", "offer", "rejected"];

function KanbanCard({
  app,
  colors,
  isOwn,
  showOwner,
  isDragging,
  isPending,
  onSelect,
  onEdit,
  onDragStart,
}: {
  app: ApplicationWithOwner;
  colors: (typeof STATUS_COLORS)[Status];
  isOwn: boolean;
  showOwner: boolean;
  isDragging: boolean;
  isPending: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDragStart: () => void;
}) {
  const initial = app.company.trim()[0]?.toUpperCase() ?? "?";

  return (
    <div
      draggable={isOwn}
      onDragStart={onDragStart}
      onClick={onSelect}
      className={clsx(
        "group relative rounded-lg border bg-surface p-3.5 shadow-[0_1px_2px_rgba(20,22,31,0.04)] transition-all duration-200",
        "hover:border-brand/25 hover:shadow-soft hover:-translate-y-px",
        colors.border,
        isOwn ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-40 scale-[0.98] shadow-none",
        isPending && "pointer-events-none"
      )}
    >
      <div className="flex gap-3">
        <div
          className={clsx(
            "w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold",
            colors.bg,
            colors.text
          )}
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-ink leading-snug line-clamp-2 group-hover:text-brand transition-colors">
              {app.company}
            </p>
            {showOwner && (
              <span
                className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0 ring-2 ring-surface"
                style={{ backgroundColor: app.owner.accent_color }}
                title={app.owner.display_name}
              >
                {app.owner.display_name[0]}
              </span>
            )}
            {isOwn && !showOwner && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity text-inkSoft hover:text-brand shrink-0 p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <EditIcon />
              </button>
            )}
            {isOwn && showOwner && (
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity text-inkSoft hover:text-brand shrink-0 p-0.5 -mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <EditIcon small />
              </button>
            )}
          </div>

          <p className="text-xs text-inkSoft leading-snug line-clamp-2 mt-1">{app.role}</p>

          <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-border/50">
            <span className="text-[10px] font-mono text-inkSoft/80">
              {format(parseISO(app.applied_date), "MMM d")}
            </span>
            {app.follow_up_date && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amberSoft/60 px-1.5 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-amber" />
                {format(parseISO(app.follow_up_date), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({
  applications,
  currentUserId,
  showOwner,
  onSelect,
  onEdit,
}: {
  applications: ApplicationWithOwner[];
  currentUserId: string | null;
  showOwner: boolean;
  onSelect: (app: ApplicationWithOwner) => void;
  onEdit: (app: ApplicationWithOwner) => void;
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
    if (currentUserId && app.user_id !== currentUserId) return;
    startTransition(() => {
      updateApplicationStatus(app.id, status);
    });
  }

  return (
    <div className="h-full min-h-0 flex flex-col rounded-xl border border-border/70 bg-surface shadow-soft overflow-hidden">
      <div className="flex-1 min-h-0 flex gap-0 overflow-x-auto kanban-scroll-x">
        {COLUMNS.map((status, index) => {
          const items = applications.filter((a) => a.status === status);
          const colors = STATUS_COLORS[status];
          const isOver = overCol === status;

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
                "flex flex-col min-w-[280px] w-[280px] xl:min-w-0 xl:flex-1 shrink-0 h-full transition-colors duration-200",
                index > 0 && "border-l border-border/60",
                isOver && "bg-brand/[0.03]"
              )}
            >
              {/* Column header */}
              <div
                className={clsx(
                  "shrink-0 px-4 py-3 border-b",
                  colors.border,
                  colors.bg
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={clsx("w-2 h-2 rounded-full shrink-0", colors.dot)} />
                    <span className={clsx("text-[11px] font-bold uppercase tracking-widest truncate", colors.text)}>
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  <span
                    className={clsx(
                      "text-[11px] font-mono font-semibold tabular-nums px-2 py-0.5 rounded-md border shrink-0",
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Scrollable cards */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain kanban-scroll px-3 py-3">
                <div className="space-y-2.5">
                  {items.map((app) => {
                    const isOwn = currentUserId === app.user_id;
                    return (
                      <KanbanCard
                        key={app.id}
                        app={app}
                        colors={colors}
                        isOwn={isOwn}
                        showOwner={showOwner}
                        isDragging={dragId === app.id}
                        isPending={isPending}
                        onSelect={() => onSelect(app)}
                        onEdit={() => onEdit(app)}
                        onDragStart={() => isOwn && setDragId(app.id)}
                      />
                    );
                  })}

                  {items.length === 0 && (
                    <div
                      className={clsx(
                        "rounded-lg border border-dashed py-8 px-3 text-center transition-colors",
                        isOver ? "border-brand/40 bg-brand/5" : "border-border/50 bg-surfaceMuted/20"
                      )}
                    >
                      <p className="text-[11px] text-inkSoft/60">Drop applications here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditIcon({ small }: { small?: boolean }) {
  const size = small ? 12 : 14;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}
