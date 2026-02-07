import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MetricCard } from "@/components/metric-card"
import { UsageChart } from "@/components/usage-chart"
import { TimeSavingsTable } from "@/components/time-savings-table"
import { formatMinutes, formatNumber } from "@/lib/utils"
import Link from "next/link"

export default async function DashboardPage() {
  const { profile } = await getUserProfile()

  // Exec only
  if (profile.role !== "exec") {
    redirect("/me")
  }

  const supabase = await createClient()

  // Get all contacts for this company
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, role_title")
    .eq("company_id", profile.company_id)
    .order("name")

  const contactIds = (contacts ?? []).map((c) => c.id)
  const contactMap = new Map(
    (contacts ?? []).map((c) => [c.id, c])
  )

  // Guard for empty contacts — use an impossible UUID to get empty results
  const safeIds =
    contactIds.length > 0
      ? contactIds
      : ["00000000-0000-0000-0000-000000000000"]

  // Get contact_tasks for time savings
  const { data: tasks } = await supabase
    .from("contact_tasks")
    .select("*")
    .in("contact_id", safeIds)

  // Get ai_usage for this month
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

  const { data: usage } = await supabase
    .from("ai_usage")
    .select("*")
    .eq("company_id", profile.company_id)
    .gte("usage_date", monthStart)

  // Get training log for session counts
  const { data: sessions } = await supabase
    .from("training_log")
    .select("contact_id, status")
    .eq("status", "completed")
    .in("contact_id", safeIds)

  // --- Compute metrics ---

  const totalTimeSaved = (tasks ?? []).reduce(
    (sum, t) => sum + (t.time_saved_minutes ?? 0),
    0
  )

  const totalTokens = (usage ?? []).reduce(
    (sum, u) => sum + (u.tokens_used ?? 0),
    0
  )

  const activeUserIds = new Set((usage ?? []).map((u) => u.contact_id))

  // Usage chart data — tokens by person
  const tokensByPerson: Record<string, number> = {}
  for (const u of usage ?? []) {
    tokensByPerson[u.contact_id] =
      (tokensByPerson[u.contact_id] ?? 0) + u.tokens_used
  }

  const chartData = Object.entries(tokensByPerson)
    .map(([contactId, tokens]) => {
      const contact = contactMap.get(contactId)
      return {
        name: contact?.name ?? "Unknown",
        tokens,
        role: contact?.role_title ?? "—",
      }
    })
    .sort((a, b) => b.tokens - a.tokens)

  // Time savings rows
  const timeSavingsRows = (tasks ?? [])
    .filter((t) => t.time_before_ai !== null)
    .map((t) => ({
      taskName: t.task_name,
      role: contactMap.get(t.contact_id)?.role_title ?? "—",
      timeBefore: t.time_before_ai,
      timeAfter: t.time_after_ai,
      timeSaved: t.time_saved_minutes,
    }))

  // Session counts per person
  const sessionCounts: Record<string, number> = {}
  for (const s of sessions ?? []) {
    sessionCounts[s.contact_id] = (sessionCounts[s.contact_id] ?? 0) + 1
  }

  // People rows for the table
  const peopleRows = (contacts ?? []).map((c) => {
    const personTasks = (tasks ?? []).filter((t) => t.contact_id === c.id)
    const saved = personTasks.reduce(
      (sum, t) => sum + (t.time_saved_minutes ?? 0),
      0
    )
    return {
      id: c.id,
      name: c.name,
      role: c.role_title ?? "—",
      timeSaved: saved,
      sessionsCompleted: sessionCounts[c.id] ?? 0,
    }
  })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Hours Saved"
          value={formatMinutes(totalTimeSaved)}
          sub="across all tasks"
        />
        <MetricCard
          label="Active Users"
          value={String(activeUserIds.size)}
          sub="with AI usage this month"
        />
        <MetricCard
          label="Tokens Used"
          value={formatNumber(totalTokens)}
          sub="this month"
        />
      </div>

      {/* AI Usage */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold">AI Usage by Person</h2>
        <UsageChart data={chartData} />
      </section>

      {/* Time Savings */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold">Time Savings by Task</h2>
        <TimeSavingsTable rows={timeSavingsRows} />
      </section>

      {/* People */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold">People</h2>
        {peopleRows.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No contacts yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 pr-4 text-right font-medium">
                    Time Saved
                  </th>
                  <th className="pb-2 text-right font-medium">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {peopleRows.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/people/${p.id}`}
                        className="text-primary hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {p.role}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      {formatMinutes(p.timeSaved)}
                    </td>
                    <td className="py-2.5 text-right">
                      {p.sessionsCompleted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
