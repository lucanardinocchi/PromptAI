import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { ClientUser } from "@/lib/types"

export async function getUserProfile(): Promise<{
  userId: string
  profile: ClientUser
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("client_users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single()

  if (!profile) {
    // User is authenticated but has no dashboard profile
    await supabase.auth.signOut()
    redirect("/login")
  }

  return { userId: user.id, profile: profile as ClientUser }
}
