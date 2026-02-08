"use client"

import { useState } from "react"
import type { SurveyData, TaskEntry } from "../survey-shell"
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react"

interface Props {
  data: SurveyData
  onChange: (partial: Partial<SurveyData>) => void
  onNext: () => void
  onBack: () => void
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "per_project", label: "Per project" },
  { value: "ad_hoc", label: "Ad hoc" },
]

export function StepTasks({ data, onChange, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateTask(index: number, partial: Partial<TaskEntry>) {
    const updated = data.tasks.map((t, i) =>
      i === index ? { ...t, ...partial } : t
    )
    onChange({ tasks: updated })
  }

  function addTask() {
    onChange({
      tasks: [...data.tasks, { name: "", software: "", frequency: "daily" }],
    })
  }

  function removeTask(index: number) {
    if (data.tasks.length <= 1) return
    onChange({ tasks: data.tasks.filter((_, i) => i !== index) })
  }

  function validate() {
    const e: Record<string, string> = {}
    data.tasks.forEach((t, i) => {
      if (!t.name.trim()) e[`task_${i}_name`] = "Required"
      if (!t.software.trim()) e[`task_${i}_software`] = "Required"
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Your tasks</h2>
        <p className="text-sm text-muted-foreground">
          What do you spend your time on? Add each task you regularly do.
        </p>
      </div>

      <div className="space-y-5">
        {data.tasks.map((task, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-border bg-muted/50 p-4 space-y-3"
          >
            {data.tasks.length > 1 && (
              <button
                onClick={() => removeTask(i)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition hover:bg-border hover:text-destructive"
                title="Remove task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Task name
              </label>
              <input
                value={task.name}
                onChange={(e) => updateTask(i, { name: e.target.value })}
                placeholder="e.g. Write project estimates"
                className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  errors[`task_${i}_name`] ? "border-destructive" : "border-border"
                }`}
              />
              {errors[`task_${i}_name`] && (
                <p className="mt-1 text-xs text-destructive">
                  {errors[`task_${i}_name`]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Software used
              </label>
              <input
                value={task.software}
                onChange={(e) => updateTask(i, { software: e.target.value })}
                placeholder="e.g. Excel, MYOB, email"
                className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  errors[`task_${i}_software`]
                    ? "border-destructive"
                    : "border-border"
                }`}
              />
              {errors[`task_${i}_software`] && (
                <p className="mt-1 text-xs text-destructive">
                  {errors[`task_${i}_software`]}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                How often?
              </label>
              <select
                value={task.frequency}
                onChange={(e) => updateTask(i, { frequency: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addTask}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:opacity-80"
      >
        <Plus className="h-4 w-4" />
        Add another task
      </button>

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
