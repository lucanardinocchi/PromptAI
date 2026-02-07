# Skill: Generate Lesson Plan for Training Session

## Workflow Step

Steps 16-17 — Schedule training sessions and prepare for delivery.

## Purpose

Generate a complete facilitator's guide for a specific contact's next training session. The guide includes a personalised lesson plan, timed agenda with talking points, exercises, common questions with answers, and strategies for handling resistance. Everything is tailored to the contact's role, tasks, software, AI experience, and progress from previous sessions.

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
- `list_mcps` — get all MCPs built for this engagement (name, description, status, deployed)
- `list_skills_files` — get all Skills files built for this engagement (name, description, status, deployed)

### 2. Assess where the contact is

From the data, determine:

- **Their role and key tasks** — what they do day to day, ranked by time_before_ai (biggest time sinks first)
- **Their software** — what tools they use, which ones have MCP connections available
- **Their AI experience** — from survey responses, have they used AI before? Which tools? Are they interested or sceptical?
- **Their progress** — from previous training_log entries, what was covered? What went well? What did they struggle with? What follow-ups were flagged?
- **Their task-specific issues** — from contact_tasks, what are the issues_before_ai and issues_after_ai for each task?
- **Their resistance profile** — from survey data and previous session notes, categorise as: eager, open, cautious, sceptical, or resistant

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
- Resistance profile and recommended approach

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

---

## Session 1 — Claude Fundamentals: Facilitator Guide

### Timed Agenda (1.5 hours)

**0:00–0:15 — Introduction: What Claude Is**

Talking points:
- "Claude is an AI assistant — think of it like having a very capable colleague who can read, write, analyse, and follow instructions, but needs you to provide the context and direction."
- "It doesn't know anything about your specific company, your projects, or your clients unless you tell it. The better you explain what you need, the better the output."
- "It's not replacing anyone. It's making the work you already do faster and more consistent."
- Demonstrate by opening Claude and asking it a simple question relevant to their industry — e.g., "What are the typical markup percentages for electrical subcontracting in residential construction in Sydney?"
- Show that Claude gives a useful answer but may not match their exact numbers — this is why context matters.

Key message: Claude is a tool that amplifies what you already know. You're the expert; Claude handles the repetitive parts.

**0:15–0:30 — Prompt Engineering Basics**

Talking points:
- "A prompt is just an instruction. The clearer the instruction, the better the result."
- Introduce the three pillars: **Role** (who Claude should be), **Context** (what it needs to know), **Task** (what you want it to do).
- Walk through a bad prompt vs a good prompt using one of their actual tasks.

Exercise — "Fix This Prompt" (5 minutes):
- Show a vague prompt related to their work — e.g., "Write me an email about the project."
- Ask them what's missing. Guide them to add: who it's to, what project, what the email needs to say, what tone.
- Rewrite it together and run it. Compare the outputs.

Talking points continued:
- "If the output isn't right, don't start over. Iterate — tell Claude what to change. 'Make it more formal', 'Add the project number', 'Shorten this to 3 sentences'."
- Demonstrate iteration live — take the email output and refine it in 2-3 follow-up prompts.

**0:30–0:45 — Guided Practice: Trainer Walks Through a Task**

Pick their highest-impact contact_task (the one with the most time_before_ai). Walk through it step by step:
- Explain what you're doing and why at each step
- Show how to provide context from their actual documents or data
- Show the output and discuss: is this useful? What would you change?
- Iterate the prompt 2-3 times to show the refinement process

Talking points:
- "Notice I didn't get a perfect answer on the first try. That's normal. The skill is knowing how to guide Claude to what you need."
- "This task currently takes you [X minutes]. Let's see how long it takes with Claude once you get comfortable."

**0:45–1:15 — Hands-On Practice**

Exercise — "Your Tasks, Your Way" (30 minutes):
- Give them 2-3 tasks from their contact_tasks list, ordered by impact
- For each task, provide a starter prompt template they can customise:
  - Task 1 (highest priority): Full guided attempt. Trainer sits alongside, coaches in real-time.
  - Task 2: Semi-guided. Trainer provides the starter prompt, contact modifies and runs it.
  - Task 3 (if time allows): Independent. Contact writes the prompt from scratch. Trainer observes and gives feedback after.

For each task, note:
- How long it took them
- Where they got stuck
- What the output quality was like
- Whether they needed to iterate and how many times

**1:15–1:30 — Wrap-Up**

Talking points:
- "What surprised you today? What was easier or harder than you expected?"
- "Before next session, I want you to try using Claude for [specific task] at least once. Don't worry about getting it perfect — just try it and note what happens."
- "Next session we'll go deeper — advanced techniques and the custom Skills file we've built specifically for your role."

Assign homework: Use Claude for one specific task before the next session. Keep notes on what worked and what didn't.

### Common Questions — Session 1

| Question | Suggested Answer |
|----------|-----------------|
| "Is this going to replace my job?" | "No. Claude can't do your job — it doesn't have your experience, your relationships, or your judgment. What it can do is handle the repetitive, time-consuming parts so you can focus on the work that actually needs your expertise." |
| "What about confidentiality? Is my data safe?" | "Claude Enterprise has a strict privacy policy — your conversations and data are not used to train the model. Your company has its own workspace that's separate from other organisations. It's the same level of security you'd expect from any enterprise software." |
| "What if it gives me wrong information?" | "Claude can make mistakes, especially with specific numbers or company-specific details. That's why you always review the output. Think of it as a first draft that you check and refine, not a final answer. Over time, you'll learn how to prompt it so the output needs less correction." |
| "I'm not good with technology." | "You don't need to be. If you can write an email, you can use Claude. It's a conversation — you type what you need, it responds. We'll practise together until it feels natural." |
| "This seems like a lot of effort to learn." | "I hear you. Let's focus on one task today — the one that takes the most time. If we can cut that time in half, that's [X hours] back every [week/month]. Once you see the result with your own work, the effort makes sense." |

### Handling Resistance — Session 1

**The Sceptic** ("I don't see how this helps me"):
- Don't argue. Ask them to pick their most tedious task and say: "Let me show you something — just watch for two minutes." Run it live with their actual work. Let the output speak for itself. If it's not impressive, acknowledge it honestly and try a different task.

**The Overwhelmed** ("This is too much to learn"):
- Slow down. Focus on ONE task only. Remove complexity. Say: "Forget everything else — let's just get this one thing working. If it saves you 30 minutes a week, that's enough for today."

**The Passive** (nods but doesn't engage):
- Get them typing. Passive observers don't learn. Say: "Your turn — type this prompt in and let's see what happens." Make the first prompt very simple and guaranteed to produce a useful result.

**The Know-It-All** ("I already use ChatGPT"):
- Acknowledge their experience. Say: "Great, you've got a head start. Let me show you what's different about Claude and how the custom setup we've built connects directly to your tools." Jump to more advanced examples to keep them engaged.

---

## Session 2 — Advanced Prompting & Daily Workflows: Facilitator Guide

### Timed Agenda (1.5 hours)

**0:00–0:10 — Review: What Happened Since Last Session**

Talking points:
- "How did the homework go? Did you try using Claude for [assigned task]?"
- If they did: discuss what worked, what didn't, what questions came up. Use their experience as the entry point for today's content.
- If they didn't: no judgment. Say: "That's fine — we'll build that habit today. By the end of this session you'll have a workflow that slots right into your day."

**0:10–0:25 — Advanced Prompting Techniques**

Talking points:
- "Last session you learned the basics — role, context, task. Today we're going to make your prompts significantly more powerful."

Technique 1 — Chain of Thought:
- "Instead of asking Claude for a final answer, ask it to think through the steps first. This is like asking a colleague to show their working."
- Example using their task: "Before giving me the final estimate, walk through each trade line by line and explain your reasoning."
- Show the difference in output quality.

Technique 2 — Structured Output:
- "You can tell Claude exactly what format you want the output in. Table, bullet points, specific headings — whatever matches your existing templates."
- Example: "Format this as a table with columns: Trade, Quantity, Unit Rate, Total. Use the same layout as our standard estimate template."

Technique 3 — Few-Shot Examples:
- "If you show Claude an example of what good output looks like, it can replicate that pattern."
- Example: "Here's an example of how I write subcontractor emails: [paste example]. Now write a similar email for [different subcontractor and scope]."

Exercise — "Level Up Your Prompts" (5 minutes):
- Take the homework task prompt from last session. Rewrite it using one of the three techniques. Run both versions and compare output.

**0:25–0:40 — Skills Files**

Talking points:
- "A Skills file is a set of permanent instructions for Claude. Instead of typing the same context every time, you save it once and Claude always knows it."
- "We've built a Skills file specifically for your role. It already knows your company's templates, your terminology, and how you like things formatted."
- Open the Skills file and walk through what's in it. Show them exactly what instructions Claude has been given.

Exercise — "With and Without" (10 minutes):
- Run the same task twice: once without the Skills file active, once with it. Show the difference in output quality, specificity, and formatting.
- Ask: "Which output would you actually use?" The Skills file version should be noticeably better.

**0:40–1:15 — Real Work Session**

Exercise — "Full Task, Start to Finish" (35 minutes):
- Choose their highest-priority contact_task that they haven't fully done with AI yet.
- The contact completes the entire task using Claude + Skills file, from start to finish.
- Trainer observes but does NOT help unless they're stuck for more than 2 minutes.
- Time the task. Record the time — this is the first real time_after_ai measurement.

After completion:
- Compare time_before_ai vs time_after_ai. Calculate the savings.
- Discuss: "Where did it flow naturally? Where did you have to fight it?"
- Note issues_after_ai that surfaced during the exercise.

If time remains, repeat with a second task.

**1:15–1:30 — Wrap-Up**

Talking points:
- "Today you completed [task] in [X minutes]. Before AI, that takes you [Y minutes]. That's [Z minutes] saved every time you do this."
- "The Skills file is always there — you don't need to set it up each time. From tomorrow, try using Claude with the Skills file for [task] every time it comes up."
- "Next session we'll connect Claude directly to your software — [name their tools]. That's where things get really powerful."

Assign homework: Complete the same task using Claude + Skills file twice before next session. Note the time each attempt takes.

### Common Questions — Session 2

| Question | Suggested Answer |
|----------|-----------------|
| "The Skills file doesn't match how I do things exactly." | "Let's fix it now. Tell me exactly what's different and I'll update the Skills file. This is customised to you — if it's not right, we change it." |
| "The output is good but I still have to edit it a lot." | "That's normal at this stage. Two things will improve it: first, your prompts will get better with practice. Second, we'll refine the Skills file based on exactly what edits you're making. Over time, the editing gets minimal." |
| "Can I mess anything up by using this?" | "No. Claude doesn't change your files or send anything unless you tell it to. Everything it produces is a suggestion that you review before using. Think of it as a draft that you approve." |
| "What if I forget the techniques?" | "You don't need to memorise anything. The Skills file handles most of the complexity. Your job is to describe what you need clearly — and that's just explaining your work in your own words." |

### Handling Resistance — Session 2

**"It takes longer with Claude than doing it myself":**
- This is common in early sessions. Say: "Right now, yes — because you're learning a new workflow. It's like learning a new software system. The first week is slower. But look at the numbers: once you're comfortable, this task goes from [X minutes] to [Y minutes]. The investment is in the learning curve."

**"The Skills file makes mistakes specific to our company":**
- Don't dismiss this. Say: "That's exactly the kind of feedback I need. Let's look at the specific error and update the Skills file right now." Fix it live. This shows the system is responsive to their input and builds ownership.

**Contact is doing well but won't commit to using it daily:**
- Say: "I'm not asking you to change everything at once. Pick one task — the one you liked most today — and use Claude for just that task this week. If it saves you time, you'll naturally want to try it with others."

---

## Session 3 — MCP Connections & Automation: Facilitator Guide

### Timed Agenda (1.5 hours)

**0:00–0:10 — Review: Progress Since Last Session**

Talking points:
- "How did the homework go? Did you use Claude + Skills file for [task] this week?"
- Discuss time savings: "Was it faster the second time? The third?"
- Review any issues they encountered. Quick troubleshoot if needed.

**0:10–0:25 — MCP Introduction**

Talking points:
- "Up to now, you've been copying information into Claude and getting results back. MCP connections change that — Claude can now reach directly into your software to read data and take actions."
- "Think of it like this: before, you were the messenger between Claude and your tools. Now they talk to each other directly, with you in control."
- Show a diagram or explain simply: "Claude → MCP → [their specific software]. Claude can pull your project data, read your documents, or query your system without you having to copy-paste."
- List the specific MCPs that have been built for their engagement and what each one connects to.

Important: If no MCPs are deployed for this client (check the mcps table), skip MCP hands-on and instead focus on automation planning and advanced Skills file usage. Adjust the agenda accordingly and note this in the lesson plan.

**0:25–0:45 — Guided MCP Demonstration**

Pick the MCP connection most relevant to this person's highest-impact task.

Exercise — "Watch, Then Drive" (20 minutes):
- Part 1 (10 min): Trainer demonstrates the MCP connection live. Walk through the entire workflow: prompt Claude, Claude queries their system via MCP, data comes back, Claude processes it, output is produced.
- Narrate every step: "Claude is now connecting to [software]. It's pulling [data type]. Now it's processing that data using the instructions in your Skills file. Here's the result."
- Part 2 (10 min): Contact does the exact same thing. Trainer watches. Coach only if they're stuck.

Talking points during demo:
- "Notice I didn't have to open [software], find the data, copy it, paste it, and then ask Claude to process it. All of that happened in one step."
- "This is where the real time savings come from. The manual back-and-forth between tools is what eats up your day."

**0:45–1:15 — Hands-On MCP Practice**

Exercise — "MCP Workflow Challenge" (30 minutes):
- Give them 2-3 tasks that use MCP connections:
  - Task 1: Repeat the demonstrated workflow independently, but with different data (different project, different date range, etc.)
  - Task 2: A different task that uses the same MCP connection in a different way
  - Task 3: A task that chains the MCP with the Skills file — pull data via MCP, then process it using the Skills file

For each task, time them. Record the time. Compare to their non-AI workflow.

After each task, ask:
- "What did Claude get right?"
- "What would you have done differently?"
- "Can you think of other times you'd use this exact workflow?"

**1:15–1:30 — Automation Opportunities & Wrap-Up**

Exercise — "What Else?" (10 minutes):
- Ask: "Now that you've seen how Claude can connect to your tools, what other parts of your job involve pulling data from one system and doing something with it in another?"
- Map their answers to potential MCP connections or Skills file enhancements. Note these as potential expansion opportunities.

Talking points:
- "Next session is our final training session. We'll review everything, look at your time savings data, and make sure you can use all of this independently."
- "Between now and then, I want you to use Claude + MCP for [specific task] every time it comes up. The more you use it, the more natural it becomes."

Assign homework: Complete at least 3 MCP-assisted tasks before the next session. Note the time for each.

### Common Questions — Session 3

| Question | Suggested Answer |
|----------|-----------------|
| "Can Claude change data in our system through MCP?" | "It depends on how we've configured it. For most connections, Claude can only read data — it can't modify or delete anything. If we've enabled write access, it will always ask for your confirmation before making changes. You're always in control." |
| "What if the MCP connection goes down?" | "You can always do the task the normal way — nothing about your existing workflow has changed. The MCP is an addition, not a replacement. If there's an issue, raise a support ticket and I'll fix it." |
| "This seems complicated." | "The first time, yes. But notice you're already doing it — you just completed [task] in [X minutes] using MCP. Next time will be faster. By the third time, it'll feel routine." |
| "Can we connect to [software they use that doesn't have an MCP yet]?" | "Possibly. Let me look into what's available for [software]. If there's a standard connector we can use it. If not, we can build a custom one. I'll include this in my notes for after the training programme." |

### Handling Resistance — Session 3

**"I don't trust the data Claude is pulling":**
- This is a legitimate concern. Say: "Let's verify together. Pull the same data manually from [software] and compare it to what Claude got via MCP. If they match, you can trust the connection. If they don't, we need to fix the MCP." Always verify in the first session — trust is built through evidence.

**"I prefer doing it manually — it's faster for me":**
- Don't argue. Say: "Let's measure it. Do the task your way, I'll time it. Then do it with MCP, I'll time it. If your way is genuinely faster, that's fine — we'll focus MCP on tasks where it makes a bigger difference." Often the manual way feels faster because it's familiar, but the timer tells the real story.

**Contact is engaged but worried about becoming dependent on the tool:**
- Say: "Your knowledge and judgment haven't changed. Claude and the MCPs are handling the mechanical parts — copying data, formatting reports, pulling numbers. If they disappeared tomorrow, you'd still know how to do your job. It would just take longer."

---

## Session 4 — Review, ROI & Handover: Facilitator Guide

### Timed Agenda (1.5 hours)

**0:00–0:15 — Progress Review**

Talking points:
- "Let's look at how far you've come." Walk through each contact_task and its current state:
  - Time before AI vs time after AI
  - Minutes saved per instance
  - Estimated monthly hours saved
- Use real numbers from the database. Show them the data, not just tell them.
- Highlight their biggest win: "Your [task] went from [X minutes] to [Y minutes]. That's [Z]% faster. Over a month, that's [N hours] you're getting back."

Exercise — "Your Progress Card" (5 minutes):
- Present a simple summary card for each task with before/after data. Ask them: "Does this match your experience? Is there anything we should adjust?"

**0:15–0:30 — Address Remaining Struggles**

Talking points:
- Review any tasks where time_after_ai is still high or where previous session notes flagged issues.
- For each struggling area, diagnose the root cause:
  - Prompt quality issue → refine the prompt together
  - Skills file gap → update the Skills file live
  - MCP limitation → note for post-training fix
  - Confidence issue → run through the task one more time with guidance
- "My goal today is to make sure you're completely comfortable doing this on your own. If anything still feels uncertain, now is the time to ask."

**0:30–0:45 — Independence Check**

Exercise — "Solo Run" (15 minutes):
- Pick their most complex task — the one that uses Skills file + MCP connection.
- Contact completes the entire task independently. Trainer does NOT help. Trainer observes and takes notes.
- After completion: "You just did that entirely on your own. That's the goal — this is how it works from here on."

Check that they can:
- Open Claude and access their workspace
- Find and activate their Skills files
- Use MCP connections without guidance
- Iterate on prompts when the first output isn't right
- Know when to trust the output and when to verify

**0:45–1:05 — ROI Discussion**

Talking points:
- Present the full time savings picture across all their tasks.
- "Across your core tasks, you're saving approximately [total minutes] per [week/month]. At your role's hourly rate, that's roughly $[amount] in value recovered."
- "This isn't just about speed — it's also about consistency. The AI-assisted version of these tasks produces more consistent output with fewer errors."
- Explain how measurement continues: "Going forward, your AI usage will be tracked — token usage per month — and we'll compare your time savings month over month. You'll see this in the monthly report your [exec/manager] receives."

Exercise — "What's Next?" (5 minutes):
- Ask: "Now that you've used Claude for [X weeks], what other tasks have you thought about automating? Is there anything you do regularly that we haven't covered?"
- Note any new tasks they identify for potential expansion.

**1:05–1:20 — Ongoing Support**

Talking points:
- "Training is complete, but support continues. Here's how it works going forward:"
- Explain the support process: "If you get stuck, hit a problem, or want to try something new with Claude, you can submit a support ticket through the dashboard. I'll respond within [support terms timeframe]."
- "Your Skills files and MCP connections will be maintained. If your workflows change or your software updates, we'll adjust them."
- "There may be additional training sessions if your team wants to go deeper on specific topics. That's part of the ongoing engagement."

**1:20–1:30 — Wrap-Up & Feedback**

Talking points:
- "What was the most useful thing you learned across all four sessions?"
- "What would you change about the training?"
- "Any final questions before we transition to the supported usage phase?"
- "From here on, the best way to get better is to keep using it. The more you use Claude for your daily tasks, the more natural it becomes and the more time you'll save."

### Common Questions — Session 4

| Question | Suggested Answer |
|----------|-----------------|
| "What happens if I don't use Claude for a while and forget how?" | "The Skills files remember everything. Your prompts and workflows are saved. If you come back after a break, it's like riding a bike — the first attempt might be a bit rusty, but it comes back quickly. And you can always submit a support ticket if you need a refresher." |
| "Will my usage be monitored?" | "Your token usage is tracked at a company level for monthly reporting — this helps show the value of the programme. It's not about policing usage; it's about demonstrating ROI to the people who approved the investment." |
| "What if Claude changes or gets updated?" | "AI tools do evolve. If there are significant changes that affect your workflow, I'll update the Skills files and MCP connections to match. You'll be notified of anything you need to do differently." |
| "Can I share my prompts with colleagues?" | "Absolutely. If a prompt works well for you, share it. That's how teams get the most value — when good practices spread organically." |

### Handling Resistance — Session 4

**Contact has low usage between sessions:**
- Don't guilt them. Say: "I noticed you haven't used Claude much this past week. Was there a specific barrier — time, confidence, the tasks didn't come up? Let's figure out what would make it easier to fit into your day." Identify the specific blocker and address it.

**Contact still prefers manual methods for certain tasks:**
- Accept it. Say: "Not every task needs AI. If [task] is genuinely faster or better for you manually, that's fine. The goal isn't 100% AI adoption — it's saving time where it makes sense." Focus your final session time on the tasks where AI clearly helps.

**Contact is enthusiastic but wants to expand beyond scope:**
- Channel the enthusiasm constructively. Say: "That's great that you're thinking about new applications. Let me note these down — [list their ideas]. Some of these we can address through the ongoing support engagement, others might need new Skills files or MCP connections. I'll include them in my recommendations."

---

## Task-Specific Practice Activities

For every session, include task-specific practice activities. For each contact_task that will be covered, provide:

- **Task name** — from the database
- **Current workflow** — what they do now (software, steps, time)
- **AI-assisted workflow** — what it looks like with Claude (prompt approach, Skills file, MCP if applicable)
- **Starter prompt** — a ready-to-use prompt they can customise. Tailor this to their specific task, using their terminology and tools.
- **What success looks like** — how they know the output is good enough to use
- **Estimated time with AI** — target time for this task with Claude

Prioritise tasks by:
1. Biggest time savings potential (highest time_before_ai)
2. Tasks they've shown interest in (from survey or previous sessions)
3. Tasks that build on what was covered in previous sessions

---

## Post-Session Actions (for the trainer)

After every session:
- Update the `training_log` entry with session notes using `update_training_log_entry`
- Update `contact_tasks` with any new time_after_ai measurements using `update_contact_task`
- Note any new issues_after_ai discovered during practice
- Record follow-ups needed for next session in session_notes
- If new automation opportunities were identified, note them for capacity planning

### 4. Save to database

After generating the lesson plan:

- Check if a `training_log` entry already exists for this contact and session number. If not, use `create_training_log_entry` with the engagement_id, contact_id, session_number, title, scheduled_date, status: `scheduled`
- If it already exists, no database action needed at this stage. The entry gets updated after delivery (Step 17).

## Output Format

Present the lesson plan as a clean, structured document with all sections above. Use the contact's name and real task names throughout. Every practice activity should reference their actual work, not generic examples. The talking points should be ready to use as-is — the trainer should be able to read them during the session.

## Important Notes

- Always use real data from the database. Never invent tasks or software.
- If this is Session 2, 3, or 4 and there are no previous training_log entries, flag this — previous session data is missing and the plan may not account for their actual progress.
- If survey data is missing, flag it and note that the plan is based on contact_tasks only, without self-reported AI experience or attitudes.
- Adjust complexity based on digital maturity from the audit. Low digital maturity = more time on basics, simpler practice tasks, more guided exercises. High digital maturity = move faster, more independence, more advanced exercises.
- If previous session notes flag the contact as sceptical or resistant, include extra resistance handling notes and front-load demonstrations of value before asking them to practise independently.
- Session 3 can only include MCP practice if MCPs have actually been built and deployed for this client. Check the mcps table via MCP. If no MCPs are deployed, Session 3 focuses on automation planning and advanced Skills file usage instead.
- The talking points are templates — personalise them with the contact's name, their specific tasks, and their actual software. Generic examples reduce impact.
- Timing is flexible. If the contact is engaged and making progress on a task, extend the practice time and shorten the wrap-up. If they're struggling, spend more time on guided practice and cut independent practice short.
