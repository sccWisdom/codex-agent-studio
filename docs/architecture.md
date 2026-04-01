# Architecture (MVP)

## Layering

1. Presentation layer: `app/`, `components/`, `features/`
2. Application layer: `lib/chat/`, `lib/agent/`, `lib/tools/`, `lib/knowledge/`
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

### Key routes

- `GET /api/knowledge`
- `POST /api/knowledge`
- `DELETE /api/knowledge/[sourceId]`
- `POST /api/knowledge/search`
- `POST /api/chat/sessions/[sessionId]/messages`

## Scope boundary

- Single agent only
- No vector database
- No multi-agent orchestration
- No permission system
- Tool approval workflow deferred to later milestones
