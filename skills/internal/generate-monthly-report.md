# Skill: Generate Monthly Report

## Workflow Step

Step 22 — Generate monthly report.

## Purpose

Produce a client-facing monthly report for an active engagement. The report answers the client's core question: "Is this worth what we're paying?" It uses timestamped data from the database to show AI usage, time savings, training progress, and support work delivered.

## When to Use

At the end of each month for every engagement with status `supporting` (or `training` if training is still underway and reporting terms require it).

## Inputs

You need the company name or ID, and the month to report on (e.g. "January 2026" or "2026-01").

## Process

### 1. Pull data from the database

Use the MCP tools to retrieve all data for this company and reporting period:

- `list_companies` — get the company record (name, industry, location)
- `list_engagements` — get the engagement record (package, value, start_date, staff_count, reporting_terms, milestone_dates, milestone_kpis)
- `list_contacts` — get all contacts for this company (name, role_title)
- `list_contact_tasks` — get all contact_tasks for contacts at this company (task_name, software_used, time_before_ai, time_after_ai, time_saved_minutes, issues_before_ai, issues_after_ai, linked_skills, linked_mcp_connections)
- `list_ai_usage_records` — filter by company_id and usage_date within the reporting month. This gives token usage per person.
- `list_training_log_entries` — filter by engagement_id and completed_date within the reporting month. This gives any training delivered this month.
- `list_support_tickets` — filter by engagement_id and request_date or resolved_date within the reporting month. This gives support work done.
- `list_mcps` — filter by engagement_id. Get current deployment status of all MCPs.
- `list_skills_files` — filter by engagement_id. Get current deployment status of all Skills files.

### 2. Also pull previous month data for comparison

Repeat the ai_usage query for the previous month. This allows month-on-month comparison of token usage and adoption trends.

If this is month 3 or later, also pull month 1 data to show the full trajectory.

### 3. Calculate metrics

**Usage metrics (from ai_usage):**
- Total tokens used across all contacts this month
- Tokens per person — rank contacts by usage, highest to lowest
- Month-on-month change in total tokens (percentage increase or decrease)
- Number of active users (contacts with any token usage this month)
- Number of inactive users (contacts with zero token usage this month)

**Time savings metrics (from contact_tasks):**
- For each contact_task that has both time_before_ai and time_after_ai:
  - Time saved per instance = time_before_ai - time_after_ai
  - Estimate monthly instances based on frequency (daily = 20/month, weekly = 4/month, monthly = 1/month, per_project = use best estimate from notes or default to 2/month)
  - Monthly time saved = time saved per instance x monthly instances
- Total monthly hours saved across all contacts and tasks
- Dollar value of time saved = total minutes saved / 60 x $65 AUD
- ROI calculation = dollar value of time saved / (engagement value / contract months) — expressed as a percentage

**Training metrics (from training_log):**
- Sessions delivered this month — count, list titles
- Per-person attendance — who attended, who didn't
- Key observations from session_notes

**Support metrics (from support_tickets):**
- Tickets opened this month
- Tickets resolved this month
- Total hours spent on support
- Open tickets still unresolved

**Infrastructure metrics (from mcps and skills_files):**
- MCPs deployed vs planned (mcps deployed count vs engagement mcps_to_build)
- Skills files deployed vs planned (skills_files deployed count vs engagement skills_to_build)
- Any new MCPs or Skills files deployed this month

### 4. Write the report

Structure the report as follows:

**Header:**
- PromptAI Monthly Report
- Company name
- Reporting period (month and year)
- Report date

**Executive Summary (3-5 sentences):**
- Total hours saved this month across the team
- Dollar value of time saved
- Headline trend — is usage growing, stable, or declining?
- One standout result (e.g. "Sarah's estimation workflow is now 70% faster than baseline")
- One area to watch (e.g. "Tom has not used Claude this month — follow up recommended")

**AI Usage Overview:**
Table with columns: Contact Name | Role | Tokens Used | Change vs Last Month

Below the table:
- Total active users: X of Y
- Total tokens: X (up/down X% from last month)
- Highlight top user and note any inactive users

**Time Savings by Person:**
Table with columns: Contact Name | Role | Task | Time Before (min) | Time After (min) | Saved (min) | Frequency | Monthly Hours Saved

Below the table:
- Total monthly hours saved: X hours
- Dollar value: $X AUD
- ROI this month: X% of engagement cost recovered in time savings

**Time Savings Trend (if month 2+):**
- Month 1: X hours saved
- Month 2: X hours saved
- Month 3: X hours saved (etc.)
- Trajectory commentary — is the team getting more efficient over time?

**Training This Month:**
- Sessions delivered (if any) — title, date, who attended
- Key observations from session notes
- If no training this month, note this

**Support This Month:**
- Tickets opened: X
- Tickets resolved: X
- Hours spent: X
- Summary of notable tickets (1-2 sentences each)
- Open tickets still pending

**Infrastructure Status:**
- MCPs: X of Y planned deployed
- Skills files: X of Y planned deployed
- Any changes this month

**Milestone Check (if milestone_dates and milestone_kpis are set):**
- List each milestone date that falls within or before this month
- Status: met / on track / at risk / missed
- KPI measurement against target

**Recommendations:**
Based on the data, provide 2-4 specific recommendations:
- If a contact is inactive, recommend a check-in or refresher session
- If a task has low time savings, suggest reviewing the workflow or Skills file
- If usage is growing, suggest expanding to additional tasks or team members
- If a milestone is at risk, flag it with a suggested action
- If all MCPs/Skills are deployed and adoption is high, discuss renewal or upsell

**Next Month Focus:**
- 2-3 bullet points on what to prioritise next month

### 5. Save to database

No new records need to be created. The report is generated from existing timestamped data. If any observations from writing the report warrant updates:

- Update `contact_tasks` with revised issues_after_ai if the report reveals new issues
- Create `support_tickets` if the report identifies problems that need follow-up
- Log an `interaction` for the report delivery itself (type: `follow_up_email` or `meeting`, summary: "Monthly report delivered for [month]")

## Output Format

Present the report as a clean, professional document. Use tables for data-heavy sections. Use plain language in commentary. Every number should be traceable to a specific database record.

## Important Notes

- Always use real data from the database. Never fabricate usage numbers or time savings.
- If time_after_ai is not set for some contact_tasks, exclude those tasks from the time savings calculation and note them as "measurement pending" in the report.
- If ai_usage has no records for the reporting month, the report should flag this clearly — either usage data hasn't been entered yet, or the team genuinely didn't use Claude that month. Both are important to surface.
- If this is the first monthly report (month 1), there is no previous month comparison. Skip the trend section and note that the baseline is being established.
- The tone should be factual and constructive. If results are poor, frame it as "areas for improvement" with specific actions, not criticism.
- Round hours to one decimal place. Round dollar values to the nearest $10.
