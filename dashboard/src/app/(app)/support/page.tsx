import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { TicketForm } from "@/components/ticket-form"
import { TicketList } from "@/components/ticket-list"
import type { SupportTicket } from "@/lib/types"

export default async function SupportPage() {
  const { profile } = await getUserProfile()
  const supabase = await createClient()

  // Get active engagement for this company
  const { data: engagement } = await supabase
    .from("engagements")
    .select("id")
    .eq("company_id", profile.company_id)
    .in("status", ["training", "supporting"])
    .limit(1)
    .single()

  // Get tickets — RLS handles role-based filtering
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .order("request_date", { ascending: false })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Support Tickets
      </h1>

      {engagement && profile.contact_id ? (
        <TicketForm
          engagementId={engagement.id}
          contactId={profile.contact_id}
        />
      ) : (
        <div className="rounded-xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            No active engagement found. Support ticket creation is unavailable.
          </p>
        </div>
      )}

      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold">Ticket History</h2>
        <TicketList tickets={(tickets ?? []) as SupportTicket[]} />
      </section>
    </div>
  )
}
