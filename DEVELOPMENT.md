<div align="center">
  <a href="./README.md">📖 README</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <strong>💻 Local Development</strong>
</div>

---

# Local Development

To run this project locally, you will need a few services running simultaneously because it relies on background jobs (Inngest) and GitHub webhooks.

## Prerequisites
- Node.js (v18+)
- [Bun](https://bun.sh/) package manager
- PostgreSQL database (local or hosted like Supabase)
- [ngrok](https://ngrok.com/) (to receive GitHub webhooks locally)

## 1. Install Dependencies
```bash
bun install
```

## 2. Environment Variables
Copy `.env.example` to `.env` and fill in the required keys:
- `DATABASE_URL` (Your PostgreSQL connection string)
- `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (For authentication)
- `GEMINI_API_KEY` (For AI reviews)
- `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET` (For payments)
- `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET` (For the GitHub App)

## 3. Database Setup
```bash
bunx prisma generate
bunx prisma db push
```

## 4. Running the Application
You will need to open 4 separate terminal windows to run all parts of the application locally:

**Terminal 1: Next.js Server**
```bash
bun run dev
```

**Terminal 2: Background Jobs (Inngest)**
```bash
npx inngest-cli@latest dev
```

**Terminal 3: Database GUI (Optional)**
```bash
bunx prisma studio
```

**Terminal 4: Webhook Tunnel (ngrok)**
```bash
ngrok http 3000
```

*Note: Make sure to update your GitHub App webhook URL and Better Auth trusted origins with your temporary ngrok URL!*
