import { createServiceClient } from "@/lib/supabase"
import { SurveyShell } from "@/components/survey-shell"

export default async function SurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>
}) {
  const { company } = await searchParams

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-muted-foreground">Invalid survey link.</p>
      </div>
    )
  }

  // Verify the company exists and fetch its name
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", company)
    .single()

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-muted-foreground">This survey link is not valid.</p>
      </div>
    )
  }

  return <SurveyShell companyId={data.id} companyName={data.name} />
}
