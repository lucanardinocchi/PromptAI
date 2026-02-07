import { getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Receipt, Download, ExternalLink } from "lucide-react"
import Stripe from "stripe"

export default async function InvoicesPage() {
  const { profile } = await getUserProfile()

  // Exec only — ICs don't see invoices
  if (profile.role !== "exec") {
    redirect("/me")
  }

  const supabase = await createClient()

  // Get stripe_customer_id from the company
  const { data: company } = await supabase
    .from("companies")
    .select("stripe_customer_id")
    .eq("id", profile.company_id)
    .single()

  const stripeCustomerId = company?.stripe_customer_id

  // If no Stripe customer linked or no secret key, show empty state
  if (!stripeCustomerId || !process.env.STRIPE_SECRET_KEY) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <div className="rounded-xl border border-border bg-background p-8 text-center">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No invoices available yet. Invoices will appear here once billing is
            set up.
          </p>
        </div>
      </div>
    )
  }

  // Fetch invoices from Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let invoices: Stripe.Invoice[] = []
  try {
    const response = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 100,
    })
    invoices = response.data
  } catch {
    // If Stripe call fails, show error state
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <div className="rounded-xl border border-border bg-background p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load invoices. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>

      <div className="rounded-xl border border-border bg-background">
        {invoices.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No invoices yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const date = inv.created
                    ? new Date(inv.created * 1000).toISOString()
                    : null
                  const description =
                    inv.description ||
                    inv.lines?.data?.[0]?.description ||
                    "—"
                  const amount =
                    inv.amount_due != null
                      ? `$${(inv.amount_due / 100).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`
                      : "—"

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-border/50"
                    >
                      <td className="whitespace-nowrap px-5 py-3">
                        {formatDate(date)}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {inv.number ?? inv.id.slice(0, 16)}
                      </td>
                      <td className="max-w-xs truncate px-5 py-3">
                        {description}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-medium">
                        {amount}
                      </td>
                      <td className="px-5 py-3">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.invoice_pdf && (
                            <a
                              href={inv.invoice_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-primary transition hover:bg-primary/5"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          {inv.hosted_invoice_url && (
                            <a
                              href={inv.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                              title="View online"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function InvoiceStatusBadge({
  status,
}: {
  status: string | null
}) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    open: "bg-yellow-50 text-yellow-700",
    paid: "bg-green-50 text-green-700",
    void: "bg-red-50 text-red-700",
    uncollectible: "bg-red-50 text-red-700",
  }

  const label = status ?? "unknown"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        colors[label] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  )
}
