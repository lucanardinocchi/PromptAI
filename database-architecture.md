# PromptAI IMS — Database Architecture

## Overview

The database is organised into four business functions: **Sales**, **Assessment**, **Delivery**, and **Measurement**. Each table serves a single clear purpose. Tasks live in Linear, invoices live in Stripe, documentation and Skills/MCP versioning live in GitHub. The database owns everything about client relationships, service delivery, and performance tracking.

---

## Tables

### Sales

**companies**
The top-level record for every business you interact with.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| name | Company name |
| status | Where they sit in the pipeline: `lead`, `contacted`, `meeting_scheduled`, `meeting_complete`, `auditing`, `go`, `no_go`, `proposal_sent`, `training`, `supporting`, `paused`, `churned` |
| industry | Defaults to "construction" |
| size | Description of staff count, e.g. "12 office staff" |
| location | Suburb or city |
| website | Company website |
| source | How you found them: `referral`, `cold_walk_in`, `cold_call`, `cold_email`, `linkedin`, `inbound`, `networking_event` |
| lost_reason | Why they dropped out of the pipeline, if applicable |
| notes | General notes |
| created_at | When the record was created |
| updated_at | Last modified |

**contacts**
People at prospect and client companies.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| company_id | Links to companies |
| name | Full name |
| role_title | Their job title, e.g. "Senior Estimator" |
| role_description | What they actually do day to day in plain language |
| email | Email address |
| has_email | Whether they have an email at all (some site staff won't) |
| phone | Phone number |
| is_decision_maker | Whether this person signs off on purchases |
| notes | Individual notes |
| created_at | When the record was created |
| updated_at | Last modified |

**interactions**
Every touchpoint with a prospect or client. This is the CRM activity log.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| company_id | Links to companies |
| contact_id | Links to contacts (optional — some interactions are with the company generally) |
| interaction_date | When it happened |
| type | What kind: `cold_walk_in`, `cold_call`, `cold_email`, `linkedin_message`, `warm_intro`, `meeting`, `follow_up_call`, `follow_up_email`, `site_visit`, `other` |
| summary | What happened in plain language |
| outcome | Result: `no_response`, `interested`, `meeting_booked`, `objection_raised`, `declined`, `next_step_agreed`, `proposal_requested` |
| next_step | What was agreed as the next action |
| follow_up_date | When to follow up |
| notes | Additional context |
| created_at | When the record was created |

---

### Assessment

**audits**
Company-level assessment derived from the audit survey. The owner provides an org chart, surveys are sent to all staff, and results are used to build the baseline.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| company_id | Links to companies |
| audit_date | When the audit was initiated |
| org_chart_received | Whether the owner has provided the org chart |
| team_size | Number of staff, derived from org chart |
| surveys_sent | Number of survey links sent |
| surveys_completed | Number of surveys completed |
| digital_maturity | Overall assessment derived from survey data: `low`, `medium`, `high` |
| current_tools_summary | Overview of software in use, derived from survey data |
| notes | General audit observations |
| created_at | When the record was created |

**go_no_go_decisions**
Structured decision framework applied after the audit.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| audit_id | Links to audits |
| company_id | Links to companies |
| decision | The call: `go`, `no_go`, `conditional` |
| decision_date | When the decision was made |
| decision_maker_engagement | How engaged is the person who signs cheques: `high`, `medium`, `low` |
| budget_confirmed | Whether they can afford the engagement |
| team_readiness | Based on audit and survey data: `high`, `medium`, `low` |
| champion_strength | How strong the internal champion is: `strong`, `moderate`, `weak`, `none` |
| technical_feasibility | Can their workflows actually be AI-integrated: `high`, `medium`, `low` |
| timeline_alignment | Are their expectations realistic: `aligned`, `tight`, `unrealistic` |
| estimated_roi | Rough estimate of time savings based on org chart mapping |
| risk_factors | Anything that could derail the engagement |
| decision_rationale | Written explanation of why go or no-go |
| recommended_package | Which pricing tier fits |
| estimated_hours_per_week | Calculated from number of novel MCPs, novel Skills, and number of employees |
| estimated_value | Estimated engagement value in AUD |
| created_at | When the record was created |

**capacity**
Internal capacity tracking. Used during Go/No-Go decisions to compare estimated hours per week against available bandwidth.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| team_member | Name of internal team member |
| role | Their role at PromptAI |
| total_hours_per_week | Total available hours per week |
| allocated_hours_per_week | Hours already committed to active engagements |
| available_hours_per_week | Remaining capacity |
| notes | Context or constraints |
| created_at | When the record was created |
| updated_at | Last modified |

**proposals**
Formal proposals sent after a Go decision.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| company_id | Links to companies |
| go_no_go_id | Links to go_no_go_decisions |
| package | Which package or tier |
| value | Proposed dollar amount in AUD |
| status | Where the proposal stands: `draft`, `sent`, `under_review`, `accepted`, `rejected`, `expired` |
| sent_date | When it was sent |
| modifications_requested | Any changes the prospect asked for |
| accepted_date | When they said yes |
| notes | Additional context |
| created_at | When the record was created |
| updated_at | Last modified |

---

### Delivery

**engagements**
The active client contract. Created when a proposal is accepted.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| company_id | Links to companies |
| proposal_id | Links to proposals |
| status | Delivery stage: `training`, `supporting`, `paused`, `completed`, `cancelled` |
| package | Package name |
| value | Contract value in AUD |
| staff_count | Number of staff included in the engagement |
| training_hours_per_staff | Number of training hours per staff member |
| mcps_to_build | Number of MCPs to be built |
| skills_to_build | Number of Skills to be built |
| reporting_terms | Terms of monthly reporting |
| support_terms | Terms of support services |
| start_date | When work begins |
| end_date | When the contract ends |
| milestone_dates | Key milestone dates for the engagement |
| milestone_kpis | KPIs tied to each milestone |
| claude_workspace_id | Their Claude workspace reference |
| claude_plan_type | Type of Claude plan (e.g. Team, Enterprise) |
| claude_plan_setup | Whether Claude is configured |
| num_licenses | Number of Claude licenses |
| notes | General engagement notes |
| created_at | When the record was created |
| updated_at | Last modified |

**claude_licenses**
Individual Claude licenses assigned to client staff.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| engagement_id | Links to engagements |
| contact_id | Links to contacts |
| email | Email address the license is assigned to |
| license_status | Whether the license is active: `active`, `suspended`, `revoked` |
| created_at | When the record was created |
| updated_at | Last modified |

**mcps**
Registry of all MCP servers built and their deployments.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| name | MCP server name |
| description | What this MCP connects to and does |
| engagement_id | Links to engagements — which client it was built for |
| built_date | When it was built |
| deployed | Whether it's currently deployed |
| deployed_to_accounts | Which accounts/workspaces it's deployed to |
| status | Current state: `in_development`, `deployed`, `deprecated` |
| notes | Additional context |
| created_at | When the record was created |
| updated_at | Last modified |

**skills_files**
Registry of all Skills files built and their deployments.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| name | Skills file name |
| description | What this Skills file does |
| engagement_id | Links to engagements — which client it was built for |
| built_date | When it was built |
| deployed | Whether it's currently deployed |
| deployed_to_accounts | Which accounts/workspaces it's deployed to |
| status | Current state: `in_development`, `deployed`, `deprecated` |
| notes | Additional context |
| created_at | When the record was created |
| updated_at | Last modified |

**contact_tasks**
What each person at the client company does day to day and how they do it. Mapped during the audit, used as the baseline for training and ROI measurement.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| contact_id | Links to contacts — who does this task |
| engagement_id | Links to engagements |
| task_name | Short name, e.g. "Prepare cost estimates" |
| task_description | Detailed description of what the task involves |
| software_used | What tools they currently use for this task, e.g. "Excel, Buildsoft, email" |
| frequency | How often they do it: `daily`, `weekly`, `monthly`, `per_project`, `ad_hoc` |
| time_before_ai | How long this task currently takes (in minutes) |
| time_after_ai | How long this task takes after AI implementation (in minutes, filled in later) |
| time_saved_minutes | Calculated difference — the ROI proof at task level |
| issues_before_ai | Key issues with the non-AI workflow |
| issues_after_ai | Key issues with the AI-assisted workflow |
| linked_skills | List of Skills file names relevant to this task |
| linked_mcp_connections | List of MCP connections relevant to this task |
| notes | Observations and context |
| created_at | When the record was created |
| updated_at | Last modified |

**survey_responses**
Individual survey answers. Two survey types: the audit survey (captures name, role, tasks, software, AI experience, interest in AI) and the pre-training survey (captures detailed task info, software specifics, AI experience, and availability for booking sessions).

| Field | Purpose |
|-------|---------|
| id | Primary key |
| contact_id | Links to contacts |
| company_id | Links to companies |
| survey_type | Which survey: `audit`, `pre_training` |
| survey_sent | Whether the survey link has been sent |
| survey_sent_date | When it was sent |
| survey_completed | Whether they've finished it |
| survey_completed_date | When they completed it |
| question | The survey question text |
| answer | Their response |
| created_at | When the record was created |

**training_log**
Per-person, per-session record. Holds both session details and individual notes after delivery.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| engagement_id | Links to engagements |
| contact_id | Links to contacts |
| session_number | Which session in the programme |
| title | Session name, e.g. "Claude Fundamentals" |
| scheduled_date | When it's planned |
| completed_date | When it actually happened |
| status | Where the session stands: `scheduled`, `completed`, `cancelled`, `rescheduled` |
| delivered_by | Who ran the session |
| location | On-site, virtual, specific address |
| attended | Whether this person attended |
| session_notes | How the session went for this person — progress, struggles, follow-ups |
| created_at | When the record was created |
| updated_at | Last modified |

**support_tickets**
Tracks support requests from clients — what was requested, what was done, and resolution.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| engagement_id | Links to engagements |
| contact_id | Links to contacts (who raised the request, optional) |
| request_date | When the request came in |
| category | Type of support: `mcp_issue`, `skill_issue`, `claude_config`, `troubleshooting`, `training_request`, `ad_hoc_support`, `other` |
| description | What was requested |
| resolution | What was done to resolve it |
| status | Where the ticket stands: `open`, `in_progress`, `resolved`, `closed` |
| hours_spent | Time spent on this ticket |
| handled_by | Who handled it |
| resolved_date | When it was resolved |
| notes | Additional context |
| created_at | When the record was created |
| updated_at | Last modified |

---

### Measurement

**ai_usage**
Timestamped token usage per person per company. Combined with time savings from contact_tasks, this powers monthly reports and trend analysis.

| Field | Purpose |
|-------|---------|
| id | Primary key |
| engagement_id | Links to engagements |
| company_id | Links to companies |
| contact_id | Links to contacts — which individual |
| usage_date | Date of usage record |
| tokens_used | Number of tokens consumed |
| notes | Context or observations |
| created_at | When the record was created |

---

## Workflow

### 1. Sales

**What happens:** You identify a prospect, reach out, follow up, and get them to a first meeting.

**Step 1 — Log the prospect.** You hear about or see a construction company. You tell Claude: "New prospect — Smith Building Group, 12 staff, Bondi Junction, found via cold walk-in." Claude creates a record in **companies** with status `lead`.

**Step 2 — Make first contact.** You walk in, call, email, or message them. Claude logs an **interaction** — the type, what happened, the outcome, and when to follow up. If you spoke to someone specific, Claude creates a **contact** and links the interaction to them. Company status moves to `contacted`.

**Step 3 — Follow up.** Claude tells you who needs a follow-up this week by checking **interactions** with upcoming follow_up_dates. Each follow-up is logged as a new interaction. If they don't respond after multiple attempts, you note the lost_reason on the company and move on.

**Step 4 — First meeting.** They agree to meet. Company status moves to `meeting_scheduled`. After the meeting, Claude logs the interaction with what was discussed, their concerns, what excited them, and the agreed next step. Status moves to `meeting_complete`. If they want to proceed, you propose an audit.

### 2. Assessment

**What happens:** You send the company an audit survey, collect responses, build a baseline of who does what and how long it takes, and decide whether to take them on.

**Step 5 — Send and track the audit survey.** Company status moves to `auditing`. The owner provides an org chart with names, roles, and emails. Claude creates **contacts** for each person from the org chart. You send each employee a survey link. The survey asks for their name, job role, what tasks they complete, what software each task uses, whether they've used AI for any tasks, which AI they've used, and whether they're interested in learning about AI. Claude tracks whether each person has an email, whether the link has been sent, and whether they've responded — compared against the org chart to identify who's still outstanding.

**Step 6 — Build the baseline from survey data.** Once surveys are in, Claude creates **contact_tasks** for each respondent — task names, software used, and frequency. Team size and digital maturity are derived from the survey data.

**Step 7 — Go/No-Go decision.** You review everything — survey data, contact tasks, your own observations. Claude creates a **go_no_go_decision** with structured scoring:
- Decision maker engagement — are they genuinely bought in?
- Budget confirmed — can they pay?
- Team readiness — will the staff actually adopt this?
- Champion strength — is there someone internal who'll push it?
- Technical feasibility — do their workflows suit AI integration?
- Timeline alignment — are expectations realistic?
- Estimated ROI — based on the task mapping, how much time could AI save?
- Risk factors — what could go wrong?
- Estimated hours per week — calculated from the number of novel MCPs to build, novel Skills to build, and number of employees. Claude compares this against internal **capacity** to see whether you have the bandwidth to take this on.

You write a decision rationale and recommend a package. Company status moves to `go` or `no_go`.

**Step 8 — Send proposal.** If it's a Go, Claude creates a **proposal** with the recommended package, value, and scope. You send it. Company status moves to `proposal_sent`. Any negotiation is tracked via **interactions**. When they accept, proposal status moves to `accepted` and company status moves to `onboarding`.

### 3. Delivery

**What happens:** You set up their AI infrastructure, train their team, build custom tools, track adoption at the individual level, and continuously measure progress against the baseline you established during the audit.

#### 3.1 Onboarding

**Step 10 — Create the engagement.** Claude creates an **engagement** linked to the company and proposal. Status: `onboarding`. You record the package, contract value, start date, end date, number of staff, number of training hours per staff member, number of MCPs to be built, number of Skills to be built, terms of monthly reporting, terms of support services, milestone dates, and milestone KPIs.

**Step 11 — Set up Claude.** You provision their Claude workspace. Once it's configured, you update the engagement with the workspace ID, type of Claude plan, number of licenses, and the email associated with each license. Mark claude_plan_setup as true.

**Step 12 — Build MCP connections.** Based on what you learned in the audit — what software they use, what tasks are most valuable to automate — you build MCP servers that connect Claude to their existing tools. Each one is logged as a **work_completed** record (category: `mcp_build`, with hours spent and who built it). The database maintains a list of all MCPs built and all MCPs deployed, including which accounts each MCP is deployed to.

**Step 13 — Build Skills files.** You create custom Skills files tailored to their workflows. An estimator's Skill might teach Claude how to read their specification documents, apply their markup percentages, and format estimates in their template. Each one is logged as a **work_completed** record (category: `skill_creation`). The database maintains a list of all Skills built and all Skills deployed, including which accounts each Skill is deployed to.

**Step 14 — Finalise contact_tasks for delivery.** Review the contact_tasks mapped during the audit. Confirm which tasks will be included in the training programme. For each task, fill in the linked_skills and linked_mcp_connections that will support it. Identify the key_challenges for each — what will make this transition difficult for this specific person. The time_before_ai is already recorded from the audit. The ai_adoption_status starts at `not_started`.

**Step 15 — Send pre-training survey.** You send each employee a more detailed survey. This captures specifics about their tasks, the software they use to complete them, their experience with AI, and their availability for booking training sessions. Claude tracks whether each survey has been sent and whether it's been completed. Responses are stored in **survey_responses** and used to prepare the training programme.

#### 3.2 Training

**Step 16 — Schedule training sessions.** Claude creates **training_log** records for each person for each session. Each record holds the session details — session number, title, scheduled date, location, and who's delivering it.

**Step 17 — Log training delivery.** After each session, Claude updates the **training_log** records with per-person notes — whether they attended, how the session went, what progress was made, what they struggled with, and any follow-ups needed. Before each session, Claude pulls each attendee's survey data — their key tasks, the software they use, and their perspective toward AI.

**Step 18 — Update contact_tasks after training.** As training progresses, update **contact_tasks** with time_after_ai measurements and ai_adoption_status. Track key issues with the non-AI workflow and key issues with the AI-assisted workflow for each task. This is the data that proves the value of the engagement.

**Step 19 — Engagement status update.** Move the engagement from `training` to `supporting`. Training is complete. Ongoing support begins.

#### 3.3 Ongoing Delivery & Support

**Step 20 — Monthly check-ins.** Log ongoing **interactions** with the client. Track any support requests in **support_tickets** — what was requested, what was done, status, hours spent, and who handled it. Training sessions may continue during the supporting period and are logged in **training_log** as before.

**Step 21 — Track usage.** The database maintains an **ai_usage** table that tracks token usage per person per company. Combined with time savings from **contact_tasks**, this is what makes your monthly reports credible.

### 4. Measurement

**What happens:** Every month, you generate a report from timestamped records across the database. This data builds your long-term ROI evidence.

**Step 22 — Generate monthly report.** Claude pulls data from timestamped records across tables to build the report:
- From **ai_usage**: token usage per person per company
- From **contact_tasks**: time savings per person per task
- From **support_tickets**: support work done with hours logged
- From **training_log**: training progress and individual development

The report answers the client's core question: "Is this worth what we're paying?" The answer is in the numbers — total hours saved across the team, usage trends, and specific examples of tasks that are now dramatically faster.

**Step 23 — Trend analysis.** Over multiple months, timestamped records in **ai_usage** and **contact_tasks** build a time series. You can show: "In month 1, your team saved 47 hours. In month 3, that's grown to 83 hours as adoption deepened and people got more skilled." This trend line is what justifies renewals and upsells.

**Step 24 — Feed back into assessment.** The usage and ROI data from active clients feeds back into your Go/No-Go decision making. Your audits get sharper, your proposals get more accurate, and your no-go decisions save you from engagements that wouldn't have worked.

---

## Table Summary

| Business Function | Table | Purpose |
|---|---|---|
| Sales | companies | Every business in your pipeline |
| Sales | contacts | People at those businesses |
| Sales | interactions | Every touchpoint — calls, meetings, emails, follow-ups |
| Assessment | audits | Company-level assessment derived from surveys |
| Assessment | go_no_go_decisions | Structured decision framework |
| Assessment | capacity | Internal team bandwidth tracking |
| Assessment | proposals | Formal proposals sent after Go decision |
| Delivery | engagements | Active client contracts |
| Delivery | claude_licenses | Claude licenses assigned to client staff |
| Delivery | mcps | All MCPs built and their deployment status |
| Delivery | skills_files | All Skills files built and their deployment status |
| Delivery | contact_tasks | What each person does and how long it takes, before and after AI |
| Delivery | survey_responses | Audit and pre-training survey answers |
| Delivery | training_log | Per-person, per-session scheduling and delivery notes |
| Delivery | support_tickets | Support requests, resolution, and hours |
| Measurement | ai_usage | Token usage per person per company, timestamped |
