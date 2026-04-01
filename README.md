# Codex Agent Studio

Web-based AI agent workspace following `SPEC.md`.

Current progress: Milestone 4 knowledge management is implemented.

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

## Milestone 4 Capabilities

- Session-based multi-turn chat with persistence
- Single-agent response generation through OpenAI Responses API
- Tool-call visualization with run and tool logs in `/chat/[sessionId]`
- Knowledge management in `/knowledge`:
  - upload `.txt` / `.md`
  - list knowledge sources
  - delete a source
  - run retrieval test
- Shared knowledge retrieval path between page test and agent tool (`knowledge_search`)

## Validation Commands

```bash
npm run lint
npm run test
npm run build
```
