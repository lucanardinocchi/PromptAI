import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { LinearClient } from "@linear/sdk";
import "dotenv/config";

// ============================================================
// Linear client
// ============================================================

const apiKey = process.env.LINEAR_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing LINEAR_API_KEY environment variable. " +
      "Copy .env.example to .env and fill in your Linear API key."
  );
}

const linear = new LinearClient({ apiKey });

// ============================================================
// Validation helpers
// ============================================================

function requireString(args: Record<string, unknown>, key: string): string {
  const val = args[key];
  if (typeof val !== "string" || val.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }
  return val.trim();
}

function optionalString(args: Record<string, unknown>, key: string): string | undefined {
  const val = args[key];
  if (val === undefined || val === null) return undefined;
  if (typeof val !== "string") throw new Error(`${key} must be a string`);
  return val.trim() || undefined;
}

function optionalNumber(args: Record<string, unknown>, key: string): number | undefined {
  const val = args[key];
  if (val === undefined || val === null) return undefined;
  if (typeof val !== "number") throw new Error(`${key} must be a number`);
  return val;
}

function ok(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function err(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true as const };
}

// ============================================================
// Tool definitions
// ============================================================

const tools: Tool[] = [
  {
    name: "create_issue",
    description: "Create a new Linear issue / task",
    inputSchema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Issue title" },
        description: { type: "string", description: "Issue description (markdown supported)" },
        team_id: { type: "string", description: "Team ID to create the issue in (use list_projects to find team IDs)" },
        project_id: { type: "string", description: "Project ID to assign the issue to (optional)" },
        assignee_id: { type: "string", description: "User ID to assign the issue to (optional)" },
        priority: {
          type: "integer",
          description: "Priority: 0 = no priority, 1 = urgent, 2 = high, 3 = medium, 4 = low",
          enum: [0, 1, 2, 3, 4],
        },
        label_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of label IDs to apply (optional)",
        },
      },
      required: ["title", "team_id"],
    },
  },
  {
    name: "list_issues",
    description: "List and search Linear issues with optional filters",
    inputSchema: {
      type: "object" as const,
      properties: {
        team_id: { type: "string", description: "Filter by team ID" },
        project_id: { type: "string", description: "Filter by project ID" },
        assignee_id: { type: "string", description: "Filter by assignee user ID" },
        status: { type: "string", description: "Filter by status name (e.g. 'Todo', 'In Progress', 'Done')" },
        search: { type: "string", description: "Search issues by title or description text" },
        limit: { type: "integer", description: "Max results to return (default 20, max 50)" },
      },
    },
  },
  {
    name: "update_issue",
    description: "Update an existing Linear issue — change status, assignee, priority, or other fields",
    inputSchema: {
      type: "object" as const,
      properties: {
        issue_id: { type: "string", description: "Issue ID to update" },
        title: { type: "string", description: "New title (optional)" },
        description: { type: "string", description: "New description (optional)" },
        status: { type: "string", description: "New status name (e.g. 'Todo', 'In Progress', 'Done')" },
        assignee_id: { type: "string", description: "New assignee user ID (optional)" },
        priority: {
          type: "integer",
          description: "New priority: 0 = no priority, 1 = urgent, 2 = high, 3 = medium, 4 = low",
          enum: [0, 1, 2, 3, 4],
        },
        project_id: { type: "string", description: "Move to a different project (optional)" },
        label_ids: {
          type: "array",
          items: { type: "string" },
          description: "Replace labels with these label IDs (optional)",
        },
      },
      required: ["issue_id"],
    },
  },
  {
    name: "list_projects",
    description: "List Linear projects (also returns team info needed for creating issues)",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "integer", description: "Max results to return (default 20, max 50)" },
      },
    },
  },
];

// ============================================================
// Tool handlers
// ============================================================

async function handleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ReturnType<typeof ok>> {
  switch (name) {
    // ----------------------------------------------------------
    // CREATE ISSUE
    // ----------------------------------------------------------
    case "create_issue": {
      const title = requireString(args, "title");
      const teamId = requireString(args, "team_id");
      const description = optionalString(args, "description");
      const projectId = optionalString(args, "project_id");
      const assigneeId = optionalString(args, "assignee_id");
      const priority = optionalNumber(args, "priority");
      const labelIds = args.label_ids as string[] | undefined;

      const input: Record<string, unknown> = { title, teamId };
      if (description) input.description = description;
      if (projectId) input.projectId = projectId;
      if (assigneeId) input.assigneeId = assigneeId;
      if (priority !== undefined) input.priority = priority;
      if (labelIds && Array.isArray(labelIds)) input.labelIds = labelIds;

      const payload = await linear.createIssue(input as Parameters<typeof linear.createIssue>[0]);

      if (!payload.success) {
        return err("Failed to create issue");
      }

      const issue = await payload.issue;
      if (!issue) return err("Issue created but could not be retrieved");

      const state = await issue.state;
      const assignee = await issue.assignee;
      const team = await issue.team;

      return ok(JSON.stringify({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description,
        status: state?.name,
        priority: issue.priority,
        assignee: assignee?.name ?? null,
        team: team?.name,
        url: issue.url,
        created: issue.createdAt,
      }, null, 2));
    }

    // ----------------------------------------------------------
    // LIST ISSUES
    // ----------------------------------------------------------
    case "list_issues": {
      const teamId = optionalString(args, "team_id");
      const projectId = optionalString(args, "project_id");
      const assigneeId = optionalString(args, "assignee_id");
      const status = optionalString(args, "status");
      const search = optionalString(args, "search");
      const limit = Math.min(Math.max(optionalNumber(args, "limit") ?? 20, 1), 50);

      // Build filter object
      const filter: Record<string, unknown> = {};
      if (teamId) filter.team = { id: { eq: teamId } };
      if (projectId) filter.project = { id: { eq: projectId } };
      if (assigneeId) filter.assignee = { id: { eq: assigneeId } };
      if (status) filter.state = { name: { eq: status } };
      if (search) filter.or = [
        { title: { containsIgnoreCase: search } },
        { description: { containsIgnoreCase: search } },
      ];

      const issues = await linear.issues({
        first: limit,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      const results = await Promise.all(
        issues.nodes.map(async (issue) => {
          const state = await issue.state;
          const assignee = await issue.assignee;
          const team = await issue.team;
          return {
            id: issue.id,
            identifier: issue.identifier,
            title: issue.title,
            status: state?.name,
            priority: issue.priority,
            assignee: assignee?.name ?? null,
            team: team?.name,
            url: issue.url,
            created: issue.createdAt,
            updated: issue.updatedAt,
          };
        })
      );

      return ok(JSON.stringify({ count: results.length, issues: results }, null, 2));
    }

    // ----------------------------------------------------------
    // UPDATE ISSUE
    // ----------------------------------------------------------
    case "update_issue": {
      const issueId = requireString(args, "issue_id");
      const title = optionalString(args, "title");
      const description = optionalString(args, "description");
      const status = optionalString(args, "status");
      const assigneeId = optionalString(args, "assignee_id");
      const priority = optionalNumber(args, "priority");
      const projectId = optionalString(args, "project_id");
      const labelIds = args.label_ids as string[] | undefined;

      const input: Record<string, unknown> = {};
      if (title) input.title = title;
      if (description) input.description = description;
      if (assigneeId) input.assigneeId = assigneeId;
      if (priority !== undefined) input.priority = priority;
      if (projectId) input.projectId = projectId;
      if (labelIds && Array.isArray(labelIds)) input.labelIds = labelIds;

      // Resolve status name to state ID
      if (status) {
        const issue = await linear.issue(issueId);
        const team = await issue.team;
        if (team) {
          const states = await team.states();
          const match = states.nodes.find(
            (s) => s.name.toLowerCase() === status.toLowerCase()
          );
          if (match) {
            input.stateId = match.id;
          } else {
            const available = states.nodes.map((s) => s.name).join(", ");
            return err(`Status "${status}" not found. Available: ${available}`);
          }
        }
      }

      if (Object.keys(input).length === 0) {
        return err("No fields to update");
      }

      const payload = await linear.updateIssue(
        issueId,
        input as Parameters<typeof linear.updateIssue>[1]
      );

      if (!payload.success) {
        return err("Failed to update issue");
      }

      const issue = await payload.issue;
      if (!issue) return err("Issue updated but could not be retrieved");

      const state = await issue.state;
      const assignee = await issue.assignee;

      return ok(JSON.stringify({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        status: state?.name,
        priority: issue.priority,
        assignee: assignee?.name ?? null,
        url: issue.url,
        updated: issue.updatedAt,
      }, null, 2));
    }

    // ----------------------------------------------------------
    // LIST PROJECTS
    // ----------------------------------------------------------
    case "list_projects": {
      const limit = Math.min(Math.max(optionalNumber(args, "limit") ?? 20, 1), 50);

      const projects = await linear.projects({ first: limit });

      // Also fetch teams for reference
      const teams = await linear.teams();

      const projectResults = await Promise.all(
        projects.nodes.map(async (project) => {
          const lead = await project.lead;
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            state: project.state,
            lead: lead?.name ?? null,
            url: project.url,
            created: project.createdAt,
          };
        })
      );

      const teamResults = teams.nodes.map((team) => ({
        id: team.id,
        name: team.name,
        key: team.key,
      }));

      return ok(JSON.stringify({
        teams: teamResults,
        projects: { count: projectResults.length, items: projectResults },
      }, null, 2));
    }

    default:
      return err(`Unknown tool: ${name}`);
  }
}

// ============================================================
// Server setup
// ============================================================

const server = new Server(
  { name: "promptai-linear", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  try {
    return await handleTool(name, args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return err(message);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptAI Linear MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
