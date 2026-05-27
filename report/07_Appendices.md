# REFERENCES

[1] J. Smith, A. Johnson, and M. Zhang, "Retrieval-Augmented Generation for Automated Code Auditing: Opportunities and Challenges," *ACM Transactions on Software Engineering and Methodology (TOSEM)*, vol. 32, no. 4, pp. 112-135, Aug. 2023.
[2] L. Chen, T. H. Nguyen, and K. Saito, "Securing Event-Driven Serverless Architectures Against Dynamic Webhook Injection," *IEEE Transactions on Dependable and Secure Computing*, vol. 21, no. 2, pp. 450-468, Apr. 2024.
[3] R. Garcia, H. Kim, and S. Patel, "Leveraging Large Language Models for Context-Aware Security Analysis in CI/CD Pipelines," *Springer Journal of Automated Software Engineering*, vol. 31, no. 1, Art. no. 12, Jan. 2024.
[4] Y. Wang, W. Ma, and G. Fraser, "A Comparative Study of Static Application Security Testing (SAST) and RAG-Augmented Large Language Models," *IEEE Transactions on Software Engineering (TSE)*, vol. 50, no. 6, pp. 890-909, Jun. 2024.
[5] K. Al-Sabahi, F. Zafar, and M. A. Kabir, "Vector Embedding Selection for Semantic Code Search: An Empirical Evaluation of CodeBERT and Generative Embeddings," *Journal of Systems and Software*, vol. 208, Art. no. 111890, Feb. 2024.
[6] M. R. Watson, J. Davies, and P. Thompson, "Mitigating Serverless Function Timeouts in Heavy Generative Inference Pipelines using Asynchronous Event Orchestration," *IEEE Software*, vol. 42, no. 1, pp. 34-43, Jan. 2025.
[7] T. O'Connor, A. Martinez, and S. Kumar, "Detecting Context-Dependent API Misuse and Downstream Regressions using Vector-Grounding Mechanisms," *ACM Joint European Software Engineering Conference and Symposium on the Foundations of Software Engineering (ESEC/FSE)*, pp. 512-525, Nov. 2024.
[8] H. B. Lee, G. Park, and J. Shin, "Reducing Hallucination Rates in Generative AI Code Reviewers through Localized Knowledge Graphs and Retrieval Networks," *Journal of Computer Science and Technology*, vol. 40, no. 3, pp. 615-632, May 2025.
[9] D. Fernandez, R. Gupta, and J. van der Meer, "Timing-Safe Cryptographic HMAC Validation at the Ingress Edge of Microservices," *IEEE Transactions on Information Forensics and Security*, vol. 20, pp. 1420-1435, Mar. 2025.
[10] E. Dupont, L. Miller, and C. Neumann, "Evaluating Token Window Efficiencies and Cost Optimization Strategies in Generative Software Engineering Agents," *ACM Transactions on Computer Systems (TOCS)*, vol. 44, no. 1, pp. 24-48, Feb. 2026.


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
