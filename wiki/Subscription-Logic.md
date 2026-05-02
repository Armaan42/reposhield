# Subscription Logic & Quotas

Reposhield uses a tiered subscription model to manage resource consumption (especially AI costs). This page explains how the code enforces these limits.

## Tier Definitions

### 🆓 FREE Tier (Default)
- **Repositories**: Maximum 5 connected repositories.
- **Reviews**: Maximum 5 AI reviews per repository.
- **Support**: Community support only.

### 🚀 PRO Tier
- **Repositories**: Unlimited.
- **Reviews**: Unlimited.
- **AI Model**: Access to larger context windows and higher-priority processing.

---

## Technical Enforcement

### `canConnectRepository(userId)`
This function is called before a user adds a new repo.
- If user is `PRO` -> Returns `true`.
- If user is `FREE` -> Checks `UserUsage.repositoryCount`. Returns `true` only if count < 5.

### `canCreateReview(userId, repositoryId)`
This is called by the Webhook handler before a review is queued.
- If user is `PRO` -> Returns `true`.
- If user is `FREE` -> Checks `UserUsage.reviewCounts[repositoryId]`. Returns `true` only if count < 5.

## State Synchronization
When a user upgrades via Polar.sh, the platform uses two mechanisms to sync their tier:
1. **Webhook (Passive)**: Polar sends a `subscription.created` event to our API, which updates the `subscriptionTier` to `"PRO"` in Prisma.
2. **Manual Sync (Active)**: If the webhook is delayed, the user can click "Sync Status" on the dashboard, which triggers `syncSubscriptionStatus()`. This function calls the Polar API directly to verify the active subscription.

## Downgrades
If a subscription expires or is cancelled, the `subscriptionStatus` is updated to `"EXPIRED"` or `"CANCELLED"`. The `updateUserTier()` function will then automatically set the `subscriptionTier` back to `"FREE"`. Existing repositories and reviews are preserved, but the user will be unable to add new ones until they are under the Free limits.
