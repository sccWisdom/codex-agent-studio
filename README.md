# Codex Agent Studio

Web-based AI agent workspace following `SPEC.md`.

Current progress: Milestone 3 tool-call visualization is implemented.

## Stack

- Next.js + TypeScript
- Tailwind CSS + shadcn/ui base setup
- Prisma + SQLite
- OpenAI Responses API (single agent)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Prepare env file

```bash
copy .env.example .env
```

3. Initialize database

```bash
npx prisma db push
```

4. Run dev server

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Milestone 3 Capabilities

- Session-based multi-turn chat with persistence
- Single-agent response generation through OpenAI Responses API
- Three registered MVP tools:
  - `knowledge_search`
  - `extract_structured_items`
  - `mock_data_lookup`
- Run-level logging for each message request
- Tool-call logging with:
  - tool name
  - status
  - input summary
  - output summary
  - started time
  - ended time
- Tool trace panel in `/chat/[sessionId]` for success and failure visibility

## Validation Commands

```bash
npm run lint
npm run test
npm run build
```
