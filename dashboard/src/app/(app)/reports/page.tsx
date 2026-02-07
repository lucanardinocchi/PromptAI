import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"
import { FileText, Download } from "lucide-react"

export default async function ReportsPage() {
  const { profile } = await getUserProfile()
  const supabase = await createClient()

  // List report files from Supabase Storage
  const { data: files } = await supabase.storage
    .from("reports")
    .list(profile.company_id, {
      sortBy: { column: "name", order: "desc" },
    })

  const reportFiles = (files ?? []).filter((f) => f.name.endsWith(".pdf"))

  // Generate signed download URLs
  const reportsWithUrls = await Promise.all(
    reportFiles.map(async (file) => {
      const { data } = await supabase.storage
        .from("reports")
        .createSignedUrl(`${profile.company_id}/${file.name}`, 3600)
      return {
        name: file.name,
        createdAt: file.created_at,
        url: data?.signedUrl ?? "#",
      }
    })
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Monthly Reports
      </h1>

      <div className="rounded-xl border border-border bg-background">
        {reportsWithUrls.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No reports available yet
          </p>
        ) : (
          <div className="divide-y divide-border">
            {reportsWithUrls.map((report) => (
              <div
                key={report.name}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-primary transition hover:bg-primary/5"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
