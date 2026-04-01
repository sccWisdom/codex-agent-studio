# Codex Agent Studio

Web-based AI agent workspace following `SPEC.md`.

Current state: MVP milestone 1-5 is implemented and can be demoed locally.

## Stack

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui base setup
- Prisma + SQLite
- OpenAI Responses API (single agent)

## MVP Capabilities

- Multi-session chat with history persistence
- Agent runtime via OpenAI Responses API
- Tool call logs in chat and run history
- Knowledge import and retrieval (`.txt` / `.md`)
- Run history list + run detail + tool-call association
- Settings page:
  - model config
  - system prompt config
  - tool enable/disable switches
  - changes apply to new requests

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Prepare env file

```bash
copy .env.example .env
```

3. Set required env values

- `OPENAI_API_KEY` is required for real assistant replies.
- If `OPENAI_API_KEY` is missing, chat requests will fail with a visible error (`OPENAI_API_KEY is not configured.`).

4. Initialize database

```bash
npx prisma db push
```

5. Start app

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Environment Variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes (for chat replies) | - | OpenAI API key for Responses API |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Default model fallback when settings not yet saved |
| `OPENAI_SYSTEM_PROMPT` | No | built-in prompt | Default system prompt fallback when settings not yet saved |
| `DATABASE_URL` | Yes | `file:./dev.db` | SQLite database path |

## Validation

```bash
npm run lint
npm run test
npm run build
```

## Smoke Check Flow

1. Open `/settings`, save model/prompt/tool switches
2. Open `/chat`, create session, send message
3. Open `/knowledge`, upload a `.txt` file and run retrieval test
4. Open `/runs`, verify run details and tool-call logs
