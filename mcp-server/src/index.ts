import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { supabase } from "./client.js";
import { tables, type TableSchema, type Field, type FieldType } from "./schema.js";

// ============================================================
// Validation helpers
// ============================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

function validateValue(value: unknown, field: Field): string | null {
  if (value === null || value === undefined) return null;

  switch (field.type) {
    case "uuid":
      if (typeof value !== "string" || !UUID_RE.test(value))
        return `${field.name} must be a valid UUID`;
      break;
    case "string":
      if (typeof value !== "string")
        return `${field.name} must be a string`;
      if (field.enum && !field.enum.includes(value))
        return `${field.name} must be one of: ${field.enum.join(", ")}`;
      break;
    case "number":
      if (typeof value !== "number")
        return `${field.name} must be a number`;
      break;
    case "integer":
      if (typeof value !== "number" || !Number.isInteger(value))
        return `${field.name} must be an integer`;
      break;
    case "boolean":
      if (typeof value !== "boolean")
        return `${field.name} must be a boolean`;
      break;
    case "date":
      if (typeof value !== "string" || !DATE_RE.test(value))
        return `${field.name} must be a date in YYYY-MM-DD format`;
      break;
    case "timestamp":
      if (typeof value !== "string" || !TIMESTAMP_RE.test(value))
        return `${field.name} must be a valid timestamp`;
      break;
    case "string_array":
      if (!Array.isArray(value) || !value.every((v) => typeof v === "string"))
        return `${field.name} must be an array of strings`;
      break;
    case "json":
      if (typeof value !== "object")
        return `${field.name} must be a JSON object or array`;
      break;
  }
  return null;
}

/** Validate and sanitise input — only allows declared fields through. */
function validateInput(
  args: Record<string, unknown>,
  schema: TableSchema,
  requireRequired: boolean
): { data: Record<string, unknown> | null; error: string | null } {
  const data: Record<string, unknown> = {};
  const fieldMap = new Map(schema.fields.map((f) => [f.name, f]));

  // Check required fields
  if (requireRequired) {
    for (const field of schema.fields) {
      if (field.required && (args[field.name] === undefined || args[field.name] === null)) {
        return { data: null, error: `Missing required field: ${field.name}` };
      }
    }
  }

  // Validate and copy only known fields (strips anything unexpected)
  for (const [key, value] of Object.entries(args)) {
    if (key === "id" || key === "limit" || key === "offset" || key === "order_by" || key === "search") continue;
    const field = fieldMap.get(key);
    if (!field) continue; // silently ignore unknown fields
    if (value === undefined || value === null) continue;

    const err = validateValue(value, field);
    if (err) return { data: null, error: err };
    data[key] = value;
  }

  return { data, error: null };
}

// ============================================================
// JSON Schema generation from field definitions
// ============================================================

function fieldToJsonSchema(field: Field): object {
  const base: Record<string, unknown> = { description: field.description };

  const typeMap: Record<FieldType, () => object> = {
    string: () => ({ type: "string" }),
    number: () => ({ type: "number" }),
    integer: () => ({ type: "integer" }),
    boolean: () => ({ type: "boolean" }),
    uuid: () => ({ type: "string", format: "uuid" }),
    date: () => ({ type: "string", format: "date", description: field.description + " (YYYY-MM-DD)" }),
    timestamp: () => ({ type: "string", format: "date-time" }),
    string_array: () => ({ type: "array", items: { type: "string" } }),
    json: () => ({}), // accepts any type
  };

  Object.assign(base, typeMap[field.type]());
  if (field.enum) base.enum = field.enum;
  return base;
}

// ============================================================
// Tool generation
// ============================================================

interface ToolMapping {
  table: TableSchema;
  operation: "create" | "list" | "update" | "delete";
}

const toolMap = new Map<string, ToolMapping>();
const allTools: Tool[] = [];

for (const table of tables) {
  const { singular, plural, tableName, description, fields } = table;

  // --- CREATE ---
  const createName = `create_${singular}`;
  const createProps: Record<string, object> = {};
  const createRequired: string[] = [];

  for (const f of fields) {
    createProps[f.name] = fieldToJsonSchema(f);
    if (f.required) createRequired.push(f.name);
  }

  allTools.push({
    name: createName,
    description: `Create a new ${singular} — ${description}`,
    inputSchema: {
      type: "object" as const,
      properties: createProps,
      required: createRequired.length > 0 ? createRequired : undefined,
    },
  });
  toolMap.set(createName, { table, operation: "create" });

  // --- LIST ---
  const listName = `list_${plural}`;
  const listProps: Record<string, object> = {
    limit: { type: "integer", description: "Max records to return (default 50, max 200)" },
    offset: { type: "integer", description: "Number of records to skip (for pagination)" },
    order_by: { type: "string", description: "Column to sort by (prefix with - for descending, e.g. '-created_at')" },
  };

  // Add filterable fields — all uuid, string (with enums), and boolean fields
  for (const f of fields) {
    if (f.type === "uuid" || f.type === "boolean" || f.enum) {
      listProps[f.name] = fieldToJsonSchema(f);
    }
  }

  // Add name/search for tables that have a name field
  if (fields.some((f) => f.name === "name")) {
    listProps.search = { type: "string", description: "Case-insensitive search on name field" };
  }

  allTools.push({
    name: listName,
    description: `List ${plural} with optional filters — ${description}`,
    inputSchema: { type: "object" as const, properties: listProps },
  });
  toolMap.set(listName, { table, operation: "list" });

  // --- UPDATE ---
  const updateName = `update_${singular}`;
  const updateProps: Record<string, object> = {
    id: { type: "string", format: "uuid", description: `ID of the ${singular} to update` },
  };

  for (const f of fields) {
    updateProps[f.name] = fieldToJsonSchema(f);
  }

  allTools.push({
    name: updateName,
    description: `Update an existing ${singular} by ID`,
    inputSchema: {
      type: "object" as const,
      properties: updateProps,
      required: ["id"],
    },
  });
  toolMap.set(updateName, { table, operation: "update" });

  // --- DELETE ---
  const deleteName = `delete_${singular}`;
  allTools.push({
    name: deleteName,
    description: `Delete a ${singular} by ID`,
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", format: "uuid", description: `ID of the ${singular} to delete` },
      },
      required: ["id"],
    },
  });
  toolMap.set(deleteName, { table, operation: "delete" });
}

// ============================================================
// Request handlers
// ============================================================

const server = new Server(
  { name: "promptai-ims", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  const mapping = toolMap.get(name);
  if (!mapping) {
    return {
      content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const { table, operation } = mapping;

  try {
    switch (operation) {
      // ----------------------------------------------------------
      // CREATE
      // ----------------------------------------------------------
      case "create": {
        const { data: validated, error: valErr } = validateInput(args, table, true);
        if (valErr) return { content: [{ type: "text" as const, text: `Validation error: ${valErr}` }], isError: true };

        const { data, error } = await supabase
          .from(table.tableName)
          .insert(validated!)
          .select()
          .single();

        if (error) {
          return { content: [{ type: "text" as const, text: `Database error: ${error.message}` }], isError: true };
        }
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      // ----------------------------------------------------------
      // LIST
      // ----------------------------------------------------------
      case "list": {
        const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 200);
        const offset = Math.max(Number(args.offset) || 0, 0);

        let query = supabase.from(table.tableName).select("*");

        // Apply filters — only on fields defined in the schema
        const fieldMap = new Map(table.fields.map((f) => [f.name, f]));
        for (const [key, value] of Object.entries(args)) {
          if (["limit", "offset", "order_by", "search"].includes(key)) continue;
          const field = fieldMap.get(key);
          if (!field) continue;
          if (value === undefined || value === null) continue;

          const valErr = validateValue(value, field);
          if (valErr) return { content: [{ type: "text" as const, text: `Filter error: ${valErr}` }], isError: true };

          query = query.eq(key, value);
        }

        // Search by name (case-insensitive partial match)
        if (typeof args.search === "string" && args.search.length > 0) {
          query = query.ilike("name", `%${args.search}%`);
        }

        // Ordering
        if (typeof args.order_by === "string" && args.order_by.length > 0) {
          const desc = args.order_by.startsWith("-");
          const col = desc ? args.order_by.slice(1) : args.order_by;
          query = query.order(col, { ascending: !desc });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error, count } = await query.range(offset, offset + limit - 1);

        if (error) {
          return { content: [{ type: "text" as const, text: `Database error: ${error.message}` }], isError: true };
        }
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ count: data?.length ?? 0, offset, limit, data }, null, 2),
          }],
        };
      }

      // ----------------------------------------------------------
      // UPDATE
      // ----------------------------------------------------------
      case "update": {
        const id = args.id;
        if (typeof id !== "string" || !UUID_RE.test(id)) {
          return { content: [{ type: "text" as const, text: "Validation error: id must be a valid UUID" }], isError: true };
        }

        const { data: validated, error: valErr } = validateInput(args, table, false);
        if (valErr) return { content: [{ type: "text" as const, text: `Validation error: ${valErr}` }], isError: true };

        if (!validated || Object.keys(validated).length === 0) {
          return { content: [{ type: "text" as const, text: "No fields to update" }], isError: true };
        }

        const { data, error } = await supabase
          .from(table.tableName)
          .update(validated)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { content: [{ type: "text" as const, text: `Database error: ${error.message}` }], isError: true };
        }
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      }

      // ----------------------------------------------------------
      // DELETE
      // ----------------------------------------------------------
      case "delete": {
        const id = args.id;
        if (typeof id !== "string" || !UUID_RE.test(id)) {
          return { content: [{ type: "text" as const, text: "Validation error: id must be a valid UUID" }], isError: true };
        }

        const { error } = await supabase
          .from(table.tableName)
          .delete()
          .eq("id", id);

        if (error) {
          return { content: [{ type: "text" as const, text: `Database error: ${error.message}` }], isError: true };
        }
        return { content: [{ type: "text" as const, text: `Deleted ${table.singular} ${id}` }] };
      }

      default:
        return { content: [{ type: "text" as const, text: `Unknown operation: ${operation}` }], isError: true };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { content: [{ type: "text" as const, text: `Server error: ${message}` }], isError: true };
  }
});

// ============================================================
// Start
// ============================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptAI IMS MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
