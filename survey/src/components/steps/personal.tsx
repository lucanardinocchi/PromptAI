"use client"

import { useState } from "react"
import type { SurveyData } from "../survey-shell"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Props {
  data: SurveyData
  onChange: (partial: Partial<SurveyData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepPersonal({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!data.fullName.trim()) e.fullName = "Required"
    if (!data.email.trim()) e.email = "Required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = "Enter a valid email"
    if (!data.roleTitle.trim()) e.roleTitle = "Required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">About you</h2>
        <p className="text-sm text-muted-foreground">
          Let us know who you are and what you do.
        </p>
      </div>

      <div className="space-y-4">
        <Field
          label="Full name"
          value={data.fullName}
          error={errors.fullName}
          onChange={(v) => onChange({ fullName: v })}
          placeholder="Jane Smith"
        />
        <Field
          label="Email"
          type="email"
          value={data.email}
          error={errors.email}
          onChange={(v) => onChange({ email: v })}
          placeholder="jane@company.com"
        />
        <Field
          label="Job role / title"
          value={data.roleTitle}
          error={errors.roleTitle}
          onChange={(v) => onChange({ roleTitle: v })}
          placeholder="e.g. Project Manager, Estimator, Office Admin"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  error,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  error?: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}
