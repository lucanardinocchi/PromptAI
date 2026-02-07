# Skill: Write Proposal from Audit Data

## Workflow Step

Step 8 — Send proposal.

## Purpose

Produce a client-ready proposal for a construction company based on their audit survey data, contact task mapping, and company profile. Then create the proposal record in the database.

## When to Use

After the Go/No-Go decision has been made and the decision is `go`. The company status should be `go` in the database.

## Inputs

You need the company name or ID. Everything else comes from the database.

## Process

### 1. Pull data from the database

Use the MCP tools to retrieve:

- `list_companies` — get the company record (status, size, industry, location)
- `list_contacts` — get all contacts for this company (roles, decision makers)
- `list_audits` — get the audit record (team size, digital maturity, current tools summary)
- `list_contact_tasks` — get all mapped tasks for contacts at this company (task names, software used, frequency, time_before_ai)
- `list_go_no_go_decisions` — get the Go decision (recommended package, estimated value, estimated hours per week, estimated ROI, decision rationale)

### 2. Calculate scope

From the contact_tasks data, determine:

- **Total staff to train** — count of unique contacts with mapped tasks
- **Number of MCPs to build** — count distinct software tools across all contact_tasks that would benefit from an MCP connection (e.g. Buildsoft, MYOB, Procore, project management tools). Standard tools like Excel, Outlook, and web browsers do not need MCPs.
- **Number of Skills files to build** — group contact_tasks by role. Each distinct role with AI-automatable tasks needs at least one Skills file. Complex roles with diverse task types may need two.
- **Training hours per person** — default to 4 sessions x 1.5 hours = 6 hours per person. Adjust up for teams with low digital maturity, adjust down for teams with high digital maturity.
- **Estimated total hours per week for delivery** — use the estimated_hours_per_week from the Go/No-Go decision.

### 3. Calculate ROI estimate

For each contact_task:

- Estimate time_after_ai based on the task type:
  - Document-based tasks (estimation, quoting, report writing): estimate 50-70% time reduction
  - Communication tasks (email drafting, quote chasing): estimate 60-80% time reduction
  - Data entry and tracking tasks (spreadsheet updates, cost tracking): estimate 40-60% time reduction
  - Complex judgment tasks (project scheduling, risk assessment): estimate 20-40% time reduction
- Calculate time_saved_minutes per task = time_before_ai - estimated time_after_ai
- Multiply by frequency to get monthly savings per task
- Sum across all tasks and contacts to get total monthly hours saved
- Convert to dollar value using an average hourly rate of $65 AUD for construction office staff

### 4. Determine package and pricing

Based on the scope:

- **Starter** (1-5 staff, 0-1 MCPs, 1-2 Skills): $5,000 - $8,000
- **Professional** (6-15 staff, 2-3 MCPs, 3-5 Skills): $10,000 - $18,000
- **Enterprise** (16+ staff, 4+ MCPs, 6+ Skills): $20,000 - $35,000

Adjust within the range based on:
- Number of novel MCPs (novel = not built before for any client)
- Complexity of their software ecosystem
- Training hours required
- Monthly reporting and support terms

Use the recommended_package and estimated_value from the Go/No-Go decision as a starting point. Adjust if the task mapping suggests a different scope.

### 5. Write the proposal

Structure the proposal as follows:

**Header:**
- PromptAI logo placeholder
- Proposal date
- Company name and contact (decision maker)

**Executive Summary (2-3 paragraphs):**
- What you observed about their current operations from the audit
- The opportunity — how AI can improve their specific workflows
- The bottom line — estimated hours saved per month and ROI

**Scope of Work:**
- Claude Enterprise setup — plan type, number of licenses
- MCP connections to be built — list each one with what it connects to
- Skills files to be created — list each one with the role it supports
- Training programme — number of sessions, hours per person, what each session covers
- Monthly reporting — what's included
- Ongoing support — what's included

**Your Team, Task by Task:**
For each role at the company, list:
- The person (or people) in that role
- Their key tasks from the audit
- How AI will help with each task
- Estimated time savings per task

**Investment:**
- Package name and total value
- What's included
- Payment terms
- Contract duration (recommend 6 months for first engagement)

**Timeline:**
- Week 1-2: Claude Enterprise setup, MCP builds, Skills file creation
- Week 3-4: Training Session 1 and 2
- Week 5-6: Training Session 3 and 4
- Month 2 onwards: Ongoing support and monthly reporting

**Next Steps:**
- How to accept
- Who to contact

### 6. Save to database

After writing the proposal, use the MCP tools:

- `create_proposal` — with company_id, go_no_go_id, package, value, status: `draft`
- `update_company` — set status to `proposal_sent` (only after the proposal is actually sent)

## Output Format

Present the proposal as a clean, professional document. Use plain language. Avoid jargon. Every claim about time savings should reference specific tasks from the audit data.

## Important Notes

- Always use real data from the database. Never make up task names, software, or time estimates.
- If audit data is incomplete (e.g. missing time_before_ai on some tasks), flag this and note which tasks need more data before the proposal can be finalised.
- The proposal should feel specific to this company, not generic. Reference their actual tools, roles, and workflows by name.
- Round time savings to whole numbers. Round dollar values to the nearest $100.
- If the Go/No-Go decision included risk factors, address them in the proposal (e.g. if team readiness is low, emphasise the training programme).
