import { getUserProfile } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const { profile } = await getUserProfile()

  if (profile.role === "exec") {
    redirect("/dashboard")
  } else {
    redirect("/me")
  }
}
