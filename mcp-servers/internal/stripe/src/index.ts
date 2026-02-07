import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import Stripe from "stripe";
import "dotenv/config";

// ============================================================
// Stripe client
// ============================================================

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error(
    "Missing STRIPE_SECRET_KEY environment variable. " +
      "Copy .env.example to .env and fill in your Stripe secret key."
  );
}

const stripe = new Stripe(stripeKey);

// ============================================================
// Validation helpers
// ============================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    name: "create_customer",
    description: "Create a new Stripe customer from a company name and email",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Customer / company name" },
        email: { type: "string", description: "Primary email address" },
        phone: { type: "string", description: "Phone number (optional)" },
        metadata: { type: "object", description: "Optional key-value metadata (e.g. company_id from IMS)" },
      },
      required: ["name", "email"],
    },
  },
  {
    name: "list_customers",
    description: "Search Stripe customers by email or name",
    inputSchema: {
      type: "object" as const,
      properties: {
        email: { type: "string", description: "Filter by exact email address" },
        search: { type: "string", description: "Search by name or email (partial match)" },
        limit: { type: "integer", description: "Max results to return (default 10, max 100)" },
      },
    },
  },
  {
    name: "create_invoice",
    description: "Create a draft invoice for a customer with line items",
    inputSchema: {
      type: "object" as const,
      properties: {
        customer_id: { type: "string", description: "Stripe customer ID (e.g. cus_xxx)" },
        items: {
          type: "array",
          description: "Line items — each with description and amount_aud (in dollars, e.g. 5000 for $5,000)",
          items: {
            type: "object",
            properties: {
              description: { type: "string", description: "Line item description" },
              amount_aud: { type: "number", description: "Amount in AUD dollars (e.g. 5000 for $5,000)" },
            },
            required: ["description", "amount_aud"],
          },
        },
        due_days: { type: "integer", description: "Days until due (default 14)" },
        memo: { type: "string", description: "Optional memo / note on the invoice" },
      },
      required: ["customer_id", "items"],
    },
  },
  {
    name: "list_invoices",
    description: "List Stripe invoices, filterable by customer and status",
    inputSchema: {
      type: "object" as const,
      properties: {
        customer_id: { type: "string", description: "Filter by Stripe customer ID" },
        status: {
          type: "string",
          description: "Filter by invoice status",
          enum: ["draft", "open", "paid", "void", "uncollectible"],
        },
        limit: { type: "integer", description: "Max results to return (default 10, max 100)" },
      },
    },
  },
  {
    name: "send_invoice",
    description: "Finalise and send a draft invoice to the customer",
    inputSchema: {
      type: "object" as const,
      properties: {
        invoice_id: { type: "string", description: "Stripe invoice ID (e.g. in_xxx)" },
      },
      required: ["invoice_id"],
    },
  },
  {
    name: "check_payment_status",
    description: "Check the payment status of a specific invoice",
    inputSchema: {
      type: "object" as const,
      properties: {
        invoice_id: { type: "string", description: "Stripe invoice ID (e.g. in_xxx)" },
      },
      required: ["invoice_id"],
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
    // CREATE CUSTOMER
    // ----------------------------------------------------------
    case "create_customer": {
      const customerName = requireString(args, "name");
      const email = requireString(args, "email");

      if (!EMAIL_RE.test(email)) return err("Invalid email address format");

      const phone = optionalString(args, "phone");
      const metadata = (args.metadata as Record<string, string>) ?? {};

      const customer = await stripe.customers.create({
        name: customerName,
        email,
        phone: phone ?? undefined,
        metadata,
      });

      return ok(JSON.stringify({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        created: new Date(customer.created * 1000).toISOString(),
      }, null, 2));
    }

    // ----------------------------------------------------------
    // LIST CUSTOMERS
    // ----------------------------------------------------------
    case "list_customers": {
      const email = optionalString(args, "email");
      const search = optionalString(args, "search");
      const limit = Math.min(Math.max(optionalNumber(args, "limit") ?? 10, 1), 100);

      let customers;

      if (search) {
        const result = await stripe.customers.search({
          query: `name~"${search}" OR email~"${search}"`,
          limit,
        });
        customers = result.data;
      } else if (email) {
        const result = await stripe.customers.list({ email, limit });
        customers = result.data;
      } else {
        const result = await stripe.customers.list({ limit });
        customers = result.data;
      }

      const summary = customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        created: new Date(c.created * 1000).toISOString(),
      }));

      return ok(JSON.stringify({ count: summary.length, customers: summary }, null, 2));
    }

    // ----------------------------------------------------------
    // CREATE INVOICE
    // ----------------------------------------------------------
    case "create_invoice": {
      const customerId = requireString(args, "customer_id");
      const items = args.items;
      const dueDays = optionalNumber(args, "due_days") ?? 14;
      const memo = optionalString(args, "memo");

      if (!Array.isArray(items) || items.length === 0) {
        return err("items must be a non-empty array of line items");
      }

      // Validate line items
      for (const item of items) {
        if (typeof item !== "object" || item === null) return err("Each item must be an object");
        const i = item as Record<string, unknown>;
        if (typeof i.description !== "string" || !i.description) return err("Each item needs a description");
        if (typeof i.amount_aud !== "number" || i.amount_aud <= 0) return err("Each item needs a positive amount_aud");
      }

      // Create the invoice
      const dueDate = Math.floor(Date.now() / 1000) + dueDays * 86400;

      const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: "send_invoice",
        due_date: dueDate,
        currency: "aud",
        description: memo ?? undefined,
      });

      // Add line items
      for (const item of items) {
        const i = item as { description: string; amount_aud: number };
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          description: i.description,
          amount: Math.round(i.amount_aud * 100), // Stripe uses cents
          currency: "aud",
        });
      }

      // Retrieve updated invoice with line items
      const updated = await stripe.invoices.retrieve(invoice.id);

      return ok(JSON.stringify({
        id: updated.id,
        status: updated.status,
        customer: updated.customer,
        currency: updated.currency,
        total: (updated.total ?? 0) / 100,
        due_date: updated.due_date ? new Date(updated.due_date * 1000).toISOString() : null,
        hosted_invoice_url: updated.hosted_invoice_url,
        line_items: (updated.lines?.data ?? []).map((l) => ({
          description: l.description,
          amount: l.amount / 100,
        })),
      }, null, 2));
    }

    // ----------------------------------------------------------
    // LIST INVOICES
    // ----------------------------------------------------------
    case "list_invoices": {
      const customerId = optionalString(args, "customer_id");
      const status = optionalString(args, "status") as Stripe.InvoiceListParams.Status | undefined;
      const limit = Math.min(Math.max(optionalNumber(args, "limit") ?? 10, 1), 100);

      const params: Stripe.InvoiceListParams = { limit };
      if (customerId) params.customer = customerId;
      if (status) params.status = status;

      const result = await stripe.invoices.list(params);

      const summary = result.data.map((inv) => ({
        id: inv.id,
        status: inv.status,
        customer: inv.customer,
        total: (inv.total ?? 0) / 100,
        currency: inv.currency,
        due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
        paid: inv.paid,
        hosted_invoice_url: inv.hosted_invoice_url,
        created: new Date(inv.created * 1000).toISOString(),
      }));

      return ok(JSON.stringify({ count: summary.length, invoices: summary }, null, 2));
    }

    // ----------------------------------------------------------
    // SEND INVOICE
    // ----------------------------------------------------------
    case "send_invoice": {
      const invoiceId = requireString(args, "invoice_id");

      const invoice = await stripe.invoices.sendInvoice(invoiceId);

      return ok(JSON.stringify({
        id: invoice.id,
        status: invoice.status,
        customer: invoice.customer,
        total: (invoice.total ?? 0) / 100,
        currency: invoice.currency,
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        hosted_invoice_url: invoice.hosted_invoice_url,
      }, null, 2));
    }

    // ----------------------------------------------------------
    // CHECK PAYMENT STATUS
    // ----------------------------------------------------------
    case "check_payment_status": {
      const invoiceId = requireString(args, "invoice_id");

      const invoice = await stripe.invoices.retrieve(invoiceId);

      return ok(JSON.stringify({
        id: invoice.id,
        status: invoice.status,
        paid: invoice.paid,
        amount_due: (invoice.amount_due ?? 0) / 100,
        amount_paid: (invoice.amount_paid ?? 0) / 100,
        amount_remaining: (invoice.amount_remaining ?? 0) / 100,
        currency: invoice.currency,
        customer: invoice.customer,
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        hosted_invoice_url: invoice.hosted_invoice_url,
        payment_intent: invoice.payment_intent,
        created: new Date(invoice.created * 1000).toISOString(),
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
  { name: "promptai-stripe", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;
  const args = (rawArgs ?? {}) as Record<string, unknown>;

  try {
    return await handleTool(name, args);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return err(`Stripe error: ${error.message}`);
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return err(message);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PromptAI Stripe MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
