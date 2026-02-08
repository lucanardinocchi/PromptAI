"use client"

import { useState } from "react"
import { StepWelcome } from "./steps/welcome"
import { StepPersonal } from "./steps/personal"
import { StepTasks } from "./steps/tasks"
import { StepAI } from "./steps/ai-experience"
import { StepComplete } from "./steps/complete"

export interface TaskEntry {
  name: string
  software: string
  frequency: string
}

export interface SurveyData {
  fullName: string
  email: string
  roleTitle: string
  tasks: TaskEntry[]
  usedAI: boolean | null
  aiToolsUsed: string
  interestedInAI: string
}

const INITIAL_DATA: SurveyData = {
  fullName: "",
  email: "",
  roleTitle: "",
  tasks: [{ name: "", software: "", frequency: "daily" }],
  usedAI: null,
  aiToolsUsed: "",
  interestedInAI: "",
}

interface Props {
  companyId: string
  companyName: string
}

export function SurveyShell({ companyId, companyName }: Props) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<SurveyData>(INITIAL_DATA)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 4 // welcome, personal, tasks, AI
  const progress = step === 0 ? 0 : Math.round((step / totalSteps) * 100)

  function next() {
    setStep((s) => s + 1)
  }

  function back() {
    setStep((s) => Math.max(0, s - 1))
  }

  function update(partial: Partial<SurveyData>) {
    setData((d) => ({ ...d, ...partial }))
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, ...data }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Something went wrong")
      }
      setStep(totalSteps + 1) // done
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        {step > 0 && step <= totalSteps && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border">
              <div
                className="h-1.5 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
          {step === 0 && (
            <StepWelcome companyName={companyName} onNext={next} />
          )}
          {step === 1 && (
            <StepPersonal data={data} onChange={update} onNext={next} onBack={back} />
          )}
          {step === 2 && (
            <StepTasks data={data} onChange={update} onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <StepAI data={data} onChange={update} onSubmit={submit} onBack={back} submitting={submitting} />
          )}
          {step > totalSteps && <StepComplete />}
          {error && (
            <p className="mt-4 text-center text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Branding */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by PromptAI
        </p>
      </div>
    </div>
  )
}
