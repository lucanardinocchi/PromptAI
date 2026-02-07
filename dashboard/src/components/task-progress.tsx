import { formatMinutes } from "@/lib/utils"
import type { ContactTask } from "@/lib/types"

interface TaskProgressProps {
  tasks: ContactTask[]
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No tasks recorded yet
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const pct =
          task.time_before_ai && task.time_saved_minutes
            ? Math.round(
                (task.time_saved_minutes / task.time_before_ai) * 100
              )
            : null

        return (
          <div
            key={task.id}
            className="rounded-xl border border-border bg-background p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{task.task_name}</h4>
                {task.task_description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {task.task_description}
                  </p>
                )}
              </div>
              {task.frequency && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {task.frequency.replace("_", " ")}
                </span>
              )}
            </div>

            {task.software_used && (
              <p className="mt-2 text-xs text-muted-foreground">
                Software: {task.software_used}
              </p>
            )}

            {/* Time reduction bar */}
            {task.time_before_ai !== null && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>
                    Before: {formatMinutes(task.time_before_ai)} → After:{" "}
                    {formatMinutes(task.time_after_ai)}
                  </span>
                  {pct !== null && (
                    <span className="font-medium text-success">
                      {pct}% reduction
                    </span>
                  )}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(pct ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Issues */}
            {(task.issues_before_ai || task.issues_after_ai) && (
              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                {task.issues_before_ai && (
                  <div>
                    <p className="mb-0.5 font-medium text-muted-foreground">
                      Issues before AI
                    </p>
                    <p>{task.issues_before_ai}</p>
                  </div>
                )}
                {task.issues_after_ai && (
                  <div>
                    <p className="mb-0.5 font-medium text-muted-foreground">
                      Issues after AI
                    </p>
                    <p>{task.issues_after_ai}</p>
                  </div>
                )}
              </div>
            )}

            {/* Linked skills and MCPs */}
            {(task.linked_skills?.length ||
              task.linked_mcp_connections?.length) && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {task.linked_skills?.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                  >
                    {s}
                  </span>
                ))}
                {task.linked_mcp_connections?.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
