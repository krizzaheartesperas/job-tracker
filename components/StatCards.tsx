import type { Application } from "@/lib/types";

function pct(n: number, d: number) {
  if (d === 0) return "—";
  return `${Math.round((n / d) * 100)}%`;
}

export default function StatCards({ applications }: { applications: Application[] }) {
  const total = applications.length;
  const active = applications.filter(
    (a) => !["rejected", "withdrawn"].includes(a.status)
  ).length;
  const interviews = applications.filter((a) =>
    ["interview", "offer"].includes(a.status)
  ).length;
  const offers = applications.filter((a) => a.status === "offer").length;

  const stats = [
    { label: "Total applications", value: total.toString(), accent: "bg-brand" },
    { label: "In progress", value: active.toString(), accent: "bg-brand2" },
    { label: "Interview rate", value: pct(interviews, total), accent: "bg-amber" },
    { label: "Offer rate", value: pct(offers, total), accent: "bg-ink" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-5 relative overflow-hidden">
          <span className={`absolute top-0 left-0 h-1 w-full ${s.accent}`} />
          <p className="font-mono text-3xl font-medium text-ink">{s.value}</p>
          <p className="text-xs uppercase tracking-wide text-inkSoft mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
