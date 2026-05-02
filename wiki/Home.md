Welcome to the **Reposhield** Wiki!

## What is Reposhield?
Reposhield is a super-smart robotic senior developer that watches over your team's code. It automatically reviews Pull Requests, catches bugs, and gives you a dashboard to track everyone's performance and subscriptions.

Instead of waiting for a human to review your PR, Reposhield uses an intelligent AI engine (Google Gemini) combined with a Retrieval-Augmented Generation (RAG) pipeline to instantly provide comprehensive, structured feedback on your code changes by understanding the broader repository architecture.

## Key Features
- **Automated PR Reviews**: Never merge a critical bug again. Reposhield automatically posts structured reviews on your GitHub Pull Requests.
- **Context-Aware AI (RAG)**: By chunking and embedding your entire repository into a Vector Database, the AI "remembers" your codebase and provides deep, architectural feedback.
- **Developer Insights & Gamification**: A rich dashboard visualizes your team's review activity, tracks trends, and awards dynamic badges for catching critical issues (e.g., "Production Hazard Prevented").
- **Background Processing**: Heavy AI tasks are offloaded to Inngest background workers, ensuring the web application remains blazing fast.
- **Subscription Management**: Built-in tiered pricing (Free vs Pro) powered by Polar.sh, allowing you to seamlessly upgrade for unlimited repository reviews.

## Wiki Navigation
Use the sidebar on the right to navigate through the documentation:
1. **[Architecture](Architecture)** - Understand how the tech stack and data flow work.
2. **[Installation](Installation)** - Step-by-step guide to running Reposhield locally.
3. **[Usage Guide](Usage)** - Learn how to link repositories and trigger AI reviews.
4. **[Module Breakdown](Modules)** - A tour of the codebase structure.
5. **[API & Commands](API)** - Internal API routes, webhooks, and background events.
6. **[Contributing](Contributing)** - How to help build and improve Reposhield.
7. **[FAQ & Troubleshooting](FAQ)** - Common errors and how to fix them.
8. **[Team & Credits](Team)** - Meet the people behind the project.
9. **[Technical Execution Flow](Technical_Documentation)** - Deep dive into how functions interact.
10. **[Security Policy](Security-Policy)** - How we protect your code and data.
11. **[Environment Variables](Environment-Variables)** - Full reference for your `.env` file.
12. **[Database Schema](Database-Schema)** - Detailed breakdown of Prisma models and relations.
13. **[Deployment Guide](Deployment-Guide)** - Moving Reposhield to production (Vercel).
14. **[Subscription Logic](Subscription-Logic)** - How Free/Pro quotas are enforced.
