"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface TicketFormProps {
  engagementId: string
  contactId: string
}

const categories = [
  { value: "mcp_issue", label: "MCP Issue" },
  { value: "skill_issue", label: "Skill Issue" },
  { value: "claude_config", label: "Claude Configuration" },
  { value: "troubleshooting", label: "Troubleshooting" },
  { value: "training_request", label: "Training Request" },
  { value: "ad_hoc_support", label: "Ad-hoc Support" },
  { value: "other", label: "Other" },
]

export function TicketForm({ engagementId, contactId }: TicketFormProps) {
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !description.trim()) return

    setSubmitting(true)
    setSuccess(false)
    setError("")

    const { error: insertError } = await supabase
      .from("support_tickets")
      .insert({
        engagement_id: engagementId,
        contact_id: contactId,
        category,
        description: description.trim(),
      })

    setSubmitting(false)

    if (insertError) {
      setError("Failed to submit ticket. Please try again.")
      return
    }

    setSuccess(true)
    setCategory("")
    setDescription("")
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-background p-5"
    >
      <h3 className="font-medium">New Support Ticket</h3>

      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Describe what you need help with..."
        />
      </div>

      {success && (
        <p className="text-sm text-success">Ticket submitted successfully.</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Ticket"}
      </button>
    </form>
  )
}
