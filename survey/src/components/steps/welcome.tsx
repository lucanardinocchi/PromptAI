"use client"

import { ArrowRight } from "lucide-react"

interface Props {
  companyName: string
  onNext: () => void
}

export function StepWelcome({ companyName, onNext }: Props) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi, {companyName} team
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          We'd like to learn a bit about how you work so we can build an AI
          strategy tailored to your team. This takes about 3 minutes.
        </p>
      </div>
      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Get started
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
