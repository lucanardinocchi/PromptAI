import { getUserProfile } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function MePage() {
  const { profile } = await getUserProfile()

  if (!profile.contact_id) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">
          Your account is not linked to a contact profile yet. Please contact
          your administrator.
        </p>
      </div>
    )
  }

  redirect(`/people/${profile.contact_id}`)
}
