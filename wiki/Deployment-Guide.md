# Deployment Guide (Production)

Once you are ready to move Reposhield from your local machine to production, follow this guide to ensure a smooth transition to **Vercel** and a production database.

## 1. Database Setup
1. Create a production PostgreSQL project on [Neon.tech](https://neon.tech).
2. Copy the connection string.
3. Run migrations against the production DB:
   ```bash
   DATABASE_URL="your_production_url" bunx prisma db push
   ```

## 2. GitHub OAuth App
1. Go to GitHub Settings -> Developer Settings -> OAuth Apps.
2. Create a **new** OAuth App for production.
3. Set the **Homepage URL** to your production domain (e.g., `https://reposhield.com`).
4. Set the **Authorization callback URL** to `https://reposhield.com/api/auth/callback/github`.

## 3. Vercel Deployment
1. Import your repository into Vercel.
2. Add all environment variables from your local `.env` to the Vercel Dashboard, making sure to replace `localhost` with your production domain.
3. **Important**: Set `INNGEST_DEV=0` in production.

## 4. Inngest Cloud Setup
1. Sign up for [Inngest Cloud](https://www.inngest.com).
2. Create a new application.
3. Connect your Vercel deployment URL.
4. Copy the `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` back into your Vercel environment variables.

## 5. Webhook Update
1. Once your app is live on Vercel, go to your GitHub App/Webhook settings.
2. Update the **Payload URL** to `https://reposhield.com/api/webhooks/github`.
3. GitHub will now send events to your production server instead of your local ngrok tunnel.

## 6. Polar.sh Production
1. Switch your Polar.sh dashboard to "Live" mode.
2. Update your `POLAR_ACCESS_TOKEN` and `POLAR_WEBHOOK_SECRET` in Vercel.
3. Ensure `POLAR_SUCCESS_URL` points to your live domain.
