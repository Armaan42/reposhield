# Module Breakdown & Architecture

Reposhield uses a strict **Feature-Module Architecture** to keep the Next.js `app/` directory clean and maintainable. Instead of mixing UI components, database calls, and AI logic in the same files, everything is separated by domain.

---

##  Global Directory Structure

```text
reposhield/
├── app/                  # Next.js App Router (UI Routes & API endpoints)
├── components/           # Generic, reusable UI components (Buttons, Inputs, Modals)
├── inngest/              # Background job orchestrators and queue logic
├── lib/                  # Global utilities (Auth instance, Prisma client, Pinecone client)
├── module/               #  Core Business Logic (The brain of the app)
├── prisma/               # Database schema and migration histories
├── public/               # Static assets (images, SVGs)
└── wiki/                 # Project documentation
```

---

##  The `/module` Directory (File-by-File Breakdown)

The `/module` directory implements the core business logic, database operations, and external API integrations for Reposhield. To keep the Next.js `app/` directory clean and focused solely on routing and page layouts, everything is isolated by domain inside `/module`.

### Directory Tree of `/module`
```text
module/
├── ai/
│   ├── actions/
│   │   └── index.ts               # reviewPullRequest Server Action
│   └── lib/
│       └── rag.ts                 # Vector embedding & context retrieval logic
├── auth/
│   ├── components/
│   │   ├── login-ui.tsx           # Social login button UI component
│   │   └── logout.tsx             # Logout button UI component
│   └── utils/
│       └── auth-utils.ts          # requireAuth session validation helper
├── dashboard/
│   ├── actions/
│   │   ├── index.ts               # Simple stats and recent reviews fetchers
│   │   └── insights.ts            # getDeveloperInsights analytics engine
│   └── components/
│       └── contribution-graph.tsx # Recharts contributions trend line
├── github/
│   └── lib/
│       └── github.ts              # Octokit API calls & GitHub integration helpers
├── payment/
│   ├── action/
│   │   └── index.ts               # syncSubscriptionStatus manual sync action
│   ├── config/
│   │   └── polar.ts               # Polar client initializer singleton
│   └── lib/
│       └── subscription.ts        # Subscription limits & usage counters
├── repository/
│   ├── actions/
│   │   └── index.ts               # fetchRepositories & connectRepository actions
│   ├── components/
│   │   └── repository-skeleton.tsx# Loading states for repo lists
│   └── hooks/
│       ├── use-connect-repository.ts # TanStack mutation for connecting a repo
│       └── use-repositories.ts    # TanStack infinite query for fetching repos
├── review/
│   └── actions/
│       └── index.ts               # getReviews server action
└── settings/
    ├── actions/
    │   └── index.ts               # getUserProfile, updateUserProfile, & disconnect actions
    └── components/
        ├── profile-form.tsx       # User settings profile form component
        └── repository-list.tsx    # List and disconnection management UI
```

---

### Detailed File & Function Reference

#### 1. `module/ai/` (The Generative & RAG Brain)
Handles Large Language Model interaction and vector search functionality.
* **`actions/index.ts`**
  * `reviewPullRequest(owner, repo, prNumber)`:
    * Server Action called when a manual review is requested.
    * Verifies the repository exists and checks if the user has remaining quota via `canCreateReview`.
    * Dispatches the `pr.review.requested` event to Inngest for async background processing.
    * Increments the review count for usage tracking.
* **`lib/rag.ts`**
  * `generateEmbedding(text)`:
    * Generates a 768-dimensional vector embedding for the input text using the `gemini-embedding-001` model via the Google AI SDK.
  * `indexCodebase(repoId, files)`:
    * Performs batch vector embedding for code files in a repository.
    * Formats contents, truncates to 8,000 characters, obtains embeddings, and upserts them in batches of 100 to the Pinecone index.
  * `retrieveContext(query, repoId, topK)`:
    * Queries the Pinecone index using the vector embedding of a search query (e.g. PR title/description).
    * Filters search results by `repoId` and returns the top $K$ (default: 5) most semantically relevant file contents.

#### 2. `module/auth/` (Session Management)
Integrates Better-Auth to manage user sessions and authentication.
* **`utils/auth-utils.ts`**
  * Helper utilities to extract and validate active sessions.
  * Verifies incoming cookies against the session database, rejecting unauthorized requests before hitting heavy database endpoints.
* **`components/login-ui.tsx` & `logout.tsx`**
  * Trigger-buttons for social login redirecting to Better Auth's social flow (`provider: 'github'`).

#### 3. `module/dashboard/` (Data Aggregation)
Aggregates review data for visualization and gamified insights.
* **`actions/insights.ts`**
  * `getDeveloperInsights()`:
    * Server Action that aggregates review and repository statistics for the logged-in user.
    * Normalizes dates to UTC midnight (`setUTCHours(0,0,0,0)`) to align charts across timezones.
    * Evaluates generated review text against keyword rules to issue Gamification Badges (e.g., matching the word "SQL Injection" to award the "Security Guardian" badge).
* **`actions/index.ts`**
  * `getRecentReviews()` & `getActiveRepositories()`:
    * Direct fetchers retrieving recent reviews and active repositories to display on the dashboard landing page.
* **`components/contribution-graph.tsx`**
  * Recharts client component rendering the user's interactive review activity trend line.

#### 4. `module/github/` (External API Integrations)
Communicates with the GitHub REST and GraphQL APIs.
* **`lib/github.ts`**
  * `getGithubToken()`: Retrieves the GitHub access token for the logged-in user session from the `Account` table.
  * `fetchUserContributions(token, username)`: Calls GitHub GraphQL API to fetch the user's total contributions and daily contribution calendar data.
  * `getRepository(page, perPage)`: Returns a paginated list of repositories for the authenticated user.
  * `createWebhook(owner, repo)`: Creates a repository webhook pointing to Reposhield's `/api/webhooks/github` receiver to capture pull request events.
  * `deleteWebhook(owner, repo)`: Removes the webhook from the GitHub repository settings.
  * `getRepoFileContents(token, owner, repo, path)`: Recursively fetches the file structure and contents of a repository, filtering out common binary file formats (images, zip files, pdfs, etc.).
  * `getPullRequestDiff(token, owner, repo, prNumber)`: Downloads the `.patch` representation of the pull request changes, and returns the diff text, title, and body.
  * `postReviewComment(token, owner, repo, prNumber, review)`: Appends the generated AI Code Review markdown comment directly onto the GitHub PR thread.

#### 5. `module/payment/` (Monetization & Quotas)
Enforces application limits, usage tracking, and integration with Polar.sh.
* **`action/index.ts`**
  * `syncSubscriptionStatus()`:
    * Fetches the user's active subscriptions via the Polar SDK client and updates the local Prisma database status to keep local records in sync.
* **`config/polar.ts`**
  * Initializes the `@polar-sh/sdk` client singleton using the `POLAR_ACCESS_TOKEN`.
* **`lib/subscription.ts`**
  * `canConnectRepository(userId)`: Restricts Free Tier users to linking a maximum of 5 repositories.
  * `canCreateReview(userId, repoId)`: Restricts Free Tier users to a maximum of 5 reviews per repository.
  * `incrementRepositoryCount()`, `decrementRepositoryCount()`, `incrementReviewCount()`: Helper utilities tracking active usage counters.

#### 6. `module/repository/` (Onboarding Codebases)
Orchestrates repository linking, quota validation, and vector database indexing.
* **`actions/index.ts`**
  * `fetchRepositories(page, perPage)`: Fetches a user's GitHub repositories and maps `isConnected: true/false` based on existing records in Prisma.
  * `connectRepository(owner, repo, githubId)`:
    * Validates limits using `canConnectRepository`.
    * Creates the webhook on GitHub, saves the repository metadata in Prisma, and updates the usage tracker.
    * Dispatches the `repository.connected` event to Inngest to queue recursive repository file fetching and Pinecone embedding indexing.
* **`hooks/use-repositories.ts`**
  * TanStack client hook implementing infinite scrolling/pagination to list GitHub repos.
* **`hooks/use-connect-repository.ts`**
  * TanStack client mutation that wraps repository connection requests with loading indicators and toast feedback.

#### 7. `module/review/` (Review History)
* **`actions/index.ts`**
  * `getReviews()`: Fetches the last 50 pull request reviews generated for the user's repositories, including repository metadata, sorted in descending order of creation.

#### 8. `module/settings/` (Account & Connection Settings)
* **`actions/index.ts`**
  * `getUserProfile()`: Fetches the basic profile information of the logged-in user.
  * `updateUserProfile(data)`: Updates the user's name and email settings in the database, revalidating the cached UI path.
  * `getConnectedRepositories()`: Retrieves the list of currently linked repositories.
  * `disconnectRepository(repositoryId)`: Disconnects a single repository, removes its GitHub webhook, and deletes the record and associated reviews in Prisma.
  * `disconnectAllRepositories()`: Iterates through all connected repositories, deletes all webhooks on GitHub, and removes repository records from the database.
* **`components/profile-form.tsx`**
  * Form component containing input fields for profile updates, handling validation, submittal states, and toast notifications.
* **`components/repository-list.tsx`**
  * UI component to list connected repositories with direct links to GitHub and controls to trigger individual or bulk disconnection.

---

##  Interaction Flows (How it all connects)

Reposhield relies on a strict flow of data between these modules to keep the UI fast while handling heavy AI computations in the background.

### 1. UI to Server Actions (The Dashboard Flow)
* **Flow**: `InsightsPage` UI -> calls `module/dashboard/actions/getDeveloperInsights()` -> queries Prisma -> returns data to UI.
* **Core Rule**: UI components *never* talk directly to the database.

### 2. Webhooks to Background Workers (The Event Flow)
* **Flow**: GitHub fires webhook -> `/api/webhooks/github` validates signature -> dispatches event via Inngest client -> immediately returns `200 OK`.
* **Handoff**: The Inngest server triggers the `generateReview` function on a separate thread.

### 3. The AI Review Pipeline (The Processing Flow)
Inside the Inngest background worker:
* **Interaction 1 (Fetch)**: Uses `module/github/lib/github.ts` (`getPullRequestDiff`) to fetch the `.patch` diff and metadata.
* **Interaction 2 (RAG)**: Uses `module/ai/lib/rag.ts` (`retrieveContext`) to query Pinecone for the 5 most relevant codebase files.
* **Interaction 3 (Generation)**: Combines Diff + RAG Context and calls Gemini (`google("gemma-4-31b-it")`).
* **Interaction 4 (Commenting)**: Uses `module/github/lib/github.ts` (`postReviewComment`) to post the AI review back to GitHub.
* **Interaction 5 (Persistence)**: Saves the complete review markdown to Prisma with a status of `"completed"`.

### 4. Subscription State Syncing (The Payment Flow)
* **Interaction**: Polar.sh webhook hits `/api/webhooks/polar` -> updates `subscriptionTier` in Prisma.
* **Failsafe**: If webhook fails, frontend calls `module/payment/action/syncSubscriptionStatus()` to manually fetch status from Polar.sh API and hard-update the database.
