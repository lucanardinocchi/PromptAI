"use client"

import { useState } from "react"
import type { SurveyData } from "../survey-shell"
import { ArrowLeft, Loader2, Send } from "lucide-react"

interface Props {
  data: SurveyData
  onChange: (partial: Partial<SurveyData>) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

export function StepAI({ data, onChange, onSubmit, onBack, submitting }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (data.usedAI === null) e.usedAI = "Please select one"
    if (!data.interestedInAI) e.interestedInAI = "Please select one"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onSubmit()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">AI experience</h2>
        <p className="text-sm text-muted-foreground">
          Last step — tell us about your experience with AI tools.
        </p>
      </div>

      <div className="space-y-5">
        {/* Used AI? */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Have you used AI for any of your work tasks?
          </label>
          <div className="flex gap-3">
            <RadioButton
              selected={data.usedAI === true}
              onClick={() => onChange({ usedAI: true })}
              label="Yes"
            />
            <RadioButton
              selected={data.usedAI === false}
              onClick={() => onChange({ usedAI: false, aiToolsUsed: "" })}
              label="No"
            />
          </div>
          {errors.usedAI && (
            <p className="mt-1 text-xs text-destructive">{errors.usedAI}</p>
          )}
        </div>

        {/* Which AI tools */}
        {data.usedAI === true && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Which AI tools have you used?
            </label>
            <input
              value={data.aiToolsUsed}
              onChange={(e) => onChange({ aiToolsUsed: e.target.value })}
              placeholder="e.g. ChatGPT, Claude, Copilot, Gemini"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Interested in AI */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Are you interested in learning how AI could help with your work?
          </label>
          <div className="flex gap-3">
            <RadioButton
              selected={data.interestedInAI === "yes"}
              onClick={() => onChange({ interestedInAI: "yes" })}
              label="Yes"
            />
            <RadioButton
              selected={data.interestedInAI === "maybe"}
              onClick={() => onChange({ interestedInAI: "maybe" })}
              label="Maybe"
            />
            <RadioButton
              selected={data.interestedInAI === "no"}
              onClick={() => onChange({ interestedInAI: "no" })}
              label="Not really"
            />
          </div>
          {errors.interestedInAI && (
            <p className="mt-1 text-xs text-destructive">
              {errors.interestedInAI}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit
              <Send className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function RadioButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
        selected
          ? "border-primary bg-primary/5 text-primary"
          : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
