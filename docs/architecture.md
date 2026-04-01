# Architecture (MVP)

## Layering

1. Presentation layer: `app/`, `components/`, `features/`
2. Application layer: `lib/chat/`, `lib/agent/`, `lib/tools/`, `lib/knowledge/`, `lib/runs/`, `lib/settings/`
3. Persistence layer: `lib/db/`, `prisma/`

## Milestone 4 Knowledge Loop

### Data storage

- Store uploaded knowledge in `KnowledgeSource` (SQLite via Prisma)
- Use fields: `id`, `name`, `type`, `content`, `status`, `createdAt`
- Keep retrieval simple with text matching (`contains`) for MVP

### Knowledge flow

1. User uploads `.txt` or `.md` in `/knowledge`
2. Backend validates type and content, then persists source
3. Retrieval test calls `/api/knowledge/search`
4. API executes the same `knowledge_search` tool used by agent runtime
5. Chat runtime can call `knowledge_search` through Responses API tool calls

## Milestone 5 Runs and Settings

### Run history flow

1. Chat request creates `Run` and related `ToolCall` records
2. `/runs` page reads run list from `lib/runs/run-service`
3. Selecting a run loads single-run detail with prompt message and tool call chain
4. Failed runs and failed tool calls are rendered with explicit error blocks

### Settings flow

1. `/settings` page loads current values from `GET /api/settings`
2. User edits model, system prompt, and tool switches
3. `PUT /api/settings` validates and persists values into `AppSetting`
4. Each new agent reply loads latest settings from `lib/settings/app-settings`
5. Agent runtime applies:
   - configured model
   - configured system prompt
   - enabled tool subset only

### Key routes

- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/chat/sessions/[sessionId]/messages`

## Scope boundary

- Single agent only
- No vector database
- No multi-agent orchestration
- No permission system
- Tool approval workflow deferred to later milestones
