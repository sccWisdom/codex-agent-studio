# Codex Agent Studio

Web-based AI agent workspace following `SPEC.md`.

Current progress: Milestone 2 chat loop is implemented.

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

## Chat Milestone Capabilities

- Create sessions
- Browse session list
- Open `/chat/[sessionId]` to continue conversation
- Send messages and get agent replies from OpenAI Responses API
- Persist sessions and messages in SQLite
- Restore history after page refresh
- Show user-visible errors for API and agent failures

## Validation Commands

```bash
npm run lint
npm run test
npm run build
```
