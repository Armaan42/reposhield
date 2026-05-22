# REFERENCES

[1] Vercel Inc., "Vercel AI SDK Core Documentation: Building AI-Powered Applications," 2024. [Online]. Available: https://sdk.vercel.ai/docs.
[2] Google Cloud, "Google Gemini API Documentation and Model Architectures," 2024. [Online]. Available: https://ai.google.dev/docs.
[3] Pinecone Systems Inc., "Pinecone Vector Database Architecture and Similarity Search," 2024. [Online]. Available: https://docs.pinecone.io/docs/overview.
[4] Inngest Inc., "Inngest Platform Documentation: Event-Driven Background Jobs and Orchestration," 2024. [Online]. Available: https://www.inngest.com/docs.
[5] GitHub Developer Documentation, "Creating GitHub Apps, Webhooks, and Event Payloads," 2024. [Online]. Available: https://docs.github.com/en/developers/apps.
[6] Polar.sh, "Polar Platform Integration and Monetization Logic," 2024. [Online]. Available: https://docs.polar.sh.
[7] Next.js by Vercel, "Next.js 15 App Router and React Server Components," 2024. [Online]. Available: https://nextjs.org/docs.
[8] Prisma Data, "Prisma ORM and Database Schema Design," 2024. [Online]. Available: https://www.prisma.io/docs.
[9] Neon Inc., "Serverless PostgreSQL Architecture," 2024. [Online]. Available: https://neon.tech/docs.
[10] Better Auth, "Implementing Passwordless and OAuth Authentication," 2024. [Online]. Available: https://better-auth.com/docs.

---

# APPENDIX A: PACKAGE AND COMPONENT LIST

The following represents the core open-source packages, libraries, and SDKs utilized to build the RepoShield platform.

| Package Name | Version | Purpose / Role in System |
|--------------|---------|--------------------------|
| `next` | `15.0.0+` | Core frontend and backend routing framework (App Router). |
| `react` | `19.0.0+` | UI library for building the dashboard and client components. |
| `@prisma/client` | `latest` | Type-safe Object-Relational Mapping (ORM) for PostgreSQL. |
| `inngest` | `latest` | Background job orchestration and exponential backoff queueing. |
| `ai` & `@ai-sdk/google` | `latest` | Vercel AI SDK for interacting with Google Gemini API models. |
| `@pinecone-database/pinecone` | `latest` | Vector database SDK for storing and querying RAG codebase embeddings. |
| `better-auth` | `latest` | Authentication framework for handling GitHub OAuth passwordless login. |
| `@polar-sh/sdk` | `latest` | Billing and subscription tiering SDK. |
| `recharts` | `latest` | Data visualization library for the developer insights dashboard. |
| `lucide-react` | `latest` | Consistent iconography system used across the UI. |

---

# APPENDIX B: SOURCE CODE SNIPPETS

**Pinecone Vector Embedding Loop with Rate Limiting (`module/ai/lib/rag.ts` excerpt):**
```typescript
import { getPineconeIndex } from "@/lib/pinecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google";

const EMBED_DELAY_MS = 1000;
const BATCH_PAUSE_MS = 2000;
const EMBED_BATCH_SIZE = 5;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function indexCodebase(repoId: string, files: { path: string; content: string }[]) {
    const pineconeIndex = getPineconeIndex();
    const vectors = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = `File: ${file.path}\n\n${file.content}`;
        const truncatedContent = content.slice(0, 8000);

        try {
            // Rate limiter to respect Gemini quotas
            if (i > 0) await sleep(EMBED_DELAY_MS);
            if (i > 0 && i % EMBED_BATCH_SIZE === 0) await sleep(BATCH_PAUSE_MS);

            const { embedding } = await embed({
                model: google.textEmbeddingModel("gemini-embedding-001"),
                value: truncatedContent
            });

            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, '_')}`,
                values: embedding,
                metadata: { repoId, path: file.path, content: truncatedContent }
            });
        } catch (e) {
            console.error(`Failed to embed ${file.path}, skipping:`, e);
        }
    }
    // Batch upsert to Pinecone logic omitted for brevity...
}
```

---

# APPENDIX C: ENVIRONMENT VARIABLES

**`.env` Configuration Schema:**
```env
# Database Configuration (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://user:password@host/db_name?sslmode=require"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="generated_crypto_secret"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub App Integration
GITHUB_CLIENT_ID="Iv23.client_id_string"
GITHUB_CLIENT_SECRET="github_client_secret_string"
GITHUB_WEBHOOK_SECRET="custom_hmac_secret"

# Webhook Tunneling
NEXT_PUBLIC_APP_BASE_URL="https://your-ngrok-url.ngrok-free.app"

# Orchestration (Inngest)
INNGEST_EVENT_KEY="local"
INNGEST_SIGNING_KEY="local"
INNGEST_DEV=1

# Vector Database (Pinecone)
PINECONE_DB_API_KEY="pinecone_api_key_string"
PINECONE_INDEX_NAME="reposhield"

# AI Inference (Google Gemini)
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy...gemini_api_key"

# Monetization (Polar.sh)
POLAR_ACCESS_TOKEN="polar_pat_string"
POLAR_SUCCESS_URL="http://localhost:3000/dashboard?payment=success"
POLAR_WEBHOOK_SECRET="polar_webhook_secret_string"
```
