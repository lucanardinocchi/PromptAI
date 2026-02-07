import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await getUserProfile()
  const supabase = await createClient()

  // Fetch company name for sidebar
  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single()

  // Fetch user's contact name for sidebar
  let userName = "User"
  if (profile.contact_id) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("name")
      .eq("id", profile.contact_id)
      .single()
    if (contact) userName = contact.name
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={profile.role}
        userName={userName}
        companyName={company?.name ?? "—"}
      />
      <main className="flex-1 overflow-y-auto bg-muted">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
