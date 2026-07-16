import { differenceInCalendarDays, parseISO, format } from "date-fns";
import type { Application } from "@/lib/types";
import clsx from "clsx";

export default function UpcomingFollowUps({ applications }: { applications: Application[] }) {
  const today = new Date();
  const upcoming = applications
    .filter((a) => a.follow_up_date && !["rejected", "withdrawn"].includes(a.status))
    .map((a) => ({
      app: a,
      days: differenceInCalendarDays(parseISO(a.follow_up_date as string), today),
    }))
    .filter((x) => x.days <= 14)
    .sort((a, b) => a.days - b.days);

  return (
    <div className="card p-6">
      <h2 className="font-display font-semibold text-lg mb-4">Follow-ups on deck</h2>
      {upcoming.length === 0 ? (
        <p className="text-sm text-inkSoft">
          Nothing due in the next two weeks. Add a follow-up date to an application to see it here.
        </p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map(({ app, days }) => (
            <li key={app.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {app.role} · {app.company}
                </p>
                <p className="text-xs text-inkSoft">
                  {format(parseISO(app.follow_up_date as string), "EEE, MMM d")}
                </p>
              </div>
              <span
                className={clsx(
                  "shrink-0 text-xs font-mono px-2 py-1 rounded-sm",
                  days < 0
                    ? "bg-redSoft text-red"
                    : days === 0
                    ? "bg-amberSoft text-[#8a611f]"
                    : "bg-surfaceMuted text-inkSoft"
                )}
              >
                {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `in ${days}d`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
