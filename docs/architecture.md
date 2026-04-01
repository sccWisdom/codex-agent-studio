# Architecture (MVP)

## Layering

1. Presentation layer: `app/`, `components/`, `features/`
2. Application layer: `lib/chat/`, `lib/agent/`
3. Persistence layer: `lib/db/`, `prisma/`

## Milestone 2 Chat Loop

### Core modules

- `lib/chat/chat-service.ts`: chat orchestration (session create/list, message send, title update)
- `lib/chat/prisma-chat-store.ts`: database persistence for sessions and messages
- `lib/agent/responses-agent.ts`: single-agent OpenAI Responses API caller

### API routes

- `GET /api/chat/sessions`
- `POST /api/chat/sessions`
- `GET /api/chat/sessions/[sessionId]`
- `POST /api/chat/sessions/[sessionId]/messages`

### UI routes

- `/chat`: session list and empty state
- `/chat/[sessionId]`: session list + messages + input box + status panel

## Scope boundary

- Single agent only
- No multi-agent orchestration
- No permission system
- Tool call visualization remains Milestone 3
