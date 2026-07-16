"use client";

import { format, parseISO } from "date-fns";
import clsx from "clsx";
import { STATUS_LABELS, STATUS_COLORS, type Application } from "@/lib/types";

export default function ApplicationViewModal({
  application,
  onClose,
  onEdit,
}: {
  application: Application;
  onClose: () => void;
  onEdit: () => void;
}) {
  const colors = STATUS_COLORS[application.status];

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-0 border-0 shadow-softLg bg-surface flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={clsx("p-6 border-b border-border relative overflow-hidden", colors.bg)}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border bg-surface/50 backdrop-blur-sm",
                  colors.text,
                  colors.border
                )}
              >
                <span className={clsx("w-1.5 h-1.5 rounded-full", colors.dot)} />
                {STATUS_LABELS[application.status]}
              </span>
              
              <button onClick={onClose} className="text-inkSoft hover:text-ink transition-colors p-1 bg-surface/50 rounded-full backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <h2 className="font-display font-semibold text-3xl tracking-tight text-ink mb-1">
              {application.role}
            </h2>
            <p className="text-lg font-medium text-ink/80">{application.company}</p>
          </div>
          <div className={clsx("absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -mr-20 -mt-20", colors.bg.replace("Soft", ""))} />
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-xs font-medium text-inkSoft uppercase tracking-wider mb-1">Applied On</p>
              <p className="font-medium text-ink">{format(parseISO(application.applied_date), "MMMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-inkSoft uppercase tracking-wider mb-1">Follow-up Date</p>
              {application.follow_up_date ? (
                <p className="font-medium text-amber-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                  {format(parseISO(application.follow_up_date), "MMMM d, yyyy")}
                </p>
              ) : (
                <p className="text-inkSoft">—</p>
              )}
            </div>
            
            {application.location && (
              <div>
                <p className="text-xs font-medium text-inkSoft uppercase tracking-wider mb-1">Location</p>
                <p className="font-medium text-ink">{application.location}</p>
              </div>
            )}
            
            {application.salary && (
              <div>
                <p className="text-xs font-medium text-inkSoft uppercase tracking-wider mb-1">Salary Range</p>
                <p className="font-medium text-ink">{application.salary}</p>
              </div>
            )}
            
            {application.job_url && (
              <div className="col-span-2">
                <p className="text-xs font-medium text-inkSoft uppercase tracking-wider mb-1">Job Link</p>
                <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline truncate block">
                  {application.job_url}
                </a>
              </div>
            )}
          </div>

          {application.notes && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-medium text-inkSoft uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-ink/90 whitespace-pre-wrap leading-relaxed bg-surfaceMuted/30 p-4 rounded-xl border border-border/50">
                {application.notes}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-surfaceMuted/10 mt-auto flex justify-between items-center">
          <p className="text-xs text-inkSoft">Last updated {format(new Date(application.updated_at), "MMM d, yyyy")}</p>
          <button 
            onClick={onEdit} 
            className="btn-primary"
          >
            Edit Application
          </button>
        </div>
      </div>
    </div>
  );
}
