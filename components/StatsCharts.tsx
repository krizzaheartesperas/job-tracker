"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO, startOfWeek } from "date-fns";
import { STATUS_LABELS, type Application } from "@/lib/types";

const PIE_COLORS: Record<string, string> = {
  applied: "#6B7086",
  screening: "#14B8A6",
  interview: "#F5A524",
  offer: "#5B5FEF",
  rejected: "#EF4444",
  withdrawn: "#E5E7F0",
};

export function ApplicationsOverTime({ applications }: { applications: Application[] }) {
  const byWeek = new Map<string, number>();
  for (const app of applications) {
    const weekStart = startOfWeek(parseISO(app.applied_date));
    const key = format(weekStart, "MMM d");
    byWeek.set(key, (byWeek.get(key) ?? 0) + 1);
  }
  const data = Array.from(byWeek.entries()).map(([week, count]) => ({ week, count }));

  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-inkSoft">
        No applications logged yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trailFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B5FEF" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#5B5FEF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E5E7F0" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "#6B7086", fontFamily: "var(--font-jetbrains)" }}
          axisLine={{ stroke: "#E5E7F0" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#6B7086", fontFamily: "var(--font-jetbrains)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #E5E7F0",
            fontFamily: "var(--font-inter)",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Applications"
          stroke="#5B5FEF"
          strokeWidth={2}
          fill="url(#trailFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusBreakdown({ applications }: { applications: Application[] }) {
  const counts = new Map<string, number>();
  for (const app of applications) {
    counts.set(app.status, (counts.get(app.status) ?? 0) + 1);
  }
  const data = Array.from(counts.entries()).map(([status, value]) => ({
    name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    value,
    status,
  }));

  if (data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-inkSoft">
        Nothing to break down yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={PIE_COLORS[entry.status]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #E5E7F0",
            fontFamily: "var(--font-inter)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
