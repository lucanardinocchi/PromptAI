# PromptAI

An intelligent prompt management system powered by MCP servers and Supabase.

## Project Structure

```
PromptAI/
├── mcp-server/       # Existing MCP server (Supabase client)
├── mcp-servers/      # Additional MCP server integrations
├── skills/           # Agent skills and prompt templates
├── dashboard/        # Web dashboard UI
├── docs/             # Documentation
├── supabase/         # Supabase config & migrations
└── database-architecture.md
```

## Getting Started

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. Install dependencies: `cd mcp-server && npm install`
4. Run the MCP server: `npm start`

## License

MIT
