# PROJECT JOURNAL

## 6. PROJECT SYNOPSIS

**Title:**
RepoShield: An AI-Powered Automated Code Review Platform with Integrated Application Security Auditing

**Synopsis / Executive Summary:**

RepoShield is an intelligent, autonomous code review platform designed to support early-stage detection of security vulnerabilities and code quality issues in GitHub repositories. The system addresses the limitations of traditional, manual pull request reviews by integrating a Retrieval-Augmented Generation (RAG) pipeline with Google Gemini AI into a unified, event-driven platform.

RepoShield captures code changes via secure HMAC-validated GitHub webhooks, fetches pull request diffs using the Octokit API, and queries a Pinecone vector database for contextual codebase injection. Powered by the Google Gemini model (`gemma-4-31b-it`) and asynchronous Inngest background workers, the system posts detailed markdown reviews — covering security vulnerabilities, architectural feedback, and performance suggestions — directly to the GitHub pull request timeline within seconds. A developer insights dashboard built with Recharts and a subscription-based tier system via Polar.sh complete the platform.

---

## 7. PROJECT SCHEDULE

| S. No. | Phase of Development | Activities To Be Carried Out | Deadline |
|--------|---------------------|------------------------------|----------|
| 1. | Analysis and Specification | - Identified the need for automated code security auditing in developer workflows. - Studied RAG-based AI systems and GitHub App integration models. - Reviewed limitations of manual code review approaches. - Conducted literature survey on vector databases and LLM-based code analysis. | 02 Feb 2026 TO 15 Feb 2026 |
| 2. | Designing | - Designed overall system architecture using the Feature-Module pattern. - Planned database schema for `User`, `Repository`, `Review`, `Account`, `Session` models. - Created data flow diagrams and module interaction diagrams. - Designed UI/UX wireframes for dashboard and repository pages. | 16 Feb 2026 TO 28 Feb 2026 |
| 3. | Implementation | - Developed GitHub webhook ingestion and HMAC signature validation. - Developed the Inngest-based background job pipeline for indexing and review generation. - Implemented RAG pipeline with Pinecone vector store and Gemini embeddings. - Integrated Polar.sh payment and subscription tiering system. | 01 Mar 2026 TO 30 Apr 2026 |
| 4. | Testing | - Performed unit and integration testing of Inngest functions. - Evaluated AI review output quality and accuracy. - Validated dashboard data and subscription enforcement logic. - Finalized system testing, documentation, and project journal. | 01 May 2026 TO 25 May 2026 |

---

## 11. RECORD OF ACTIVITIES CARRIED OUT MONTH WISE

---

### Month: February

| Week | Activities Carried Out and Progress Achieved | Signature of Guide |
|------|----------------------------------------------|--------------------|
| (1.) 02/02/26 to 08/02/26 | - Conceived project idea for **RepoShield**: automated AI-powered PR review with security auditing. - Studied scope, objectives, and motivation of the platform. - Researched RAG architectures and GitHub App integration. - Performed literature survey on Pinecone, LLM-based code analysis, and Vercel AI SDK. | |
| (2.) 09/02/26 to 15/02/26 | - Initialized Next.js 15 project with TypeScript, Tailwind CSS v4, and Shadcn UI. - Designed system architecture using the Feature-Module pattern (`/app` for routing, `/module` for business logic). - Set up development environment, ESLint, and `tsconfig.json`. - Drafted module directory structure for AI, GitHub, payment, repository, and review. | |
| (3.) 16/02/26 to 22/02/26 | - Initialized **Prisma ORM** with a serverless PostgreSQL database on **Neon.tech**. - Designed core schema models: `User`, `Account`, `Session`, `Repository`, and `Review`. - Configured `@prisma/adapter-pg` for Neon connection pooling. - Ran initial migrations and verified environment configuration. | |
| (4.) 23/02/26 to 28/02/26 | - Integrated **Better Auth** for passwordless GitHub OAuth authentication. - Configured OAuth provider, session management, and account linking. - Built dark-themed landing page with animated UI elements. - Wrote server-side `requireAuth()` middleware guards for protected routes. | |

---

### Month: March

| Week | Activities Carried Out and Progress Achieved | Signature of Guide |
|------|----------------------------------------------|--------------------|
| (1.) 01/03/26 to 07/03/26 | - Created and configured a **GitHub OAuth App** with required permission scopes (`Pull Requests: Read & Write`, `Repository Contents: Read`). - Set up `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables. - Implemented `getRepoFileContents()` to fetch repository file trees via Octokit REST API. | |
| (2.) 08/03/26 to 14/03/26 | - Set up **Inngest** for background job orchestration and async event processing. - Defined event bus with `repository.connected` and `pr.review.requested` events. - Registered the Inngest API route handler at `/api/inngest/route.ts`. | |
| (3.) 15/03/26 to 21/03/26 | - Developed the **GitHub Webhook handler** at `/api/webhooks/github`. - Implemented SHA256 HMAC signature validation to verify webhook payload authenticity. - Parsed `pull_request` events and dispatched `pr.review.requested` Inngest events. | |
| (4.) 22/03/26 to 28/03/26 | - Implemented repository onboarding flow with `linkRepository()` server action to save records in Prisma and dispatch the `repository.connected` event. - Built `use-connect-repository` hook to manage UI loading and error states. - Built repository connection UI components. | |

---

### Month: April

| Week | Activities Carried Out and Progress Achieved | Signature of Guide |
|------|----------------------------------------------|--------------------|
| (1.) 01/04/26 to 07/04/26 | - Set up **Pinecone** vector database integration. - Wrote `generateEmbedding()` using Google Gemini `gemini-embedding-001` model to convert code files into vector representations. - Developed `indexCodebase()` to iterate repository files, truncate content, and generate embeddings. | |
| (2.) 08/04/26 to 14/04/26 | - Built the **RAG pipeline** with `indexCodebase()` to upsert code vectors into Pinecone and `retrieveContext()` to query top-K relevant file excerpts per pull request. - Integrated the `index-repo` Inngest function to trigger full codebase indexing on `repository.connected` events. | |
| (3.) 15/04/26 to 21/04/26 | - Programmed AI review generation in `inngest/functions/review.ts` with a prompt covering Walkthrough, Sequence Diagram, Summary, Strengths, Issues, Suggestions, and Vulnerability Assessment. - Configured `generateText()` with the `gemma-4-31b-it` model. - Wrote `getPullRequestDiff()` and `postReviewComment()` utilities using Octokit. | |
| (4.) 22/04/26 to 30/04/26 | - Integrated AI review generation into the full Inngest pipeline (`pr.review.requested`) with five steps: `fetch-pr-data`, `retrieve-context`, `generate-ai-review`, `post-comment`, and `save-review`. - Set Inngest concurrency limit to 5. - Configured the system to post the markdown review as a GitHub PR bot comment and save the record to Prisma. | |

---

### Month: May

| Week | Activities Carried Out and Progress Achieved | Signature of Guide |
|------|----------------------------------------------|--------------------|
| (1.) 01/05/26 to 07/05/26 | - Integrated **Polar.sh** for payment webhooks, checkout, and subscription tier management. - Implemented `canConnectRepository()` and `canCreateReview()` to enforce FREE tier limits (5 repos, 5 reviews). - Built the subscription dashboard page and configured Polar environment variables. | |
| (2.) 08/05/26 to 14/05/26 | - Built the **Developer Insights** dashboard using **Recharts** to visualize weekly review trends and repository activity. - Built the main dashboard overview with repository cards and key statistics. - Built the reviews page to browse AI-generated PR review content. | |
| (3.) 15/05/26 to 21/05/26 | - Added rate limiting to the `indexCodebase()` embedding loop (1s delay per call, 2s batch pause every 5 files) to prevent Gemini API quota exhaustion. - Changed error handling to skip failed files instead of aborting the Inngest job. - Fixed duplicate `retrieveContext` declaration causing a compile error and Inngest `internal_server_error`. - Updated ngrok from v3.39.0 to v3.39.2. | |
| (4.) 22/05/26 to 25/05/26 | - Verified end-to-end flow from webhook receipt through Inngest processing to GitHub PR comment posting. - Conducted final integration testing across all major flows. - Updated project documentation (`README.md`, `CONTRIBUTING.md`, `SECURITY.md`). - Completed project journal and all academic submission material. | |

---
