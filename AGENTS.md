# AGENTS.md - SuzukiTracker 2.0

## Stack

Next.js 13.5 (App Router) + Prisma (PostgreSQL) + Tailwind CSS + TypeScript. Auth via custom JWT sessions (`lib/session.ts`). UI is entirely in Spanish.

## Commands

```bash
npm run dev        # Dev server (next dev)
npm run build      # prisma generate && next build
npm run lint       # next lint (ESLint flat config in eslint.config.mjs)
```

No test framework is configured. No CI workflows exist.

## Architecture

- **`app/actions/`**: Server Actions (`'use server'`). All DB mutations go here, not API routes.
- **`app/api/`**: Minimal routes (health, upload, keep-alive, logout). Avoid adding new API routes; prefer Server Actions.
- **`components/`**: Shared UI components.
- **`lib/`**: Core utilities — `prisma.ts` (singleton client), `session.ts` (JWT encrypt/decrypt/login/logout), `validations.ts` (Zod schemas), `suzuki-data.ts` (Suzuki book/song seed data).
- **`prisma/schema.prisma`**: PostgreSQL. Models: User, Student, BookTemplate, SongTemplate, BookAssignment, StudentSong, Progress, PracticeSession, Attendance, PasswordResetToken.
- **`scripts/`**: One-off DB utilities (backup, restore, migrate, create user). Run with `npx tsx scripts/<name>.ts`.
- **`_agents/`**: Antigravity workflows and skills (not app code).

## Auth Pattern

Server Actions use `getSession()` from `@/lib/session` to get the current user. Middleware (`middleware.ts`) protects all routes except `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/portal/*`. API routes are excluded from middleware.

## Key Conventions

- **Server Actions over API routes**: Mutations must use Server Actions with `revalidatePath` after success.
- **Zod validation**: All form input is validated with Zod schemas in `lib/validations.ts` before Prisma calls.
- **Prisma singleton**: Import from `@/lib/prisma`, never instantiate `PrismaClient` directly.
- **Path alias**: `@/*` maps to project root (see `tsconfig.json` paths).
- **Dark mode**: Tailwind `class` strategy via `next-themes` ThemeProvider.
- **Spanish strings**: All user-facing text is in Spanish. Maintain this convention.
- **UUID primary keys**: All models use `@default(uuid())`, not auto-increment.

## DB Quirks

- Schema declares PostgreSQL (`datasource db { provider = "postgresql" }`). A legacy `prisma/dev.db` (SQLite) exists but is not the active target.
- `build` script runs `prisma generate` before `next build` — no separate generate step needed.
- Several models have `@@unique` constraints (e.g., `[studentId, date]` on Attendance/PracticeSession, `[teacherId, number]` on BookTemplate). Respect these when creating or upserting.

## Env

`.env` is gitignored. Required vars: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`. See `.env.example` for the expected format.
