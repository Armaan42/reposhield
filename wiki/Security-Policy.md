# Security Policy

At Reposhield, we take the security of your codebase and your data extremely seriously. Since our platform interacts with your private repositories, we follow industry best practices to ensure your code never falls into the wrong hands.

## Data Storage & Encryption
- **GitHub Access Tokens**: All OAuth access tokens are stored in our PostgreSQL database using encryption. These tokens are only used to fetch Pull Request diffs and post review comments.
- **Repository Data**: We do **not** store your full repository code in our database. We only store metadata (IDs, names) and temporary chunks of code for indexing in our Vector Database.
- **Vector Data**: The embeddings stored in Pinecone are mathematical representations of your code and cannot be reconstructed back into the original source code by an attacker.

## Reporting a Vulnerability
If you discover a security vulnerability within Reposhield, please do **not** open a public GitHub issue. Instead, follow these steps:
1. Email the team lead (Armaan) directly with the details of the vulnerability.
2. Provide a clear description and steps to reproduce the issue.
3. We will acknowledge your report within 24 hours and provide a timeline for the fix.

## Our Security Measures
- **Strict Data Isolation**: Every database query is scoped to the `userId` to ensure no user can ever see another user's repository data or review history.
- **Environment Safety**: Sensitive keys (AI API keys, Database URLs) are never committed to version control and are managed strictly via environment variables.
- **Dependency Auditing**: We regularly audit our `package.json` for vulnerable dependencies using `bun audit`.

---
*Last updated: May 2026*
