# Development Progress Log

## Project: LeadFlow AI CRM

**Assessment:** Vibe Coding Assessment — June 2026
**Developer:** Student Developer
**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · Supabase · Ollama + Llama 3.2

---

## Log Format

Each entry records: the activity completed, technical decisions made, challenges encountered, how they were resolved, and the resulting Git commit(s). Entries are ordered chronologically from project inception to current state.

---

## Entry 001 — 2026-06-20 | Project Scoping and Technology Selection

**Phase:** Pre-Development Planning

**Activity:**
Evaluated potential project ideas for the Vibe Coding Assessment. Assessed three candidates: Meeting Notes Manager, CRM Lite, and a Task Tracker. Each was evaluated against business relevance, MVP scope manageability, opportunity for AI feature integration, and suitability for demonstrating full-stack SaaS development.

**Decision:**
Selected CRM Lite — branded as **LeadFlow AI CRM** — for the following reasons:
- Genuine business utility applicable to real sales workflows
- Natural opportunity for AI integration (lead summarisation from interaction notes)
- Scope manageable within the assessment timeline
- Architecture complex enough to demonstrate production-style engineering decisions without becoming undeliverable

**AI Tools Used:**
- ChatGPT — compared project options, defined assessment expectations, outlined AI-assisted development workflow

**Outcome:**
Project direction confirmed. Development approach defined: AI-assisted, documentation-first, incremental commits.

---

## Entry 002 — 2026-06-20 | Repository Initialisation and Documentation Bootstrap

**Phase:** Project Setup

**Activity:**
Initialised the Git repository and established the documentation scaffolding required to maintain a transparent, auditable development history throughout the project.

**Actions Completed:**
- Configured local Git identity
- Initialised repository with `git init`
- Created `README.md` with project overview and goals
- Added `LICENSE` (MIT)
- Created `docs/` directory for planning and progress documentation
- Created `prompts/` directory for the AI prompt library
- Configured `.gitignore` to exclude `node_modules`, `.env.local`, and Next.js build artefacts

**Challenges:**
Git does not track empty directories by default. The `docs/` and `prompts/` directories were not included in the initial commit until files were added. This required deferring directory commits until content existed — a subtle constraint when following a planning-first workflow.

**Commits:**
- `chore: initialise repository with README, LICENSE, and .gitignore`

---

## Entry 003 — 2026-06-20 | Project Planning Document

**Phase:** Planning

**Activity:**
Authored the comprehensive project planning document covering problem statement, application overview, core feature list, technical architecture, database schema design, development milestones, and success criteria.

**Key Planning Decisions:**
- Adopted **feature-based architecture** over layer-based architecture to improve co-location of related code and long-term maintainability
- Defined six-stage sales pipeline: New → Contacted → Qualified → Proposal Sent → Won → Lost
- Identified three primary database tables: `leads`, `notes`, `ai_summaries`
- Planned nine development milestones from project setup through deployment

**AI Contributions:**
ChatGPT assisted in evaluating architecture patterns and database schema design. The feature-based structure was selected after comparing it against a traditional MVC layout — the comparison identified that feature-based organisation scales better as feature count grows.

**Challenge:**
The planning document was initially committed before its full content had been authored. A subsequent commit corrected this with the complete document. This reinforced the importance of completing a document locally before staging.

**Artifacts Created:**
- `docs/planning.md`
- `docs/mvp-scope.md`

**Commits:**
- `docs: add project planning document`
- `docs: add CRM project planning details`

---

## Entry 004 — 2026-06-20 | Architecture Design and AI Journal Initialisation

**Phase:** Planning

**Activity:**
Defined the detailed application architecture and initialised the AI development journal to track all AI tool interactions throughout the project lifecycle.

**Architecture Decisions:**

*Supabase SSR over localStorage tokens:*
Chose `@supabase/ssr` for cookie-based session management to ensure authenticated sessions are accessible in Server Components, Server Actions, and Edge Middleware — all of which cannot read browser-side localStorage. This was a deliberate architectural commitment made before any code was written.

*Next.js Server Actions over traditional API routes:*
Decided to implement all mutations as Server Actions rather than `app/api/` route handlers. This eliminates a separate API layer, keeps business logic co-located with the features that use it, and enables `revalidatePath` cache invalidation directly within action functions.

*AI Provider:*
Originally planned to use the OpenAI API. Revised to Ollama + Llama 3.2 (local) after evaluating the benefits of zero API cost during development and the ability to operate offline. The `src/lib/openai.ts` module name was retained despite the pivot for continuity.

**Prompt Library Initialised:**
- `prompts/architecture-prompts.md` — contains structured prompts used with ChatGPT for architecture, Supabase SSR setup, and authentication design

**Artifacts Created:**
- `docs/ai-journal.md`
- `prompts/architecture-prompts.md`

**Commits:**
- `docs: add AI development journal`
- `docs: add architecture prompt library`

---

## Entry 005 — 2026-06-20 | Next.js Application Initialisation

**Phase:** Implementation — Foundation

**Activity:**
Bootstrapped the Next.js application within the `app/` subdirectory of the monorepo, configuring the full technology stack.

**Setup Completed:**
- Next.js 16 with App Router
- TypeScript 5
- Tailwind CSS 4
- ESLint 9 with `eslint-config-next`
- Feature-based `src/` directory structure created

**Directory Structure Established:**

```
app/src/
├── features/
│   ├── auth/
│   ├── leads/
│   ├── notes/
│   ├── ai-summary/
│   └── dashboard/
├── lib/
│   └── supabase/
├── components/
├── hooks/
├── services/
├── types/
└── utils/
```

**Technical Note:**
Next.js 16 with React 19 introduced several updated API surfaces compared to prior versions, particularly around `useActionState` (replacing `useFormState`) and Server Action composition. Documentation for this specific combination with Supabase SSR required cross-referencing multiple sources.

**Commits:**
- `feat: initialise Next.js application with TypeScript, Tailwind, and App Router`
- `chore: establish feature-based src directory structure`

---

## Entry 006 — 2026-06-20 | Supabase Configuration and SSR Utility Layer

**Phase:** Implementation — Database & Auth Foundation

**Activity:**
Installed and configured the Supabase client libraries, created the SSR utility layer, and configured environment variables.

**Dependencies Installed:**
- `@supabase/supabase-js@^2.108.2` — core Supabase SDK
- `@supabase/ssr@^0.12.0` — SSR-compatible cookie helpers for Next.js

**Files Created:**
- `src/lib/supabase/client.ts` — browser client using `createBrowserClient`, for use in Client Components
- `src/lib/supabase/server.ts` — async server client using `createServerClient` with `next/headers` cookie access, for use in Server Components and Server Actions
- `app/.env.local` — environment variable configuration (excluded from source control)

**Key Technical Decision:**
The server client must be created inside an `async` function because it calls `cookies()` from `next/headers`, which is an async API in Next.js 16. The browser client is synchronous and stateless — it reads no cookies directly, relying on the browser's cookie jar instead.

**Challenge:**
Initial placement of `.env.local` in the repository root rather than the `app/` directory caused environment variables to go undetected by Next.js. Authentication calls failed silently because `NEXT_PUBLIC_SUPABASE_URL` resolved to `undefined`. Resolved by moving the file to `app/.env.local` and verifying with `console.log` in a temporary Server Component.

**Learning:**
Next.js reads environment variables from the `.env.local` file in the directory where `next dev` is invoked — the `app/` directory in this monorepo structure, not the repository root.

**Commits:**
- `feat: install Supabase SSR dependencies`
- `feat: create Supabase browser and server client utilities`
- `chore: configure environment variables and add .env.local to .gitignore`

---

## Entry 007 — 2026-06-20 | Authentication Route Structure

**Phase:** Implementation — Authentication

**Activity:**
Created the authentication page structure using Next.js App Router route groups before implementing any authentication logic. Route groups allow shared layouts without affecting the URL structure.

**Routes Created:**
- `app/(auth)/login/page.tsx` — Login page shell
- `app/(auth)/signup/page.tsx` — Registration page shell
- `app/(dashboard)/dashboard/page.tsx` — Dashboard placeholder
- `app/(auth)/layout.tsx` — Auth layout (centred card design)

**Design Decision:**
Using route groups `(auth)` and `(dashboard)` provides separate layouts for the authentication pages (minimal, centred) and the dashboard area (full sidebar navigation) without these grouping directories appearing in the URL path.

**AI Contributions:**
Antigravity IDE assisted with the route group structure and file scaffolding. The decision to separate auth and dashboard layouts early prevented a layout refactoring later in the project.

**Commits:**
- `feat: create authentication route structure with route groups`

---

## Entry 008 — 2026-06-20 | Authentication Implementation

**Phase:** Implementation — Authentication

**Activity:**
Implemented the complete end-to-end authentication system including registration, login, logout, email verification, and route protection.

**Files Implemented:**
- `src/features/auth/actions/auth.actions.ts` — Server Actions: `signUp`, `signIn`, `signOut`
- `src/features/auth/components/SignupForm.tsx` — Registration form with `useActionState`
- `src/features/auth/components/LoginForm.tsx` — Login form with `useActionState`
- `app/(auth)/login/page.tsx` — Complete login page
- `app/(auth)/signup/page.tsx` — Complete registration page
- `app/api/auth/callback/route.ts` — PKCE email verification callback handler
- `middleware.ts` — Edge Middleware for route protection

**Authentication Flow:**
1. User submits registration form → `signUp` Server Action validates fields, calls `supabase.auth.signUp()` with `emailRedirectTo` set to `/api/auth/callback`
2. Supabase sends verification email containing a PKCE code link
3. User clicks link → `/api/auth/callback` exchanges code for session cookie
4. User redirected to `/dashboard` with active session
5. Subsequent requests → Middleware reads session, refreshes token if needed, protects dashboard routes

**Security Decisions:**
- Used `getUser()` in Middleware (server-validated JWT) rather than `getSession()` (unvalidated local cookie) to prevent session spoofing
- Set `?next=` parameter on redirect to preserve the originally requested URL after login
- Error messages deliberately vague for wrong credentials to prevent user enumeration
- Password minimum set to 8 characters (above Supabase's 6-character minimum)

**Verification Performed:**
- New user registration with valid and invalid inputs
- Email verification link flow end-to-end
- Login with correct and incorrect credentials
- Logout and session clearance
- Unauthenticated access to `/dashboard` correctly redirected to `/login?next=/dashboard`
- Authenticated access to `/login` redirected to `/dashboard`

**Commits:**
- `feat: implement signUp, signIn, signOut Server Actions`
- `feat: build signup and login form components with useActionState`
- `feat: implement email verification callback handler`
- `feat: add middleware route protection with session refresh`
- `test: verify complete authentication workflow`

---

## Entry 009 — 2026-06-20 | Lead Management — Database and Server Actions

**Phase:** Implementation — Lead Management

**Activity:**
Implemented the complete lead management data layer, covering all CRUD operations as Next.js Server Actions with full input validation and user-scoped data access.

**Files Implemented:**
- `src/features/leads/actions/lead.actions.ts` — `createLead`, `updateLead`, `deleteLead`, `getLeads`, `getLeadById`
- `src/features/leads/types/lead.types.ts` — `Lead`, `LeadStatus`, `LeadActionResult` TypeScript types

**Key Implementation Details:**

*User isolation:* Every database query includes `.eq("user_id", user.id)` in addition to relying on any Row-Level Security policies. This provides application-layer ownership enforcement even if RLS is misconfigured.

*Status validation:* A `VALID_STATUSES` constant guards the status field. Invalid status values are rejected before reaching the database, preventing data corruption.

*Deal value handling:* The `deal_value` field accepts an empty string (treated as `null`) or a numeric string (parsed with `parseFloat` and validated with `isNaN`). This prevents non-numeric values from being stored.

*Cache invalidation:* `createLead` and `deleteLead` call `revalidatePath("/leads")`. `updateLead` revalidates both `/leads` and `/leads/[id]`. This ensures the UI reflects changes immediately without a full page reload.

**Commits:**
- `feat: define Lead and LeadStatus TypeScript types`
- `feat: implement lead CRUD Server Actions with user scoping`

---

## Entry 010 — 2026-06-20 | Lead Management — UI Components

**Phase:** Implementation — Lead Management

**Activity:**
Built the lead management UI: lead list page, lead detail page, create lead form, edit lead form, and delete confirmation.

**Routes Implemented:**
- `app/(dashboard)/leads/page.tsx` — Lead list with status badges
- `app/(dashboard)/leads/[id]/page.tsx` — Lead detail view
- `app/(dashboard)/leads/new/page.tsx` — Create lead form
- `app/(dashboard)/leads/[id]/edit/page.tsx` — Edit lead form

**Design Decisions:**
- Lead list displays each lead as a card with name, company, status badge, and deal value
- Status badges are colour-coded by pipeline stage for quick visual scanning
- Delete is implemented as a button with an immediate Server Action call (no modal confirmation in MVP; noted as a future improvement)

**Commits:**
- `feat: build lead list page with status badges`
- `feat: implement lead detail, create, and edit pages`

---

## Entry 011 — 2026-06-20 | Notes System

**Phase:** Implementation — Notes

**Activity:**
Implemented the notes system allowing users to record timestamped interaction logs against individual leads.

**Files Implemented:**
- `src/features/notes/actions/note.actions.ts` — `createNote`, `updateNote`, `deleteNote`, `getNotesByLeadId`
- `src/features/notes/types/note.types.ts` — `Note`, `NoteActionResult` TypeScript types
- `src/features/notes/components/NoteList.tsx` — Chronological notes display
- `src/features/notes/components/NoteForm.tsx` — Add note form
- `src/features/notes/components/NoteItem.tsx` — Individual note with edit/delete

**Key Implementation Detail:**
`createNote` returns `{ success: true }` rather than redirecting. This allows the notes list to refresh in place (via `revalidatePath`) without navigating away from the lead detail page — an important UX consideration for a workflow where a user may add multiple notes in sequence.

`updateNote` and `deleteNote` both enforce ownership via `.eq("user_id", user.id)` in addition to the `noteId` constraint, preventing cross-user note manipulation.

**Integration:**
Notes are displayed on the lead detail page (`/leads/[id]`) alongside the lead's core information and AI summary section. The notes feed directly into the AI summary engine — note content and `updated_at` timestamps are used to determine whether a cached summary is still current.

**Commits:**
- `feat: implement notes CRUD Server Actions`
- `feat: build NoteList, NoteForm, and NoteItem components`
- `feat: integrate notes section into lead detail page`

---

## Entry 012 — 2026-06-20 | Dashboard Analytics

**Phase:** Implementation — Dashboard

**Activity:**
Implemented the dashboard analytics page with real-time metrics derived from live Supabase queries.

**Metrics Implemented:**
- Total leads count
- Leads by status (New, Contacted, Qualified, Proposal Sent, Won, Lost)
- Won deals count
- Lost deals count

**Implementation Approach:**
Dashboard data is fetched server-side in a Server Component using the Supabase server client, then passed as props to presentational components. This approach means the dashboard always displays current data on every page load without requiring client-side polling.

**Technical Note:**
Supabase's `.select("status")` with grouping was used to count leads by status in a single database round-trip rather than issuing separate queries per status.

**Commits:**
- `feat: implement dashboard analytics with live Supabase queries`
- `feat: build dashboard stat cards and status breakdown components`

---

## Entry 013 — 2026-06-20 | AI Lead Summary Feature

**Phase:** Implementation — AI Integration

**Activity:**
Implemented the AI-powered lead summary feature using Ollama with the Llama 3.2 model as the local inference engine. This was the most technically novel component of the project.

**Files Implemented:**
- `src/lib/openai.ts` — Ollama configuration constants, system prompt, response type definitions
- `src/features/ai-summary/actions/ai-summary.actions.ts` — `generateAISummary`, `getAISummary`, `deleteAISummary`
- `src/features/ai-summary/types/ai-summary.types.ts` — `AISummary`, `AISummaryActionResult`, `AIModelResponse` types
- `src/features/ai-summary/components/AISummaryCard.tsx` — Summary display component

**AI System Prompt Design:**
The model is instructed to act as an expert sales analyst. The prompt explicitly:
- Specifies the expected output format (JSON with `summary` and `next_actions` keys)
- Sets the summary length constraint (2–3 sentences)
- Requires exactly three next actions
- Instructs the model to output only JSON with no surrounding text

**Caching Logic:**
Before calling Ollama, the action checks whether an existing summary exists and compares `generated_at` against the `updated_at` timestamp of the most recently modified note. If the summary is current (no notes updated since generation), it is returned immediately without model inference. This significantly reduces unnecessary Ollama invocations.

**Challenge — Model Response Parsing:**
Llama 3.2 occasionally wrapped its JSON output in markdown code fences (` ```json `) despite the system prompt instructing otherwise. This caused `JSON.parse` to throw. Resolved by applying string cleaning before parsing:

```typescript
const cleaned = rawContent
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/```$/i, "")
  .trim();
```

A runtime shape validation (`typeof parsed.summary !== "string"`) guards against the model returning valid JSON with an unexpected schema.

**Challenge — Connection Error Handling:**
Initial testing revealed that a missing or stopped Ollama server produced a raw `ECONNREFUSED` network error that surfaced as an unhandled exception. Added targeted error handling to catch `ECONNREFUSED` and `TimeoutError` cases and return user-friendly messages with corrective instructions.

**Supabase Upsert Strategy:**
AI summaries are stored with `ON CONFLICT ("lead_id")` upsert logic. Only one summary per lead is maintained — re-generation overwrites the previous summary. The `generated_at` timestamp tracks when each version was created.

**Commits:**
- `feat: configure Ollama integration with Llama 3.2 and system prompt`
- `feat: implement generateAISummary Server Action with caching logic`
- `feat: add AI summary display component and integrate into lead detail page`
- `fix: handle Ollama ECONNREFUSED and JSON fence parsing edge cases`

---

## Entry 014 — 2026-06-20 | Debugging Session — Environment and Session Issues

**Phase:** Debugging

**Activity:**
Resolved two distinct bugs encountered during integration testing.

**Bug 1: Environment Variables Not Detected**

*Symptom:* Supabase client initialisation failed with `Missing env variable NEXT_PUBLIC_SUPABASE_URL`. Console output confirmed the variable was `undefined` at runtime.

*Root Cause:* `.env.local` was located in the repository root. Next.js reads environment files from the working directory where the dev server is launched — in this project, the `app/` subdirectory.

*Resolution:* Moved `.env.local` to `app/.env.local`. Restarted the dev server to reload environment variables.

*Learning:* In a monorepo layout where `next dev` runs from a subdirectory, all Next.js configuration files — including `.env.local` — must reside in that subdirectory, not the repository root.

---

**Bug 2: Middleware Session Refresh Failing on Certain Routes**

*Symptom:* Users were intermittently redirected to `/login` despite having an active session, particularly after periods of inactivity.

*Root Cause:* The initial Middleware implementation did not correctly write refreshed cookies back to the outgoing response. Supabase SSR refreshes JWT tokens via cookie, and the refreshed token was not propagating back to the browser.

*Resolution:* Corrected the Middleware cookie handling to rebuild the `supabaseResponse` object after `setAll` is called, ensuring the `Set-Cookie` headers from the token refresh are included in the response sent to the browser. This aligns with the official Supabase Next.js SSR Middleware guidance.

**Commits:**
- `fix: resolve env variable detection in monorepo layout`
- `fix: correct middleware cookie refresh for session persistence`

---

## Entry 015 — 2026-06-20 | Git History Review and Documentation Completion

**Phase:** Documentation & Finalisation

**Activity:**
Reviewed the full Git history for consistency and completeness. Updated all documentation to reflect the as-built application state. Generated the project reflection document.

**Documentation Updated:**
- `README.md` — Comprehensive project README with setup, architecture, and feature documentation
- `docs/progress-log.md` — Full chronological development log (this document)
- `docs/reflection.md` — Project reflection covering what worked, challenges, and learnings
- `docs/ai-journal.md` — AI tool usage entries for all development phases

**Git History Summary:**

| # | Commit Message | Phase |
|---|---------------|-------|
| 1 | `chore: initialise repository with README, LICENSE, and .gitignore` | Setup |
| 2 | `docs: add project planning document` | Planning |
| 3 | `docs: add CRM project planning details` | Planning |
| 4 | `docs: add AI development journal and prompt library` | Planning |
| 5 | `feat: initialise Next.js application` | Foundation |
| 6 | `feat: install Supabase SSR dependencies` | Foundation |
| 7 | `feat: create Supabase SSR utility layer` | Foundation |
| 8 | `feat: create authentication route structure` | Auth |
| 9 | `feat: implement authentication Server Actions` | Auth |
| 10 | `feat: build auth form components` | Auth |
| 11 | `feat: implement middleware route protection` | Auth |
| 12 | `feat: implement lead CRUD Server Actions` | Leads |
| 13 | `feat: build lead management UI pages` | Leads |
| 14 | `feat: implement notes CRUD and components` | Notes |
| 15 | `feat: implement dashboard analytics` | Dashboard |
| 16 | `feat: configure Ollama AI integration` | AI |
| 17 | `feat: implement AI summary generation and caching` | AI |
| 18 | `fix: resolve env variable and middleware session bugs` | Debug |
| 19 | `docs: complete project documentation` | Docs |

**Commits:**
- `docs: complete project documentation for assessment submission`

---

## Current Status — 2026-06-21

### Completed Features

| Feature | Status |
|---------|--------|
| User Registration | ✅ Complete |
| Email Verification | ✅ Complete |
| User Login | ✅ Complete |
| User Logout | ✅ Complete |
| Edge Middleware Route Protection | ✅ Complete |
| Lead Create / Read / Update / Delete | ✅ Complete |
| Six-Stage Sales Pipeline | ✅ Complete |
| Notes Create / Read / Update / Delete | ✅ Complete |
| Dashboard Analytics | ✅ Complete |
| AI Summary (Ollama + Llama 3.2) | ✅ Complete |
| Summary Caching | ✅ Complete |
| Documentation | ✅ Complete |

### Pending / Future Work

| Item | Priority |
|------|----------|
| Supabase Row-Level Security policies | High |
| Kanban pipeline view | Medium |
| Dashboard deal value aggregation | Medium |
| AI summary streaming | Medium |
| End-to-end test suite | Medium |
| CI/CD pipeline | Low |

---

*Log maintained throughout development as part of the Vibe Coding Assessment requirements.*
*Last updated: 2026-06-21*
