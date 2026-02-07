import { formatDate } from "@/lib/utils"
import type { TrainingLog } from "@/lib/types"

interface SessionListProps {
  sessions: TrainingLog[]
  title: string
}

function StatusBadge({
  status,
  attended,
}: {
  status: string
  attended: boolean | null
}) {
  const colors: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
    rescheduled: "bg-yellow-50 text-yellow-700",
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[status] ?? "bg-gray-50 text-gray-700"
      }`}
    >
      {status === "completed" && attended === false
        ? "Absent"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function SessionList({ sessions, title }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">No sessions</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  Session {s.session_number}
                  {s.title ? ` — ${s.title}` : ""}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {s.status === "completed"
                    ? formatDate(s.completed_date)
                    : formatDate(s.scheduled_date)}
                  {s.location ? ` · ${s.location}` : ""}
                  {s.delivered_by ? ` · ${s.delivered_by}` : ""}
                </p>
              </div>
              <StatusBadge status={s.status} attended={s.attended} />
            </div>
            {s.session_notes && (
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {s.session_notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
