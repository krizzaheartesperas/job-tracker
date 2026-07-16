import { STATUS_LABELS, type Application, type Status } from "@/lib/types";

const STAGES: Status[] = ["applied", "screening", "interview", "offer"];

export default function PipelineTrail({ applications }: { applications: Application[] }) {
  const counts = STAGES.map(
    (status) => applications.filter((a) => a.status === status).length
  );
  const max = Math.max(1, ...counts);
  const rejected = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="font-display font-semibold text-lg">Pipeline</h2>
        {rejected > 0 && (
          <span className="text-xs font-mono text-inkSoft">{rejected} rejected</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {STAGES.map((status, i) => {
          const count = counts[i];
          const pct = Math.round((count / max) * 100);
          const isLast = i === STAGES.length - 1;
          return (
            <div key={status} className="flex flex-col">
              <div className="h-24 rounded-md bg-surfaceMuted relative overflow-hidden flex items-end">
                <div
                  className={
                    "w-full rounded-md transition-all " +
                    (isLast ? "bg-brand-gradient" : "bg-brand")
                  }
                  style={{ height: `${Math.max(pct, count > 0 ? 12 : 0)}%`, opacity: count === 0 ? 0.12 : 1 }}
                />
              </div>
              <span className="font-mono text-2xl font-medium mt-3 text-ink">{count}</span>
              <span className="text-xs uppercase tracking-wide text-inkSoft mt-1">
                {STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
