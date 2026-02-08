"use client"

import { CheckCircle } from "lucide-react"

export function StepComplete() {
  return (
    <div className="space-y-4 text-center py-4">
      <CheckCircle className="mx-auto h-12 w-12 text-success" />
      <h2 className="text-xl font-semibold tracking-tight">Thank you!</h2>
      <p className="text-muted-foreground leading-relaxed">
        Your responses have been recorded. We'll use this to build a tailored
        AI strategy for your team. You can close this page now.
      </p>
    </div>
  )
}
