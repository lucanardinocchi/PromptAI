-- PromptAI IMS — Database Tables
-- Organised into: Sales, Assessment, Delivery, Measurement

-- ============================================================
-- SALES
-- ============================================================

-- companies: top-level record for every business in the pipeline
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'lead'
    check (status in ('lead', 'contacted', 'meeting_scheduled', 'meeting_complete', 'auditing', 'go', 'no_go', 'proposal_sent', 'training', 'supporting', 'paused', 'churned')),
  industry text default 'construction',
  size text,
  location text,
  website text,
  source text
    check (source in ('referral', 'cold_walk_in', 'cold_call', 'cold_email', 'linkedin', 'inbound', 'networking_event')),
  lost_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- contacts: people at prospect and client companies
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  role_title text,
  role_description text,
  email text,
  has_email boolean default true,
  phone text,
  is_decision_maker boolean default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- interactions: every touchpoint with a prospect or client
create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  interaction_date timestamptz not null default now(),
  type text not null
    check (type in ('cold_walk_in', 'cold_call', 'cold_email', 'linkedin_message', 'warm_intro', 'meeting', 'follow_up_call', 'follow_up_email', 'site_visit', 'other')),
  summary text,
  outcome text
    check (outcome in ('no_response', 'interested', 'meeting_booked', 'objection_raised', 'declined', 'next_step_agreed', 'proposal_requested')),
  next_step text,
  follow_up_date date,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ASSESSMENT
-- ============================================================

-- audits: company-level assessment derived from audit survey
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  audit_date date not null default current_date,
  org_chart_received boolean default false,
  team_size integer,
  surveys_sent integer default 0,
  surveys_completed integer default 0,
  digital_maturity text
    check (digital_maturity in ('low', 'medium', 'high')),
  current_tools_summary text,
  notes text,
  created_at timestamptz not null default now()
);

-- go_no_go_decisions: structured decision framework after audit
create table public.go_no_go_decisions (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  decision text not null
    check (decision in ('go', 'no_go', 'conditional')),
  decision_date date not null default current_date,
  decision_maker_engagement text
    check (decision_maker_engagement in ('high', 'medium', 'low')),
  budget_confirmed boolean,
  team_readiness text
    check (team_readiness in ('high', 'medium', 'low')),
  champion_strength text
    check (champion_strength in ('strong', 'moderate', 'weak', 'none')),
  technical_feasibility text
    check (technical_feasibility in ('high', 'medium', 'low')),
  timeline_alignment text
    check (timeline_alignment in ('aligned', 'tight', 'unrealistic')),
  estimated_roi text,
  risk_factors text,
  decision_rationale text,
  recommended_package text,
  estimated_hours_per_week numeric,
  estimated_value numeric,
  created_at timestamptz not null default now()
);

-- capacity: internal team bandwidth tracking
create table public.capacity (
  id uuid primary key default gen_random_uuid(),
  team_member text not null,
  role text,
  total_hours_per_week numeric not null,
  allocated_hours_per_week numeric not null default 0,
  available_hours_per_week numeric generated always as (total_hours_per_week - allocated_hours_per_week) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- proposals: formal proposals sent after a Go decision
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  go_no_go_id uuid not null references public.go_no_go_decisions(id) on delete cascade,
  package text,
  value numeric,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'under_review', 'accepted', 'rejected', 'expired')),
  sent_date date,
  modifications_requested text,
  accepted_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- DELIVERY
-- ============================================================

-- engagements: active client contracts, created when a proposal is accepted
create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  status text not null default 'training'
    check (status in ('training', 'supporting', 'paused', 'completed', 'cancelled')),
  package text,
  value numeric,
  staff_count integer,
  training_hours_per_staff numeric,
  mcps_to_build integer,
  skills_to_build integer,
  reporting_terms text,
  support_terms text,
  start_date date,
  end_date date,
  milestone_dates jsonb,
  milestone_kpis jsonb,
  claude_workspace_id text,
  claude_plan_type text,
  claude_plan_setup boolean default false,
  num_licenses integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- claude_licenses: individual Claude licenses assigned to client staff
create table public.claude_licenses (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  email text not null,
  license_status text not null default 'active'
    check (license_status in ('active', 'suspended', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- mcps: registry of all MCP servers built and their deployments
create table public.mcps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  built_date date,
  deployed boolean default false,
  deployed_to_accounts jsonb,
  status text not null default 'in_development'
    check (status in ('in_development', 'deployed', 'deprecated')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- skills_files: registry of all Skills files built and their deployments
create table public.skills_files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  built_date date,
  deployed boolean default false,
  deployed_to_accounts jsonb,
  status text not null default 'in_development'
    check (status in ('in_development', 'deployed', 'deprecated')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- contact_tasks: what each person does day to day, baseline for training and ROI
create table public.contact_tasks (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  engagement_id uuid references public.engagements(id) on delete set null,
  task_name text not null,
  task_description text,
  software_used text,
  frequency text
    check (frequency in ('daily', 'weekly', 'monthly', 'per_project', 'ad_hoc')),
  time_before_ai integer,
  time_after_ai integer,
  time_saved_minutes integer generated always as (time_before_ai - time_after_ai) stored,
  issues_before_ai text,
  issues_after_ai text,
  linked_skills text[],
  linked_mcp_connections text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- survey_responses: audit and pre-training survey answers
create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  survey_type text not null
    check (survey_type in ('audit', 'pre_training')),
  survey_sent boolean default false,
  survey_sent_date date,
  survey_completed boolean default false,
  survey_completed_date date,
  question text not null,
  answer text,
  created_at timestamptz not null default now()
);

-- training_log: per-person, per-session scheduling and delivery notes
create table public.training_log (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  session_number integer not null,
  title text,
  scheduled_date date,
  completed_date date,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  delivered_by text,
  location text,
  attended boolean,
  session_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- support_tickets: support requests from clients
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  request_date timestamptz not null default now(),
  category text
    check (category in ('mcp_issue', 'skill_issue', 'claude_config', 'troubleshooting', 'training_request', 'ad_hoc_support', 'other')),
  description text,
  resolution text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  hours_spent numeric,
  handled_by text,
  resolved_date timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- MEASUREMENT
-- ============================================================

-- ai_usage: token usage per person per company, timestamped
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  usage_date date not null,
  tokens_used bigint not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Companies
create index idx_companies_status on public.companies(status);

-- Contacts
create index idx_contacts_company on public.contacts(company_id);

-- Interactions
create index idx_interactions_company on public.interactions(company_id);
create index idx_interactions_contact on public.interactions(contact_id);
create index idx_interactions_follow_up on public.interactions(follow_up_date) where follow_up_date is not null;

-- Audits
create index idx_audits_company on public.audits(company_id);

-- Go/No-Go
create index idx_go_no_go_company on public.go_no_go_decisions(company_id);
create index idx_go_no_go_audit on public.go_no_go_decisions(audit_id);

-- Proposals
create index idx_proposals_company on public.proposals(company_id);
create index idx_proposals_status on public.proposals(status);

-- Engagements
create index idx_engagements_company on public.engagements(company_id);
create index idx_engagements_status on public.engagements(status);

-- Claude Licenses
create index idx_claude_licenses_engagement on public.claude_licenses(engagement_id);

-- MCPs
create index idx_mcps_engagement on public.mcps(engagement_id);

-- Skills Files
create index idx_skills_files_engagement on public.skills_files(engagement_id);

-- Contact Tasks
create index idx_contact_tasks_contact on public.contact_tasks(contact_id);
create index idx_contact_tasks_engagement on public.contact_tasks(engagement_id);

-- Survey Responses
create index idx_survey_responses_contact on public.survey_responses(contact_id);
create index idx_survey_responses_company on public.survey_responses(company_id);
create index idx_survey_responses_type on public.survey_responses(survey_type);

-- Training Log
create index idx_training_log_engagement on public.training_log(engagement_id);
create index idx_training_log_contact on public.training_log(contact_id);

-- Support Tickets
create index idx_support_tickets_engagement on public.support_tickets(engagement_id);
create index idx_support_tickets_status on public.support_tickets(status);

-- AI Usage
create index idx_ai_usage_engagement on public.ai_usage(engagement_id);
create index idx_ai_usage_contact on public.ai_usage(contact_id);
create index idx_ai_usage_date on public.ai_usage(usage_date);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger set_updated_at before update on public.companies
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.contacts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.capacity
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.proposals
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.engagements
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.claude_licenses
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.mcps
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.skills_files
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.contact_tasks
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.training_log
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.support_tickets
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (enabled, no policies yet — add when auth is set up)
-- ============================================================

alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.interactions enable row level security;
alter table public.audits enable row level security;
alter table public.go_no_go_decisions enable row level security;
alter table public.capacity enable row level security;
alter table public.proposals enable row level security;
alter table public.engagements enable row level security;
alter table public.claude_licenses enable row level security;
alter table public.mcps enable row level security;
alter table public.skills_files enable row level security;
alter table public.contact_tasks enable row level security;
alter table public.survey_responses enable row level security;
alter table public.training_log enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ai_usage enable row level security;
