import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { SessionList } from "@/components/session-list"
import { TaskProgress } from "@/components/task-progress"
import type { TrainingLog, ContactTask } from "@/lib/types"

export default async function PersonPage({
  params,
}: {
  params: Promise<{ contactId: string }>
}) {
  const { contactId } = await params
  const { profile } = await getUserProfile()
  const supabase = await createClient()

  // IC can only view themselves
  if (profile.role === "ic" && profile.contact_id !== contactId) {
    redirect("/me")
  }

  // Fetch contact
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single()

  if (!contact) notFound()

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("contact_tasks")
    .select("*")
    .eq("contact_id", contactId)
    .order("task_name")

  // Fetch training log
  const { data: sessions } = await supabase
    .from("training_log")
    .select("*")
    .eq("contact_id", contactId)
    .order("session_number")

  const upcoming = (sessions ?? []).filter(
    (s) => s.status === "scheduled" || s.status === "rescheduled"
  ) as TrainingLog[]

  const completed = (sessions ?? []).filter(
    (s) => s.status === "completed"
  ) as TrainingLog[]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {contact.name}
        </h1>
        {contact.role_title && (
          <p className="mt-1 text-muted-foreground">{contact.role_title}</p>
        )}
        {contact.role_description && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {contact.role_description}
          </p>
        )}
      </div>

      {/* Sessions */}
      <section className="space-y-6 rounded-xl border border-border bg-background p-6">
        <h2 className="text-lg font-semibold">Training Sessions</h2>
        <SessionList sessions={upcoming} title="Upcoming" />
        <SessionList sessions={completed} title="Completed" />
      </section>

      {/* Tasks */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Tasks</h2>
        <TaskProgress tasks={(tasks ?? []) as ContactTask[]} />
      </section>
    </div>
  )
}
