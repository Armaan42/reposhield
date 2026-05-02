# Module Breakdown

Reposhield is organized into several distinct modules to keep the codebase clean and maintainable. This project relies heavily on Next.js App Router conventions.

## Directory Structure

```text
reposhield/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── api/              # HTTP API endpoints (Webhooks, Inngest)
│   ├── dashboard/        # Authenticated dashboard UI
│   └── page.tsx          # Public landing page
├── components/           # Reusable React components (Shadcn UI)
├── inngest/              # Background jobs and event definitions
├── lib/                  # Core utility functions (Auth, DB, AI)
├── module/               # Feature-based domain logic (Server Actions)
├── prisma/               # Database schema and migrations
└── wiki/                 # Project documentation
```

---

## Detailed Breakdown

### `/app`
This directory handles routing and the visible user interface.
- `/app/api`: Contains the webhook receivers (`/webhook`, `/webhooks/polar`) and the Inngest handler (`/inngest/route.ts`).
- `/app/dashboard`: Contains the main layout (`layout.tsx`), the overview page (`page.tsx`), the subscription management page (`/subscription/page.tsx`), and the developer performance graphs (`/insights/page.tsx`).

### `/module`
We use a feature-module pattern to separate server-side business logic from the UI.
- **`module/dashboard/actions`**: Contains Next.js Server Actions. For example, `insights.ts` holds the `getDeveloperInsights` function which aggregates Prisma review data, calculates weekly trends, and maps AI review text to dynamic performance badges.
- **`module/payment`**: Contains functions to interact with Polar.sh, including creating checkout sessions and syncing subscription status.

### `/lib`
Core configuration and singletons.
- **`auth.ts` / `auth-client.ts`**: Better Auth configuration for GitHub OAuth, session management, and database adapter setup.
- **`db.ts`**: The Prisma client singleton instance.
- **`ai.ts`**: Initialization and helper functions for the Vercel AI SDK and Google Gemini.

### `/inngest`
The heart of the asynchronous engine.
- **`client.ts`**: Initializes the Inngest client.
- **`functions.ts`**: Contains the heavy background tasks, primarily the `generateReview` function which orchestrates fetching the GitHub diff, querying the vector database, prompting Gemini, and posting the final comment back to GitHub.

### `/prisma`
- **`schema.prisma`**: The source of truth for the database schema. Defines the `User`, `Repository`, `Review`, and `UserUsage` models, as well as the relationships between them.

---

## How Modules Connect & Function Interactions

Reposhield relies on a strict flow of data between its modules to keep the UI fast while handling heavy AI computations in the background. Here is how the key functions interact with each other:

### 1. UI to Server Actions (The Dashboard Flow)
When a user visits a dashboard page (e.g., `/app/dashboard/insights/page.tsx`), the React Server Component directly calls a function from the `/module` directory.
- **Example Flow**: `InsightsPage` calls `getDeveloperInsights()`.
- **Interaction**: The `getDeveloperInsights` function uses `lib/auth.ts` to get the current user's session. It then uses `lib/db.ts` to query Prisma for the user's reviews. Finally, it formats the data (calculating trends and badges) and returns it to the UI component, which renders the Recharts graphs.
- **Rule**: UI components *never* talk directly to the database. All data fetching is routed through the `/module` directory to ensure security and reusability.

### 2. Webhooks to Background Workers (The Event Flow)
When GitHub fires a webhook, it must be acknowledged within seconds, or GitHub will mark it as failed. 
- **Example Flow**: A developer opens a Pull Request. GitHub sends a POST request to `/app/api/webhook/route.ts`.
- **Interaction**: The webhook route validates the payload. Instead of processing the review there, it uses the Inngest client (`lib/inngest.ts`) to dispatch an event: `inngest.send({ name: "github/pr.review", data: { ... } })`. The API route immediately returns `200 OK`.
- **Handoff**: The Inngest server receives this event and triggers the `generateReview` function inside `/inngest/functions.ts` on a separate thread.

### 3. The AI Review Pipeline (The Processing Flow)
Once the `generateReview` Inngest function starts running, it acts as an orchestrator, pulling together multiple utility libraries.
- **Interaction 1 (GitHub Fetch)**: It uses `lib/github.ts` (Octokit) to fetch the specific Git Diff (`.patch` file) for the Pull Request.
- **Interaction 2 (RAG Retrieval)**: It takes the changed code and uses the embedding functions in `lib/ai.ts` to query the Vector Database, retrieving the 5 most relevant codebase files to provide architectural context.
- **Interaction 3 (AI Generation)**: It combines the Git Diff and the RAG Context, and calls the Vercel AI SDK (`generateText`) connected to the Google Gemini model.
- **Interaction 4 (Database & Commenting)**: Once Gemini returns the markdown review, the function writes the result to the Prisma Database (`lib/db.ts`) and uses Octokit again to post the comment on the GitHub PR timeline.

### 4. Subscription State Syncing (The Payment Flow)
- **Interaction**: When a user upgrades, they are sent to Polar.sh via a function in `/module/payment/action.ts`. When payment succeeds, Polar hits our `/app/api/webhooks/polar/route.ts`. This route updates the user's `subscriptionTier` in Prisma.
- **Failsafe**: If the webhook fails, the frontend `/app/dashboard/subscription/page.tsx` uses a `useEffect` hook to manually call `syncSubscriptionStatus()` when the user is redirected back with `?success=true`.
