# LeadFlow AI CRM

> A lightweight, AI-augmented Customer Relationship Management application for small businesses and sales teams. Built with Next.js 16, Supabase, and local AI via Ollama + Llama 3.2.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?logo=supabase)](https://supabase.com/)
[![Ollama](https://img.shields.io/badge/AI-Ollama%20%2B%20Llama%203.2-orange)](https://ollama.com/)

---

## Live Demo

**Production URL:** [https://leadflow-ai-crm-git-main-kushagra3.vercel.app](https://leadflow-ai-crm-git-main-kushagra3.vercel.app)

## Repository

**GitHub:** [https://github.com/Kushagraashukla/leadflow-ai-crm](https://github.com/Kushagraashukla/leadflow-ai-crm)

---

## Project Overview

LeadFlow AI CRM solves a common problem for small businesses: lead information scattered across spreadsheets, notes apps, and messaging platforms, resulting in missed follow-ups and inconsistent sales processes. LeadFlow consolidates lead management, interaction history, and AI-powered insights into a single, focused application.

**Key differentiator:** An on-device AI summary engine powered by Ollama + Llama 3.2 generates contextual lead summaries and recommended next actions from your notes — with no cloud API dependency and no per-token cost.

This project was built as part of the **Vibe Coding Assessment**, demonstrating AI-assisted software development practices, progressive Git workflow, and full-stack SaaS architecture.

---

## Features

### ✅ Authentication
- User registration with email and password
- Email verification flow via Supabase
- Secure login and session management
- Logout with session invalidation
- Edge Middleware route protection — unauthenticated users are redirected before any page renders

### ✅ Lead Management
- Create, view, update, and delete leads
- Lead fields: name, email, phone, company, status, deal value
- Six-stage sales pipeline: **New → Contacted → Qualified → Proposal Sent → Won → Lost**
- All data scoped per authenticated user

### ✅ Notes System
- Add timestamped interaction notes to any lead
- Edit and delete existing notes
- Chronological note history displayed on the lead detail page
- Notes feed directly into the AI summary engine

### ✅ Dashboard Analytics
- Total lead count
- Leads broken down by pipeline status
- Won deals and lost deals summary
- Real-time data via Supabase queries on every page load

### ✅ AI Lead Summaries (Local — Ollama + Llama 3.2)
- Generate a concise 2–3 sentence lead summary from interaction notes
- Receive three specific, actionable next steps recommended by the model
- Smart caching: re-generation is skipped if no notes have changed since the last summary
- Runs entirely on-device — no external API keys required

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (SSR cookie-based) |
| AI Engine | Ollama (local) + Llama 3.2 |
| Deployment | Vercel (recommended) |

---

## Architecture Overview

LeadFlow uses a **feature-based architecture** — all code for a given product feature is co-located rather than organised by technical layer. This improves discoverability and reduces the overhead of tracing data flows across deeply nested directories.

```
app/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Auth route group: /login, /signup
│   ├── (dashboard)/            # Protected route group: /dashboard, /leads
│   └── api/auth/callback/      # Supabase PKCE email verification handler
├── src/
│   ├── features/
│   │   ├── auth/               # Sign up, sign in, sign out Server Actions
│   │   ├── leads/              # Lead CRUD Server Actions, components, types
│   │   ├── notes/              # Notes Server Actions, components, types
│   │   ├── ai-summary/         # Ollama integration, summary Server Actions
│   │   └── dashboard/          # Dashboard page components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser Supabase client (Client Components)
│   │   │   └── server.ts       # Server Supabase client (Server Actions, RSCs)
│   │   └── openai.ts           # Ollama config, system prompt, response types
│   ├── components/             # Shared UI components
│   ├── hooks/                  # Shared React hooks
│   ├── services/               # External service integrations
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Utility functions
└── middleware.ts               # Edge route protection + session refresh
```

### Key Architectural Decisions

**Server Actions over API Routes:** All mutations (create, update, delete, AI generation) are implemented as Next.js Server Actions. This eliminates a separate API layer, co-locates business logic with the features that use it, and enables `revalidatePath` cache invalidation without a round-trip.

**Supabase SSR (`@supabase/ssr`):** Session management uses cookie-based SSR rather than localStorage-based tokens. This ensures sessions are available in Server Components, Server Actions, and Edge Middleware consistently, and is the officially recommended approach for Next.js App Router.

**Defence-in-Depth Route Protection:** Routes are protected at two layers: (1) Edge Middleware validates the session before Next.js routing occurs, and (2) every Server Action validates `getUser()` — a server-side JWT check — before touching any data.

---

## Database Overview

The application uses three primary tables in Supabase PostgreSQL.

### `leads`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key (auto-generated) |
| `user_id` | `uuid` | Foreign key → `auth.users.id` |
| `name` | `text` | Lead contact name (required) |
| `email` | `text` | Contact email (optional) |
| `phone` | `text` | Contact phone (optional) |
| `company` | `text` | Company name (optional) |
| `status` | `text` | Pipeline stage (enum) |
| `deal_value` | `numeric` | Estimated deal value (optional) |
| `created_at` | `timestamptz` | Auto-set on insert |

**Status enum values:** `new` · `contacted` · `qualified` · `proposal_sent` · `won` · `lost`

### `notes`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `lead_id` | `uuid` | Foreign key → `leads.id` |
| `user_id` | `uuid` | Foreign key → `auth.users.id` |
| `content` | `text` | Note body |
| `created_at` | `timestamptz` | Auto-set on insert |
| `updated_at` | `timestamptz` | Updated on edit |

### `ai_summaries`

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Primary key |
| `lead_id` | `uuid` | Foreign key → `leads.id` (unique) |
| `user_id` | `uuid` | Foreign key → `auth.users.id` |
| `summary` | `text` | AI-generated lead summary |
| `next_actions` | `text[]` | Array of recommended next steps |
| `model_version` | `text` | Model used for generation (e.g. `llama3.2`) |
| `generated_at` | `timestamptz` | Timestamp of last generation |

> **Security note:** All data access is scoped to the authenticated user via `.eq("user_id", user.id)` on every query, enforcing ownership at the application layer in addition to any database-level Row-Level Security policies.

---

## Environment Variables

Create a `.env.local` file in the `app/` directory with the following variables:

```env
# Supabase project URL — found in your Supabase dashboard under Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co

# Supabase publishable (anon) key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-anon-key>

# Base URL used for constructing email verification redirect links
# Development:  http://localhost:3000
# Production:   https://your-deployment-url.vercel.app
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Ollama local server URL — server-only (no NEXT_PUBLIC_ prefix)
# Ollama must be running locally for AI summaries to function
# Default port: 11434
OLLAMA_BASE_URL=http://localhost:11434
```

> **Important:** Never commit `.env.local` to source control. It is listed in `.gitignore` by default.

---

## Local Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) project (free tier is sufficient)
- [Ollama](https://ollama.com/download) installed locally (for AI summaries)

### 1. Clone the Repository

```bash
git clone https://github.com/Kushagraashukla/leadflow-ai-crm.git
cd leadflow-ai-crm
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com/).
2. Navigate to **Project Settings → API** and copy your Project URL and anon/public key.
3. In the Supabase SQL Editor, create the required tables:

```sql
-- Leads table
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  status text NOT NULL DEFAULT 'new',
  deal_value numeric,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- AI summaries table
CREATE TABLE ai_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  summary text NOT NULL,
  next_actions text[] NOT NULL DEFAULT '{}',
  model_version text NOT NULL DEFAULT 'llama3.2',
  generated_at timestamptz DEFAULT now() NOT NULL
);
```

4. In **Authentication → URL Configuration**, set the **Site URL** to `http://localhost:3000` for local development.

### 3. Install Dependencies

```bash
cd app
npm install
```

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local   # if an example file exists
# or create .env.local manually with the variables listed above
```

### 5. Configure Ollama (for AI Summaries)

```bash
# Pull the Llama 3.2 model (approximately 2GB)
ollama pull llama3.2

# Start the Ollama server (if not already running as a service)
ollama serve
```

Verify Ollama is running: `curl http://localhost:11434/api/tags`

---

## Running the Application

```bash
cd app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The home page redirects to `/login`. Register a new account, verify your email, then log in to access the dashboard.

### Available Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (redirects to `/login`) |
| `/signup` | New user registration |
| `/login` | User login |
| `/dashboard` | Analytics overview (protected) |
| `/leads` | Lead list (protected) |
| `/leads/new` | Create new lead (protected) |
| `/leads/[id]` | Lead detail, notes, and AI summary (protected) |
| `/leads/[id]/edit` | Edit lead (protected) |

---

## AI Summary Feature

The AI summary feature uses a locally-hosted Ollama instance running **Llama 3.2** to analyse lead interaction notes and produce actionable intelligence.

### How It Works

1. The user navigates to a lead's detail page and clicks **Generate AI Summary**.
2. A Next.js Server Action (`generateAISummary`) is invoked server-side.
3. The action fetches the lead's metadata and all associated notes from Supabase.
4. **Cache check:** If a summary already exists and no notes have been updated since its generation, the cached summary is returned immediately — no model inference required.
5. If generation is needed, the lead data and notes are assembled into a structured prompt and sent to Ollama's `/api/chat` endpoint using the `llama3.2` model.
6. The model responds with a JSON object containing a `summary` string and a `next_actions` array of three recommended steps.
7. The response is parsed, validated, and upserted into the `ai_summaries` table in Supabase.
8. The lead detail page is revalidated and the summary is displayed.

### System Prompt

The model is instructed to act as an expert sales analyst and return only a structured JSON object:

```json
{
  "summary": "2-3 sentence lead assessment",
  "next_actions": ["Action 1", "Action 2", "Action 3"]
}
```

### Requirements

- Ollama must be running locally (`ollama serve`)
- The `llama3.2` model must be pulled (`ollama pull llama3.2`)
- `OLLAMA_BASE_URL` must be set in `.env.local` (defaults to `http://localhost:11434`)

### Error Handling

The feature handles common failure modes gracefully:
- **Ollama not running:** Returns a user-friendly message with instructions to start the server
- **Model not pulled:** Prompts the user to run `ollama pull llama3.2`
- **Generation timeout (>60s):** Returns a message suggesting the model may still be loading
- **Malformed model response:** Applies defensive JSON parsing to strip markdown fences before parsing

### Production Note

The application is deployed on Vercel.

Core CRM functionality (authentication, lead management, notes, dashboard analytics) works in production.

The AI Summary feature relies on a locally running Ollama instance and is intended for local development and demonstration environments.

---

## Future Roadmap

### Near-Term

- [ ] **Supabase Row-Level Security (RLS):** Implement database-level ownership policies as a true second line of defence
- [ ] **Kanban Pipeline View:** Drag-and-drop board for visually managing leads through pipeline stages
- [ ] **Dashboard Enhancements:** Total pipeline value, weighted revenue, and conversion rate metrics
- [ ] **AI Summary Streaming:** Real-time streaming responses using the Vercel AI SDK for improved perceived performance

### Medium-Term

- [ ] **Automated Test Suite:** Playwright E2E tests covering critical user flows
- [ ] **CI/CD Pipeline:** GitHub Actions for type-check, lint, and build validation on every push
- [ ] **Email Notifications:** Follow-up reminders and lead status change alerts
- [ ] **Lead Import/Export:** CSV import for bulk lead migration, CSV export for reporting
- [ ] **Activity Timeline:** Unified chronological log of all lead interactions, status changes, and AI events

### Longer-Term

- [ ] **Multi-user Teams:** Organisation-level accounts with role-based access control
- [ ] **Calendar Integration:** Schedule follow-ups linked to lead records
- [ ] **Stripe Billing:** Subscription tiers with usage-based AI summary limits
- [ ] **Mobile Application:** React Native companion app for field sales teams
- [ ] **Advanced Analytics:** Pipeline velocity, stage conversion rates, and revenue forecasting

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/planning.md`](docs/planning.md) | Problem statement, feature definition, architecture, and milestones |
| [`docs/progress-log.md`](docs/progress-log.md) | Chronological development log with technical decisions and outcomes |
| [`docs/ai-journal.md`](docs/ai-journal.md) | AI tool usage log — goals, prompts, contributions, and learnings |
| [`docs/reflection.md`](docs/reflection.md) | Project reflection — what worked, challenges, and improvements |
| [`docs/mvp-scope.md`](docs/mvp-scope.md) | MVP feature scope definition and reasoning |
| [`prompts/architecture-prompts.md`](prompts/architecture-prompts.md) | Prompt library used for AI-assisted development |

---

## AI-Assisted Development Note

This project was built using AI-assisted development practices as part of the Vibe Coding Assessment. AI tools — primarily **ChatGPT** and **Antigravity IDE** — were used throughout the development lifecycle for:

- **Architecture planning:** Evaluating design trade-offs, database schema design, and folder structure decisions
- **Implementation guidance:** Generating and explaining Supabase SSR patterns, Server Action signatures, and middleware configuration
- **Debugging assistance:** Diagnosing environment variable issues, session handling edge cases, and Ollama response parsing failures
- **Documentation:** Drafting and structuring technical documents to professional standards

Every AI-generated output was reviewed, understood, and validated before integration. The development philosophy was one of **directed AI collaboration** — using AI as an expert thought partner while maintaining full engineering judgment over all architectural and security decisions.

The AI journal at [`docs/ai-journal.md`](docs/ai-journal.md) provides a detailed record of how AI tools were used at each stage of development.

---

## License

[MIT](LICENSE)

---

*LeadFlow AI CRM — Vibe Coding Assessment, June 2026*
