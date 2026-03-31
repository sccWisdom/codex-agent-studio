# AGENTS.md

## Repository Rules

This repository is developed primarily through Codex app.
The human operator should avoid hand-writing business code whenever possible.
Codex should act as the primary implementation agent.

## Source of truth

- `SPEC.md` is the product and implementation source of truth.
- If implementation details are missing, prefer the smallest viable MVP solution.
- Do not expand scope beyond the current milestone.

## Working style

- Read existing files before editing.
- Start each task with a short implementation plan.
- Keep diffs scoped and reviewable.
- Do not refactor unrelated code.
- Prefer incremental delivery over big-bang rewrites.
- Preserve code readability and maintainability.

## Stack expectations

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Single-repo full-stack architecture
- OpenAI Responses API for the initial agent runtime
- SQLite first for MVP persistence

## Architecture expectations

- Keep presentation, business logic, agent orchestration, data access, and utilities separated.
- Avoid placing complex business logic directly inside page components.
- Tool calling must be traceable and logged.
- Error states must be explicit and visible.
- Use environment variables for secrets.

## Task completion checklist

Before considering a task complete, Codex must:

1. Explain what was changed
2. List touched files
3. Run relevant validation commands
4. Report any remaining issues
5. Suggest the next smallest reasonable task

## Validation

Whenever possible, run:
- dependency install if needed
- lint
- build
- tests

If any validation fails, fix the issue or clearly explain the blocker.

## Scope control

Do not introduce:
- unnecessary abstractions
- extra infrastructure not required by MVP
- production-only complexity
- risky external write operations

## Documentation

Keep docs updated when implementation changes:
- `README.md`
- `SPEC.md` if structure changes materially
- any setup notes required for the next task