# Architecture Planning Prompt

## Prompt 1

Act as a senior SaaS architect.

I am building LeadFlow AI CRM, a CRM Lite application for small businesses.

Requirements:

* Multi-user SaaS architecture
* Authentication
* Lead management
* Notes management
* Sales pipeline tracking
* Dashboard analytics
* AI-powered lead summaries

Provide:

1. User flow
2. System architecture
3. Database schema
4. API route design
5. Folder structure
6. Scalability considerations
7. Security considerations
8. MVP vs Future Enhancements

Explain every design decision and tradeoff.

## Prompt2
Act as a senior Next.js + Supabase engineer.

Project: LeadFlow AI CRM

Current Stack:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase configured

Task:
Design authentication implementation.

Requirements:

* Register page
* Login page
* Logout functionality
* Protected dashboard routes
* Supabase Auth
* Next.js App Router
* Feature-based architecture

Provide:

1. Folder structure
2. Files to create
3. Authentication flow
4. Security considerations
5. Step-by-step implementation plan

Do not generate code yet.

## Prompt 3
Act as a senior Next.js 16 + Supabase engineer.

Current Project:
LeadFlow AI CRM

Current State:

* Next.js App Router
* TypeScript
* Tailwind
* @supabase/supabase-js installed
* @supabase/ssr installed
* Supabase project configured

Task:
Create Supabase SSR utility layer.

Requirements:

1. Create browser client utility
2. Create server client utility
3. Follow latest Next.js App Router patterns
4. Use feature-based architecture
5. Explain every file before generating code

Provide:

* File paths
* Purpose of each file
* Code for each file
* Verification steps

Do not implement authentication pages yet.

## Prompt 4
Generate code for the following files using the latest Next.js App Router and @supabase/ssr patterns:

Files:

1. src/lib/supabase/client.ts
2. src/lib/supabase/server.ts

Requirements:

* TypeScript
* Next.js 16 compatible
* Use environment variables already configured
* Include comments explaining each section
* Do not generate authentication pages yet
* Do not generate middleware yet

After generating code:
Explain how to verify the setup locally.

## Prompt 5
# Authentication Prompts

## Authentication Architecture

Act as a senior Next.js + Supabase engineer.

Project:
LeadFlow AI CRM

Current Stack:

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase configured

Task:
Design authentication implementation.

Requirements:

* Register page
* Login page
* Logout
* Protected dashboard routes
* Supabase Auth
* Next.js App Router

Provide:

1. Architecture plan
2. Files to create
3. Folder locations
4. Authentication flow
5. Security considerations

Do not generate code yet.

---

## Authentication Route Structure

Act as a senior Next.js 16 + Supabase engineer.

Project:
LeadFlow AI CRM

Current State:

* Supabase SSR utilities complete
* Next.js App Router
* TypeScript
* Tailwind

Task:
Create authentication route structure only.

Requirements:

* Signup page
* Login page
* Dashboard placeholder page
* Feature-based architecture
* No middleware yet
* No authentication logic yet
* No styling focus

Provide:

1. Folder structure
2. Files to create
3. Code for each file
4. Verification steps

Do not implement actual sign-in/sign-up logic yet.

