export interface ClientUser {
  id: string
  auth_user_id: string
  company_id: string
  contact_id: string | null
  role: "exec" | "ic"
  created_at: string
}

export interface Company {
  id: string
  name: string
  status: string
  industry: string | null
  size: string | null
  location: string | null
  stripe_customer_id: string | null
}

export interface Contact {
  id: string
  company_id: string
  name: string
  role_title: string | null
  role_description: string | null
  email: string | null
}

export interface ContactTask {
  id: string
  contact_id: string
  engagement_id: string | null
  task_name: string
  task_description: string | null
  software_used: string | null
  frequency: string | null
  time_before_ai: number | null
  time_after_ai: number | null
  time_saved_minutes: number | null
  issues_before_ai: string | null
  issues_after_ai: string | null
  linked_skills: string[] | null
  linked_mcp_connections: string[] | null
  notes: string | null
}

export interface Engagement {
  id: string
  company_id: string
  status: string
  package: string | null
  value: number | null
  staff_count: number | null
  start_date: string | null
  end_date: string | null
}

export interface AIUsage {
  id: string
  engagement_id: string
  company_id: string
  contact_id: string
  usage_date: string
  tokens_used: number
}

export interface TrainingLog {
  id: string
  engagement_id: string
  contact_id: string
  session_number: number
  title: string | null
  scheduled_date: string | null
  completed_date: string | null
  status: string
  delivered_by: string | null
  location: string | null
  attended: boolean | null
  session_notes: string | null
}

export interface SupportTicket {
  id: string
  engagement_id: string
  contact_id: string | null
  request_date: string
  category: string | null
  description: string | null
  resolution: string | null
  status: string
  hours_spent: number | null
  handled_by: string | null
  resolved_date: string | null
  notes: string | null
}
