// ============================================================
// Table schema definitions for all 17 IMS tables.
// Used to generate MCP tool definitions and validate inputs.
// ============================================================

export type FieldType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "uuid"
  | "date"
  | "timestamp"
  | "string_array"
  | "json";

export interface Field {
  name: string;
  type: FieldType;
  required?: boolean; // required for create operations
  description: string;
  enum?: string[];
}

export interface TableSchema {
  tableName: string;
  singular: string;
  plural: string;
  description: string;
  fields: Field[];
}

// ============================================================
// SALES
// ============================================================

const companies: TableSchema = {
  tableName: "companies",
  singular: "company",
  plural: "companies",
  description: "Top-level record for every business in the pipeline",
  fields: [
    { name: "name", type: "string", required: true, description: "Company name" },
    {
      name: "status",
      type: "string",
      description: "Pipeline status",
      enum: [
        "lead", "contacted", "meeting_scheduled", "meeting_complete",
        "auditing", "go", "no_go", "proposal_sent",
        "training", "supporting", "paused", "churned",
      ],
    },
    { name: "industry", type: "string", description: "Industry (defaults to construction)" },
    { name: "size", type: "string", description: "Description of staff count, e.g. '12 office staff'" },
    { name: "location", type: "string", description: "Suburb or city" },
    { name: "website", type: "string", description: "Company website" },
    {
      name: "source",
      type: "string",
      description: "How you found them",
      enum: ["referral", "cold_walk_in", "cold_call", "cold_email", "linkedin", "inbound", "networking_event"],
    },
    { name: "lost_reason", type: "string", description: "Why they dropped out of the pipeline" },
    { name: "notes", type: "string", description: "General notes" },
  ],
};

const contacts: TableSchema = {
  tableName: "contacts",
  singular: "contact",
  plural: "contacts",
  description: "People at prospect and client companies",
  fields: [
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    { name: "name", type: "string", required: true, description: "Full name" },
    { name: "role_title", type: "string", description: "Job title, e.g. 'Senior Estimator'" },
    { name: "role_description", type: "string", description: "What they actually do day to day" },
    { name: "email", type: "string", description: "Email address" },
    { name: "has_email", type: "boolean", description: "Whether they have an email at all" },
    { name: "phone", type: "string", description: "Phone number" },
    { name: "is_decision_maker", type: "boolean", description: "Whether this person signs off on purchases" },
    { name: "notes", type: "string", description: "Individual notes" },
  ],
};

const interactions: TableSchema = {
  tableName: "interactions",
  singular: "interaction",
  plural: "interactions",
  description: "Every touchpoint with a prospect or client — the CRM activity log",
  fields: [
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    { name: "contact_id", type: "uuid", description: "Links to contacts (optional)" },
    { name: "interaction_date", type: "timestamp", description: "When it happened (defaults to now)" },
    {
      name: "type",
      type: "string",
      required: true,
      description: "What kind of interaction",
      enum: [
        "cold_walk_in", "cold_call", "cold_email", "linkedin_message",
        "warm_intro", "meeting", "follow_up_call", "follow_up_email",
        "site_visit", "other",
      ],
    },
    { name: "summary", type: "string", description: "What happened in plain language" },
    {
      name: "outcome",
      type: "string",
      description: "Result of the interaction",
      enum: [
        "no_response", "interested", "meeting_booked", "objection_raised",
        "declined", "next_step_agreed", "proposal_requested",
      ],
    },
    { name: "next_step", type: "string", description: "What was agreed as the next action" },
    { name: "follow_up_date", type: "date", description: "When to follow up" },
    { name: "notes", type: "string", description: "Additional context" },
  ],
};

// ============================================================
// ASSESSMENT
// ============================================================

const audits: TableSchema = {
  tableName: "audits",
  singular: "audit",
  plural: "audits",
  description: "Company-level assessment derived from the audit survey",
  fields: [
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    { name: "audit_date", type: "date", description: "When the audit was initiated" },
    { name: "org_chart_received", type: "boolean", description: "Whether the owner has provided the org chart" },
    { name: "team_size", type: "integer", description: "Number of staff, derived from org chart" },
    { name: "surveys_sent", type: "integer", description: "Number of survey links sent" },
    { name: "surveys_completed", type: "integer", description: "Number of surveys completed" },
    {
      name: "digital_maturity",
      type: "string",
      description: "Overall assessment derived from survey data",
      enum: ["low", "medium", "high"],
    },
    { name: "current_tools_summary", type: "string", description: "Overview of software in use" },
    { name: "notes", type: "string", description: "General audit observations" },
  ],
};

const goNoGoDecisions: TableSchema = {
  tableName: "go_no_go_decisions",
  singular: "go_no_go_decision",
  plural: "go_no_go_decisions",
  description: "Structured decision framework applied after the audit",
  fields: [
    { name: "audit_id", type: "uuid", required: true, description: "Links to audits" },
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    {
      name: "decision",
      type: "string",
      required: true,
      description: "The call",
      enum: ["go", "no_go", "conditional"],
    },
    { name: "decision_date", type: "date", description: "When the decision was made" },
    {
      name: "decision_maker_engagement",
      type: "string",
      description: "How engaged is the person who signs cheques",
      enum: ["high", "medium", "low"],
    },
    { name: "budget_confirmed", type: "boolean", description: "Whether they can afford the engagement" },
    {
      name: "team_readiness",
      type: "string",
      description: "Based on audit and survey data",
      enum: ["high", "medium", "low"],
    },
    {
      name: "champion_strength",
      type: "string",
      description: "How strong the internal champion is",
      enum: ["strong", "moderate", "weak", "none"],
    },
    {
      name: "technical_feasibility",
      type: "string",
      description: "Can their workflows be AI-integrated",
      enum: ["high", "medium", "low"],
    },
    {
      name: "timeline_alignment",
      type: "string",
      description: "Are their expectations realistic",
      enum: ["aligned", "tight", "unrealistic"],
    },
    { name: "estimated_roi", type: "string", description: "Rough estimate of time savings" },
    { name: "risk_factors", type: "string", description: "Anything that could derail the engagement" },
    { name: "decision_rationale", type: "string", description: "Written explanation of why go or no-go" },
    { name: "recommended_package", type: "string", description: "Which pricing tier fits" },
    { name: "estimated_hours_per_week", type: "number", description: "Calculated from novel MCPs, Skills, and employees" },
    { name: "estimated_value", type: "number", description: "Estimated engagement value in AUD" },
  ],
};

const capacity: TableSchema = {
  tableName: "capacity",
  singular: "capacity_record",
  plural: "capacity_records",
  description: "Internal team bandwidth tracking for Go/No-Go decisions",
  fields: [
    { name: "team_member", type: "string", required: true, description: "Name of internal team member" },
    { name: "role", type: "string", description: "Their role at PromptAI" },
    { name: "total_hours_per_week", type: "number", required: true, description: "Total available hours per week" },
    { name: "allocated_hours_per_week", type: "number", description: "Hours already committed to active engagements" },
    { name: "notes", type: "string", description: "Context or constraints" },
  ],
};

const proposals: TableSchema = {
  tableName: "proposals",
  singular: "proposal",
  plural: "proposals",
  description: "Formal proposals sent after a Go decision",
  fields: [
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    { name: "go_no_go_id", type: "uuid", required: true, description: "Links to go_no_go_decisions" },
    { name: "package", type: "string", description: "Which package or tier" },
    { name: "value", type: "number", description: "Proposed dollar amount in AUD" },
    {
      name: "status",
      type: "string",
      description: "Where the proposal stands",
      enum: ["draft", "sent", "under_review", "accepted", "rejected", "expired"],
    },
    { name: "sent_date", type: "date", description: "When it was sent" },
    { name: "modifications_requested", type: "string", description: "Any changes the prospect asked for" },
    { name: "accepted_date", type: "date", description: "When they said yes" },
    { name: "notes", type: "string", description: "Additional context" },
  ],
};

// ============================================================
// DELIVERY
// ============================================================

const engagements: TableSchema = {
  tableName: "engagements",
  singular: "engagement",
  plural: "engagements",
  description: "Active client contracts, created when a proposal is accepted",
  fields: [
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    { name: "proposal_id", type: "uuid", required: true, description: "Links to proposals" },
    {
      name: "status",
      type: "string",
      description: "Delivery stage",
      enum: ["training", "supporting", "paused", "completed", "cancelled"],
    },
    { name: "package", type: "string", description: "Package name" },
    { name: "value", type: "number", description: "Contract value in AUD" },
    { name: "staff_count", type: "integer", description: "Number of staff included" },
    { name: "training_hours_per_staff", type: "number", description: "Training hours per staff member" },
    { name: "mcps_to_build", type: "integer", description: "Number of MCPs to be built" },
    { name: "skills_to_build", type: "integer", description: "Number of Skills to be built" },
    { name: "reporting_terms", type: "string", description: "Terms of monthly reporting" },
    { name: "support_terms", type: "string", description: "Terms of support services" },
    { name: "start_date", type: "date", description: "When work begins" },
    { name: "end_date", type: "date", description: "When the contract ends" },
    { name: "milestone_dates", type: "json", description: "Key milestone dates (JSON)" },
    { name: "milestone_kpis", type: "json", description: "KPIs tied to each milestone (JSON)" },
    { name: "claude_workspace_id", type: "string", description: "Their Claude workspace reference" },
    { name: "claude_plan_type", type: "string", description: "Type of Claude plan (e.g. Team, Enterprise)" },
    { name: "claude_plan_setup", type: "boolean", description: "Whether Claude is configured" },
    { name: "num_licenses", type: "integer", description: "Number of Claude licenses" },
    { name: "notes", type: "string", description: "General engagement notes" },
  ],
};

const claudeLicenses: TableSchema = {
  tableName: "claude_licenses",
  singular: "claude_license",
  plural: "claude_licenses",
  description: "Individual Claude licenses assigned to client staff",
  fields: [
    { name: "engagement_id", type: "uuid", required: true, description: "Links to engagements" },
    { name: "contact_id", type: "uuid", description: "Links to contacts" },
    { name: "email", type: "string", required: true, description: "Email address the license is assigned to" },
    {
      name: "license_status",
      type: "string",
      description: "Whether the license is active",
      enum: ["active", "suspended", "revoked"],
    },
  ],
};

const mcps: TableSchema = {
  tableName: "mcps",
  singular: "mcp",
  plural: "mcps",
  description: "Registry of all MCP servers built and their deployments",
  fields: [
    { name: "name", type: "string", required: true, description: "MCP server name" },
    { name: "description", type: "string", description: "What this MCP connects to and does" },
    { name: "engagement_id", type: "uuid", required: true, description: "Links to engagements" },
    { name: "built_date", type: "date", description: "When it was built" },
    { name: "deployed", type: "boolean", description: "Whether it is currently deployed" },
    { name: "deployed_to_accounts", type: "json", description: "Which accounts/workspaces it is deployed to (JSON array)" },
    {
      name: "status",
      type: "string",
      description: "Current state",
      enum: ["in_development", "deployed", "deprecated"],
    },
    { name: "notes", type: "string", description: "Additional context" },
  ],
};

const skillsFiles: TableSchema = {
  tableName: "skills_files",
  singular: "skills_file",
  plural: "skills_files",
  description: "Registry of all Skills files built and their deployments",
  fields: [
    { name: "name", type: "string", required: true, description: "Skills file name" },
    { name: "description", type: "string", description: "What this Skills file does" },
    { name: "engagement_id", type: "uuid", required: true, description: "Links to engagements" },
    { name: "built_date", type: "date", description: "When it was built" },
    { name: "deployed", type: "boolean", description: "Whether it is currently deployed" },
    { name: "deployed_to_accounts", type: "json", description: "Which accounts/workspaces it is deployed to (JSON array)" },
    {
      name: "status",
      type: "string",
      description: "Current state",
      enum: ["in_development", "deployed", "deprecated"],
    },
    { name: "notes", type: "string", description: "Additional context" },
  ],
};

const contactTasks: TableSchema = {
  tableName: "contact_tasks",
  singular: "contact_task",
  plural: "contact_tasks",
  description: "What each person does day to day — baseline for training and ROI measurement",
  fields: [
    { name: "contact_id", type: "uuid", required: true, description: "Links to contacts — who does this task" },
    { name: "engagement_id", type: "uuid", description: "Links to engagements" },
    { name: "task_name", type: "string", required: true, description: "Short name, e.g. 'Prepare cost estimates'" },
    { name: "task_description", type: "string", description: "Detailed description of what the task involves" },
    { name: "software_used", type: "string", description: "Tools currently used, e.g. 'Excel, Buildsoft, email'" },
    {
      name: "frequency",
      type: "string",
      description: "How often they do it",
      enum: ["daily", "weekly", "monthly", "per_project", "ad_hoc"],
    },
    { name: "time_before_ai", type: "integer", description: "How long this task currently takes (minutes)" },
    { name: "time_after_ai", type: "integer", description: "How long this task takes after AI (minutes)" },
    { name: "issues_before_ai", type: "string", description: "Key issues with the non-AI workflow" },
    { name: "issues_after_ai", type: "string", description: "Key issues with the AI-assisted workflow" },
    { name: "linked_skills", type: "string_array", description: "Skills file names relevant to this task" },
    { name: "linked_mcp_connections", type: "string_array", description: "MCP connections relevant to this task" },
    { name: "notes", type: "string", description: "Observations and context" },
  ],
};

const surveyResponses: TableSchema = {
  tableName: "survey_responses",
  singular: "survey_response",
  plural: "survey_responses",
  description: "Audit and pre-training survey answers",
  fields: [
    { name: "contact_id", type: "uuid", description: "Links to contacts" },
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    {
      name: "survey_type",
      type: "string",
      required: true,
      description: "Which survey",
      enum: ["audit", "pre_training"],
    },
    { name: "survey_sent", type: "boolean", description: "Whether the survey link has been sent" },
    { name: "survey_sent_date", type: "date", description: "When it was sent" },
    { name: "survey_completed", type: "boolean", description: "Whether they have finished it" },
    { name: "survey_completed_date", type: "date", description: "When they completed it" },
    { name: "question", type: "string", required: true, description: "The survey question text" },
    { name: "answer", type: "string", description: "Their response" },
  ],
};

const trainingLog: TableSchema = {
  tableName: "training_log",
  singular: "training_log_entry",
  plural: "training_log_entries",
  description: "Per-person, per-session scheduling and delivery notes",
  fields: [
    { name: "engagement_id", type: "uuid", required: true, description: "Links to engagements" },
    { name: "contact_id", type: "uuid", required: true, description: "Links to contacts" },
    { name: "session_number", type: "integer", required: true, description: "Which session in the programme" },
    { name: "title", type: "string", description: "Session name, e.g. 'Claude Fundamentals'" },
    { name: "scheduled_date", type: "date", description: "When it is planned" },
    { name: "completed_date", type: "date", description: "When it actually happened" },
    {
      name: "status",
      type: "string",
      description: "Where the session stands",
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
    },
    { name: "delivered_by", type: "string", description: "Who ran the session" },
    { name: "location", type: "string", description: "On-site, virtual, specific address" },
    { name: "attended", type: "boolean", description: "Whether this person attended" },
    { name: "session_notes", type: "string", description: "How the session went — progress, struggles, follow-ups" },
  ],
};

const supportTickets: TableSchema = {
  tableName: "support_tickets",
  singular: "support_ticket",
  plural: "support_tickets",
  description: "Support requests from clients — requests, resolution, and hours",
  fields: [
    { name: "engagement_id", type: "uuid", required: true, description: "Links to engagements" },
    { name: "contact_id", type: "uuid", description: "Links to contacts (who raised the request)" },
    { name: "request_date", type: "timestamp", description: "When the request came in (defaults to now)" },
    {
      name: "category",
      type: "string",
      description: "Type of support",
      enum: ["mcp_issue", "skill_issue", "claude_config", "troubleshooting", "training_request", "ad_hoc_support", "other"],
    },
    { name: "description", type: "string", description: "What was requested" },
    { name: "resolution", type: "string", description: "What was done to resolve it" },
    {
      name: "status",
      type: "string",
      description: "Where the ticket stands",
      enum: ["open", "in_progress", "resolved", "closed"],
    },
    { name: "hours_spent", type: "number", description: "Time spent on this ticket" },
    { name: "handled_by", type: "string", description: "Who handled it" },
    { name: "resolved_date", type: "timestamp", description: "When it was resolved" },
    { name: "notes", type: "string", description: "Additional context" },
  ],
};

// ============================================================
// MEASUREMENT
// ============================================================

const aiUsage: TableSchema = {
  tableName: "ai_usage",
  singular: "ai_usage_record",
  plural: "ai_usage_records",
  description: "Token usage per person per company — powers monthly reports and trend analysis",
  fields: [
    { name: "engagement_id", type: "uuid", required: true, description: "Links to engagements" },
    { name: "company_id", type: "uuid", required: true, description: "Links to companies" },
    { name: "contact_id", type: "uuid", required: true, description: "Links to contacts — which individual" },
    { name: "usage_date", type: "date", required: true, description: "Date of usage record" },
    { name: "tokens_used", type: "integer", required: true, description: "Number of tokens consumed" },
    { name: "notes", type: "string", description: "Context or observations" },
  ],
};

// ============================================================
// Export all table schemas
// ============================================================

export const tables: TableSchema[] = [
  // Sales
  companies,
  contacts,
  interactions,
  // Assessment
  audits,
  goNoGoDecisions,
  capacity,
  proposals,
  // Delivery
  engagements,
  claudeLicenses,
  mcps,
  skillsFiles,
  contactTasks,
  surveyResponses,
  trainingLog,
  supportTickets,
  // Measurement
  aiUsage,
];
