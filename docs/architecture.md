# Architecture (MVP)

## Layering

1. Presentation layer: `app/`, `components/`, `features/`
2. Application layer: `lib/chat/`, `lib/agent/`, `lib/tools/`
3. Persistence layer: `lib/db/`, `prisma/`

## Milestone 3 Tool Visualization

### Core flow

1. User sends a message in `/chat/[sessionId]`
2. Backend creates a `Run` record with `running` status
3. Agent calls OpenAI Responses API with registered tools
4. Every tool call is logged in `ToolCall` with start/end timestamps and summaries
5. Run status is finalized as `success` or `failed`
6. Frontend renders run/tool trace in the right-side panel

### Registered tools

- `knowledge_search`: search uploaded knowledge sources by text query
- `extract_structured_items`: extract summary and list from input text
- `mock_data_lookup`: safe mock key-value lookup for demo-only queries

### API routes involved

- `POST /api/chat/sessions/[sessionId]/messages`
- `GET /api/chat/sessions`
- `GET /api/chat/sessions/[sessionId]`

## Scope boundary

- Single agent only
- No multi-agent orchestration
- No permission system
- Tool approval workflow deferred to later milestones
