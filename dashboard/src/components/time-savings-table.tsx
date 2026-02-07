import { formatMinutes } from "@/lib/utils"

interface TimeSavingsRow {
  taskName: string
  role: string
  timeBefore: number | null
  timeAfter: number | null
  timeSaved: number | null
}

interface TimeSavingsTableProps {
  rows: TimeSavingsRow[]
}

function pctReduction(before: number | null, saved: number | null) {
  if (!before || !saved || before === 0) return "—"
  return `${Math.round((saved / before) * 100)}%`
}

export function TimeSavingsTable({ rows }: TimeSavingsTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No task data yet
      </p>
    )
  }

  // Group by role for subtotals
  const byRole: Record<string, TimeSavingsRow[]> = {}
  for (const row of rows) {
    const r = row.role || "Unknown"
    if (!byRole[r]) byRole[r] = []
    byRole[r].push(row)
  }

  let grandTotalSaved = 0

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Task</th>
            <th className="pb-2 pr-4 font-medium">Role</th>
            <th className="pb-2 pr-4 text-right font-medium">Before</th>
            <th className="pb-2 pr-4 text-right font-medium">After</th>
            <th className="pb-2 pr-4 text-right font-medium">Saved</th>
            <th className="pb-2 text-right font-medium">Reduction</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(byRole).map(([role, tasks]) => {
            const roleSaved = tasks.reduce(
              (sum, t) => sum + (t.timeSaved ?? 0),
              0
            )
            grandTotalSaved += roleSaved

            return tasks.map((t, i) => (
              <tr key={`${role}-${i}`} className="border-b border-border/50">
                <td className="py-2.5 pr-4">{t.taskName}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{t.role}</td>
                <td className="py-2.5 pr-4 text-right">
                  {formatMinutes(t.timeBefore)}
                </td>
                <td className="py-2.5 pr-4 text-right">
                  {formatMinutes(t.timeAfter)}
                </td>
                <td className="py-2.5 pr-4 text-right font-medium text-success">
                  {formatMinutes(t.timeSaved)}
                </td>
                <td className="py-2.5 text-right">
                  {pctReduction(t.timeBefore, t.timeSaved)}
                </td>
              </tr>
            ))
          })}
          <tr className="border-t-2 border-border font-semibold">
            <td className="pt-3" colSpan={4}>
              Total Time Saved
            </td>
            <td className="pt-3 text-right text-success">
              {formatMinutes(grandTotalSaved)}
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
