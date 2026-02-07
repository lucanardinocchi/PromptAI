# Skill: Generate Lesson Plan for Training Session

## Workflow Step

Steps 16-17 — Schedule training sessions and prepare for delivery.

## Purpose

Generate a personalised lesson plan for a specific contact's next training session. The plan is tailored to their role, tasks, software, AI experience, and progress from previous sessions.

## When to Use

Before each training session. You need to know the company, the contact, and which session number is next.

## Inputs

You need the company name or ID, the contact name or ID, and the session number (1, 2, 3, or 4).

## Session Sequence

Each session has a fixed theme. The lesson plan personalises the content within that theme to the individual.

**Session 1 — Claude Fundamentals**
- What Claude is and how it works
- Prompt engineering basics — how to write clear instructions, provide context, and iterate
- Hands-on practice using the contact's actual work tasks
- Goal: build comfort, show immediate value with simple tasks

**Session 2 — Advanced Prompting & Daily Workflows**
- Advanced prompting techniques — chain of thought, structured output, few-shot examples
- Introduction to Skills files — what they are, how to use them
- Integrating Claude into daily workflows — replacing manual steps with AI-assisted ones
- Goal: move from practice exercises to real work with AI

**Session 3 — MCP Connections & Automation**
- How Claude connects to existing tools via MCP
- Hands-on use of MCP connections relevant to this person's tasks
- Identifying automation opportunities beyond what was originally mapped
- Goal: Claude stops feeling like a separate tool and starts feeling like an upgrade to existing workflow

**Session 4 — Review, ROI & Handover**
- Review what was learned across all sessions
- Address remaining struggles
- Set up the ongoing measurement process — how AI usage and time savings will be tracked
- Ensure they can access Skills files and MCP connections independently
- Goal: transition from training mode to supported usage mode

## Process

### 1. Pull data from the database

Use the MCP tools to retrieve:

- `list_companies` — get the company record (name, industry)
- `list_contacts` — get the contact record (name, role_title, role_description) filtered by contact_id
- `list_contact_tasks` — get all tasks for this contact (task_name, task_description, software_used, frequency, time_before_ai, time_after_ai, issues_before_ai, issues_after_ai, linked_skills, linked_mcp_connections)
- `list_survey_responses` — get this contact's survey responses (both audit and pre_training) for their AI experience, software details, and perspective toward AI
- `list_training_log_entries` — get all previous session records for this contact (session_number, attended, session_notes, status) to understand what progress has been made and what was flagged for follow-up
- `list_engagements` — get the engagement record for linked Skills and MCPs available

### 2. Assess where the contact is

From the data, determine:

- **Their role and key tasks** — what they do day to day, ranked by time_before_ai (biggest time sinks first)
- **Their software** — what tools they use, which ones have MCP connections available
- **Their AI experience** — from survey responses, have they used AI before? Which tools? Are they interested or sceptical?
- **Their progress** — from previous training_log entries, what was covered? What went well? What did they struggle with? What follow-ups were flagged?
- **Their task-specific issues** — from contact_tasks, what are the issues_before_ai and issues_after_ai for each task?

### 3. Build the lesson plan

Structure the lesson plan as follows:

**Header:**
- Contact name and role
- Company name
- Session number and title
- Scheduled date and location
- Delivered by

**Pre-Session Summary (for the trainer):**
- 2-3 sentences on who this person is, their role, and their AI readiness
- Key observations from previous sessions (if any)
- Flagged follow-ups from last session (if any)
- Their attitude toward AI from survey data

**Session Objectives (3-5 bullet points):**
Specific, measurable things this person should be able to do by the end of the session. These must relate to their actual tasks, not abstract concepts.

Example for Session 1 (Estimator):
- Write a prompt that extracts quantities from a specification document
- Use Claude to draft a subcontractor quote request email in their own voice
- Understand how to provide context so Claude produces accurate output

Example for Session 3 (Estimator with Buildsoft MCP):
- Use the Buildsoft MCP to pull cost data directly into Claude
- Complete a full cost estimate workflow using Claude + MCP
- Identify one additional task where MCP integration would save time

**Agenda:**
Break the session into timed blocks. Default session length is 1.5 hours.

For Session 1:
- 0:00-0:15 — Introduction: what Claude is, how it works, what it can and cannot do
- 0:15-0:30 — Prompt engineering basics: structure, context, iteration (use examples from their industry)
- 0:30-0:45 — Guided practice: trainer walks through a task from their contact_tasks using Claude
- 0:45-1:15 — Hands-on practice: contact attempts 2-3 of their own tasks with Claude, trainer observes and coaches
- 1:15-1:30 — Wrap-up: what worked, what was hard, what to try before next session

For Session 2:
- 0:00-0:10 — Review: what they tried since last session, any questions
- 0:10-0:25 — Advanced prompting: chain of thought, structured output, few-shot examples (using their tasks)
- 0:25-0:40 — Skills files: introduce the Skills file built for their role, demonstrate how it changes Claude's output
- 0:40-1:15 — Real work: contact completes a full task from start to finish using Claude + Skills file. Trainer observes.
- 1:15-1:30 — Wrap-up: compare time taken vs baseline, discuss what felt natural vs forced

For Session 3:
- 0:00-0:10 — Review: progress since last session
- 0:10-0:25 — MCP introduction: what MCPs are, which ones are set up for their tools
- 0:25-0:45 — Guided practice: trainer demonstrates MCP connection with their actual software and data
- 0:45-1:15 — Hands-on practice: contact uses Claude + MCP to complete tasks. Focus on tasks where MCP integration has the biggest impact.
- 1:15-1:30 — Wrap-up: identify additional automation opportunities, discuss any friction

For Session 4:
- 0:00-0:15 — Progress review: walk through each contact_task and current status
- 0:15-0:30 — Address struggles: revisit any tasks that are still difficult, troubleshoot together
- 0:30-0:45 — Independence check: contact demonstrates they can access and use Skills files and MCPs without help
- 0:45-1:05 — ROI discussion: show time savings data, explain how usage will be tracked going forward
- 1:05-1:20 — Ongoing support: how to get help, what support looks like, expectations
- 1:20-1:30 — Wrap-up: feedback, any final questions

**Task-Specific Practice Activities:**
For each contact_task that will be covered in this session, provide:
- Task name
- What the contact currently does (software, time, process)
- What the AI-assisted version looks like
- The specific prompt or workflow to practice
- Which Skills file or MCP connection to use (if applicable)
- What success looks like — how do they know they did it right?

Prioritise tasks by:
1. Biggest time savings potential
2. Tasks they've already shown interest in (from survey or previous sessions)
3. Tasks that build on what was covered in previous sessions

**Post-Session Actions (for the trainer):**
- Update the training_log entry with session notes
- Update contact_tasks with any new time_after_ai measurements
- Note any follow-ups needed for next session
- Flag any issues_after_ai discovered during practice

### 4. Save to database

After generating the lesson plan:

- Check if a `training_log` entry already exists for this contact and session number. If not, use `create_training_log_entry` with the engagement_id, contact_id, session_number, title, scheduled_date, status: `scheduled`
- If it already exists, no database action needed at this stage. The entry gets updated after delivery (Step 17).

## Output Format

Present the lesson plan as a clean, structured document. Use the contact's name and real task names throughout. Every practice activity should reference their actual work, not generic examples.

## Important Notes

- Always use real data from the database. Never invent tasks or software.
- If this is Session 2, 3, or 4 and there are no previous training_log entries, flag this — previous session data is missing and the plan may not account for their actual progress.
- If survey data is missing, flag it and note that the plan is based on contact_tasks only, without self-reported AI experience or attitudes.
- Adjust complexity based on digital maturity from the audit. Low digital maturity = more time on basics, simpler practice tasks. High digital maturity = move faster, more advanced exercises.
- If previous session notes flag the contact as sceptical or resistant, the plan should include more demonstration of value before asking them to practise independently.
- Session 3 can only include MCP practice if MCPs have actually been built and deployed for this client. Check the mcps table via MCP. If no MCPs are deployed, Session 3 focuses on automation planning and advanced Skills file usage instead.
