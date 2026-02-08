import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

interface TaskEntry {
  name: string
  software: string
  frequency: string
}

interface SubmitBody {
  companyId: string
  fullName: string
  email: string
  roleTitle: string
  tasks: TaskEntry[]
  usedAI: boolean | null
  aiToolsUsed: string
  interestedInAI: string
}

export async function POST(request: Request) {
  try {
    const body: SubmitBody = await request.json()

    // Basic validation
    if (!body.companyId || !body.fullName?.trim() || !body.email?.trim() || !body.roleTitle?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!body.tasks || body.tasks.length === 0) {
      return NextResponse.json({ error: "At least one task is required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Create the contact
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        company_id: body.companyId,
        name: body.fullName.trim(),
        email: body.email.trim(),
        role_title: body.roleTitle.trim(),
        has_email: true,
      })
      .select("id")
      .single()

    if (contactError) {
      console.error("Contact insert error:", contactError)
      return NextResponse.json({ error: "Failed to save contact" }, { status: 500 })
    }

    const contactId = contact.id

    // 2. Create contact_tasks for each task
    const taskRows = body.tasks
      .filter((t) => t.name.trim())
      .map((t) => ({
        contact_id: contactId,
        task_name: t.name.trim(),
        software_used: t.software.trim(),
        frequency: t.frequency || "daily",
      }))

    if (taskRows.length > 0) {
      const { error: tasksError } = await supabase
        .from("contact_tasks")
        .insert(taskRows)

      if (tasksError) {
        console.error("Tasks insert error:", tasksError)
        // Non-fatal — contact was already created
      }
    }

    // 3. Create survey_responses for each question/answer pair
    const surveyRows = [
      { question: "Full name", answer: body.fullName.trim() },
      { question: "Email", answer: body.email.trim() },
      { question: "Job role", answer: body.roleTitle.trim() },
      {
        question: "Tasks and software",
        answer: body.tasks
          .filter((t) => t.name.trim())
          .map((t) => `${t.name} (${t.software}, ${t.frequency})`)
          .join("; "),
      },
      {
        question: "Have you used AI for work tasks?",
        answer: body.usedAI === true ? "Yes" : body.usedAI === false ? "No" : "No response",
      },
      ...(body.usedAI && body.aiToolsUsed?.trim()
        ? [{ question: "Which AI tools have you used?", answer: body.aiToolsUsed.trim() }]
        : []),
      {
        question: "Interested in learning about AI?",
        answer: body.interestedInAI || "No response",
      },
    ].map((row) => ({
      contact_id: contactId,
      company_id: body.companyId,
      survey_type: "audit",
      survey_completed: true,
      survey_completed_date: new Date().toISOString().split("T")[0],
      question: row.question,
      answer: row.answer,
    }))

    const { error: surveyError } = await supabase
      .from("survey_responses")
      .insert(surveyRows)

    if (surveyError) {
      console.error("Survey responses insert error:", surveyError)
    }

    // 4. Increment surveys_completed on the audit record
    // Find the latest audit for this company
    const { data: audit } = await supabase
      .from("audits")
      .select("id, surveys_completed")
      .eq("company_id", body.companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (audit) {
      await supabase
        .from("audits")
        .update({ surveys_completed: (audit.surveys_completed || 0) + 1 })
        .eq("id", audit.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Submit error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
