# Project Reflection — LeadFlow AI CRM

**Project:** LeadFlow AI CRM
**Developer:** Student Developer — Vibe Coding Assessment
**Date:** June 2026
**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Supabase · Ollama (Llama 3.2)

---

## Overview

LeadFlow AI CRM is a lightweight, AI-augmented customer relationship management application built as part of the Vibe Coding Assessment. The goal was to demonstrate AI-assisted software development through progressive, well-documented implementation of a real-world SaaS product. This document reflects honestly on what worked, what did not, and what was learned throughout the process.

---

## What Worked Well

### 1. Feature-Based Architecture

Organising the codebase around features (`auth`, `leads`, `notes`, `ai-summary`, `dashboard`) rather than technical layers (controllers, models, views) paid significant dividends. When adding a new feature, all relevant files — actions, components, and types — were co-located in one directory. This reduced cognitive overhead and eliminated the need to jump between deeply nested folders to trace a single data flow.

### 2. Supabase SSR Integration

Adopting `@supabase/ssr` for cookie-based session management was the right architectural decision early on. Having dedicated `client.ts` and `server.ts` utility modules meant the rest of the application could consistently obtain the correct Supabase client regardless of the rendering context (Server Component, Server Action, or Edge Middleware). This separation prevented several potential session-handling bugs.

### 3. Next.js Server Actions

Using Server Actions for all mutation operations (lead CRUD, notes, authentication, AI generation) eliminated the need for a separate API layer. Form submissions, state transitions, and cache invalidation via `revalidatePath` composed naturally within the same function. The `useActionState` pattern for managing form feedback was particularly effective for providing inline validation errors without client-side boilerplate.

### 4. Middleware-Based Route Protection

Implementing route protection in `middleware.ts` at the Edge layer — before any React rendering occurred — provided defence-in-depth security alongside the dashboard-level session check. The decision to use `getUser()` (server-validated JWT) rather than `getSession()` (local cookie read) eliminated the risk of spoofed sessions bypassing protection.

### 5. Local AI Integration via Ollama

Replacing the originally planned OpenAI API dependency with a locally-hosted Ollama instance running Llama 3.2 was a pragmatic and technically interesting pivot. It eliminated API key costs for development, introduced no external network dependency for the AI feature, and produced contextually relevant lead summaries. The summary caching logic — checking whether notes had been updated since the last generation — was an elegant optimisation that reduced unnecessary model invocations.

### 6. AI-Assisted Development Workflow

Using ChatGPT and Antigravity IDE as active development partners — not just code generators — accelerated decision-making at every stage. Prompting AI to explain architecture decisions, compare design trade-offs, and propose security considerations produced more thoughtful implementation choices than solo development typically would. The prompt library in `prompts/architecture-prompts.md` formalised this workflow and made it reproducible.

### 7. Progressive Git Workflow

Committing incrementally at each meaningful milestone maintained a clean, readable project history that accurately reflects the development sequence. This proved valuable during debugging sessions, where `git log` provided an unambiguous record of when each feature was introduced.

---

## What Did Not Work Well

### 1. Environment File Placement Confusion

Early in the project, the `.env.local` file was initially placed in the wrong directory due to uncertainty about Next.js's expected file location relative to the monorepo structure. This caused Supabase environment variables to go undetected, resulting in authentication failures that were initially diagnosed as client configuration issues. The resolution was straightforward but consumed disproportionate debugging time.

### 2. Planning Document Committed Prematurely

The initial `docs/planning.md` was committed before its content was complete. While this was corrected with a subsequent commit, it created a slightly inconsistent early Git history. A more disciplined approach would have been to draft the document locally before staging it.

### 3. OpenAI-to-Ollama Pivot Mid-Development

The original planning document specified OpenAI as the AI provider. Switching to Ollama mid-development required refactoring the `src/lib/openai.ts` module — which retained its original filename despite now serving Ollama configuration — and updating all AI-related documentation. A clearer initial technology evaluation phase would have identified Ollama as the preferred option earlier.

### 4. Dashboard Analytics Not Connected to Live Data Initially

The dashboard was scaffolded with static placeholder metrics before the lead management feature was complete. While this is a valid MVP prototyping strategy, it created a brief period where the dashboard displayed inaccurate data during internal testing, which caused momentary confusion.

### 5. Error Handling Inconsistency Across Early Iterations

The early authentication actions used inconsistent error return patterns before a standardised `AuthActionResult` discriminated union type was established. Retrofitting this type across the auth module required revisiting already-completed code, which could have been avoided by defining the type contract first.

---

## Challenges Encountered

### Authentication Session Management Complexity

The most technically demanding aspect of the project was correctly wiring Supabase session management across Next.js's rendering boundary — specifically understanding when to use the browser client, the server client, and the middleware client, and why each must handle cookies differently. The Edge Middleware's requirement to directly manipulate `request.cookies` and `response.cookies` (rather than using `next/headers`) was non-obvious and required careful study of Supabase's SSR documentation and Next.js middleware conventions.

### Ollama Response Parsing Reliability

The Llama 3.2 model occasionally returned JSON responses with markdown code fences (`\`\`\`json`) despite the system prompt explicitly requesting raw JSON output. This required defensive parsing logic — stripping fences before `JSON.parse` — and a runtime validation step to confirm the parsed object matched the expected `{ summary, next_actions }` shape. Handling model non-compliance gracefully without breaking the user experience was a meaningful challenge.

### Git Tracking of Empty Directories

Git does not track empty directories, which meant the initial feature-based folder structure could not be committed until files were added to each directory. This required either using `.gitkeep` placeholder files or deferring directory creation to the first file commit — a subtlety that is easy to overlook when following a planning-first approach.

### Next.js 16 and React 19 Compatibility

Working with Next.js 16 alongside React 19 introduced some unfamiliar API surfaces, particularly around Server Actions, `useActionState`, and the `@supabase/ssr` integration patterns. Documentation for this specific combination was sparse at the time, requiring cross-referencing multiple sources and careful experimentation.

---

## How AI Influenced Development

AI tools were integral to this project at every phase, functioning as a thought partner rather than merely a code generator.

**Architecture and Planning:** ChatGPT was used to evaluate project options, compare feature-based versus layer-based folder structures, and stress-test the database schema design before any code was written. This produced a more considered architecture than would have emerged from solo intuition alone.

**Implementation Guidance:** AI assistance was used to design the Supabase SSR utility layer, the middleware authentication pattern, and the Server Action signatures — all areas where the documentation for the specific technology combination was incomplete. Critically, every AI-generated implementation was reviewed, understood, and verified before integration.

**Debugging:** When environment variable issues and JSON parsing failures arose, AI tools helped systematically narrow the hypothesis space, suggesting diagnostic steps and explaining the likely root causes with relevant technical context.

**Documentation:** AI tools assisted in drafting and structuring documentation including the planning document, AI journal, and prompt library, ensuring professional quality and consistency across all materials.

**Prompt Engineering as a Discipline:** Structuring prompts with explicit context, constraints, and output format requirements — as demonstrated in `prompts/architecture-prompts.md` — produced substantially more useful and accurate AI responses than informal queries. This itself became a key learning about effective AI-assisted development.

---

## Key Learnings

1. **Architecture decisions compound.** Choosing a feature-based folder structure and the `@supabase/ssr` pattern early created a foundation that made every subsequent feature easier to build correctly.

2. **Type-first development prevents rework.** Defining TypeScript discriminated union types for action results (`LeadActionResult`, `NoteActionResult`, `AISummaryActionResult`) before implementing the actions would have prevented retrofitting type changes after the fact.

3. **Security must be layered, not singular.** Route protection at the middleware layer, combined with `getUser()` validation in every server action, provided genuine defence-in-depth. Relying on either layer alone would have left gaps.

4. **Local AI is a viable alternative to cloud APIs for development.** Ollama with Llama 3.2 provided a capable, cost-free, offline AI integration suitable for an MVP. The primary trade-off is model size (requiring local hardware capable of running it) versus API cost and reliability.

5. **AI-assisted development requires judgment, not passivity.** The most effective use of AI tools was in directing the conversation — asking for explanations of trade-offs, requesting architecture reviews, and validating decisions — rather than accepting the first generated output uncritically.

6. **Documentation is a development activity, not an afterthought.** Maintaining the AI journal, progress log, and prompt library throughout the project — rather than reconstructing them at the end — produced richer, more accurate records and reinforced understanding of the decisions being made.

---

## What Would Be Improved With More Time

### Technical Improvements

- **Row-Level Security (RLS) Policy Audit:** While user ownership is enforced via `.eq("user_id", user.id)` in every query, a formal review and implementation of explicit Supabase RLS policies would add a true database-level security layer, making the application genuinely production-safe even if server-side logic were bypassed.

- **Comprehensive Error Boundaries:** Implementing React Error Boundaries and proper `not-found.tsx` and `error.tsx` files for each route segment would make the application more resilient to unexpected server errors.

- **End-to-End Test Suite:** Automated testing using Playwright or Cypress for critical user flows (registration, login, lead creation, AI summary generation) would provide confidence in regressions as the codebase evolves.

- **AI Summary Streaming:** Replacing the batch Ollama response with a streaming implementation using the Vercel AI SDK would provide real-time feedback to the user while the model generates the summary, improving perceived performance significantly.

- **Kanban Pipeline View:** A drag-and-drop board view for the sales pipeline would be the highest-value UX addition, allowing leads to be visually progressed through stages without navigating to individual detail pages.

- **Deal Value Aggregation on Dashboard:** The dashboard currently tracks lead counts by status. Adding total pipeline value, weighted expected revenue, and a conversion rate metric would transform it from an activity tracker into a genuine business intelligence tool.

### Process Improvements

- **Earlier AI Provider Decision:** The Ollama/Llama 3.2 technology choice should have been made during the planning phase rather than mid-implementation, to ensure documentation and architecture reflected the actual implementation from the outset.

- **Automated CI/CD Pipeline:** Setting up GitHub Actions to run type-checking, linting, and build validation on every push would catch regressions before they accumulate.

- **Staging Environment:** Deploying a staging instance to Vercel connected to a separate Supabase project would enable integration testing without risk to any production data.

---

*This reflection was authored as part of the Vibe Coding Assessment, June 2026.*
