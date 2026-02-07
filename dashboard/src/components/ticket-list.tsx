import { formatDate } from "@/lib/utils"
import type { SupportTicket } from "@/lib/types"

interface TicketListProps {
  tickets: SupportTicket[]
}

const statusColors: Record<string, string> = {
  open: "bg-yellow-50 text-yellow-700",
  in_progress: "bg-blue-50 text-blue-700",
  resolved: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-gray-600",
}

const categoryLabels: Record<string, string> = {
  mcp_issue: "MCP Issue",
  skill_issue: "Skill Issue",
  claude_config: "Claude Config",
  troubleshooting: "Troubleshooting",
  training_request: "Training Request",
  ad_hoc_support: "Ad-hoc Support",
  other: "Other",
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No support tickets yet
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 pr-4 font-medium">Category</th>
            <th className="pb-2 pr-4 font-medium">Description</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Resolution</th>
            <th className="pb-2 text-right font-medium">Hours</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b border-border/50">
              <td className="whitespace-nowrap py-2.5 pr-4">
                {formatDate(t.request_date)}
              </td>
              <td className="py-2.5 pr-4">
                {categoryLabels[t.category ?? ""] ?? t.category}
              </td>
              <td className="max-w-xs truncate py-2.5 pr-4">
                {t.description}
              </td>
              <td className="py-2.5 pr-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[t.status] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {t.status.replace("_", " ")}
                </span>
              </td>
              <td className="max-w-xs truncate py-2.5 pr-4 text-muted-foreground">
                {t.resolution ?? "—"}
              </td>
              <td className="py-2.5 text-right">{t.hours_spent ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
