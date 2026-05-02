# Environment Variables Reference

To run Reposhield, you need to configure several environment variables in a `.env` file. Below is the full reference of every required key.

## 🗄️ Database (PostgreSQL)
- **`DATABASE_URL`**: The connection string for your PostgreSQL database. Reposhield is optimized for Neon.tech.
  - *Example:* `postgresql://user:pass@host/db?sslmode=require`

## 🔑 Authentication (Better Auth)
- **`BETTER_AUTH_SECRET`**: A random 32-character string used to sign cookies and sessions.
- **`BETTER_AUTH_URL`**: The base URL of your application.
  - *Local:* `http://localhost:3000`
  - *Production:* `https://your-domain.com`

## 🐙 GitHub Integration (OAuth)
- **`GITHUB_CLIENT_ID`**: Your GitHub OAuth App Client ID.
- **`GITHUB_CLIENT_SECRET`**: Your GitHub OAuth App Client Secret.
- **`NEXT_PUBLIC_APP_BASE_URL`**: The public URL of your app, used for GitHub webhook redirects. When developing locally, this must be your **ngrok** URL.

## 🚀 Background Jobs (Inngest)
- **`INNGEST_EVENT_KEY`**: (Production only) The secret key from your Inngest dashboard to authorize events.
- **`INNGEST_SIGNING_KEY`**: (Production only) The signing key to verify requests from Inngest.
- **`INNGEST_DEV`**: Set to `1` during local development to use the Inngest Dev Server.

## 🧠 AI & Vector Search
- **`GOOGLE_GENERATIVE_AI_API_KEY`**: Your Google AI Studio API key for access to the Gemini models.
- **`PINECONE_DB_API_KEY`**: Your Pinecone API key for the vector database used in the RAG pipeline.

## 💳 Payments (Polar.sh)
- **`POLAR_ACCESS_TOKEN`**: Your Polar.sh Personal Access Token.
- **`POLAR_WEBHOOK_SECRET`**: The secret used to verify incoming payment webhooks from Polar.
- **`POLAR_SUCCESS_URL`**: Where to redirect users after a successful checkout.
  - *Example:* `http://localhost:3000/dashboard/subscription?success=true`
