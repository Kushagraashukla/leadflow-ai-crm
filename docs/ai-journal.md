# AI Development Journal

## Entry 1 - Project Planning

Date: 20 June 2026

### Goal

Select an appropriate SaaS project and define the development approach for the Vibe Coding Assessment.

### AI Tools Used

* ChatGPT
* Antigravity IDE

### Activities

* Evaluated multiple project ideas including Meeting Notes Manager and CRM Lite.
* Selected CRM Lite due to business relevance and manageable scope.
* Defined MVP features and AI-powered differentiator.
* Planned documentation strategy to satisfy assessment requirements.

### AI Contributions

ChatGPT:

* Helped compare project options.
* Suggested CRM feature prioritization.
* Explained assessment expectations.
* Designed development workflow and commit strategy.

Antigravity IDE:

* Assisted with Git setup.
* Generated repository initialization workflow.
* Helped create project scaffolding and documentation structure.

### Decisions Made

* Build LeadFlow AI CRM.
* Follow incremental development with small commits.
* Maintain planning, AI journal, progress log, and reflection documents.

### Learning

The assessment emphasizes AI-assisted software engineering processes rather than only delivering a working application.

## Entry 2

Goal:
Define application architecture.

Tool:
ChatGPT

Prompt:
Architecture Planning Prompt

Outcome:
Generated architecture, folder structure, database design, and API strategy.

Decision:
Adopt MVP architecture and incremental development approach.


## Entry 3
Goal:
Design scalable project structure.

Tool:
ChatGPT

Outcome:
Selected feature-based architecture over layer-based architecture to improve maintainability and scalability.

## Entry 3
Goal:
Configure Supabase integration.

Tool:
ChatGPT + Antigravity

Outcome:
Installed Supabase SDK, configured environment variables, and created reusable client module.

Challenges:
Environment file placement and Git tracking behavior for empty folders.

Learning:
Environment variables should never be committed to source control and must be managed through .gitignore.

## Entry 4
## Authentication Architecture and Implementation

AI Tools Used:

* ChatGPT
* Antigravity IDE

Objective:
Implement a production-style authentication system for LeadFlow AI CRM using Next.js App Router and Supabase.

Prompts Explored:

* Supabase SSR setup
* Authentication architecture planning
* Registration workflow implementation
* Login and logout implementation
* Middleware-based route protection

AI Contributions:

* Suggested separation of browser and server Supabase clients
* Recommended Server Actions for authentication workflows
* Proposed middleware-based route protection
* Provided dashboard session validation patterns

Manual Decisions:

* Reviewed generated architecture before implementation
* Chose incremental milestone-based development
* Verified security-related decisions before integration
* Performed end-to-end testing of authentication workflows

Outcome:
Successfully implemented and verified registration, email verification, login, logout, protected routes, and session-based dashboard access using Supabase SSR.
