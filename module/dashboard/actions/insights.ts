"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";

// Badge definitions based on review content keywords
const BADGE_RULES = [
  {
    id: "production_hazard",
    label: "Production Hazard Prevented",
    description: "Your review caught a critical bug that could have broken production",
    color: "red",
    keywords: ["critical", "breaking change", "production", "crash", "fatal", "null pointer", "undefined", "unhandled exception", "memory leak"],
  },
  {
    id: "security_guardian",
    label: "Security Breach Avoided",
    description: "A serious security vulnerability was caught before it reached main",
    color: "orange",
    keywords: ["sql injection", "xss", "csrf", "authentication", "authorization", "secret", "token", "password", "vulnerability", "security", "injection"],
  },
  {
    id: "data_loss_prevented",
    label: "Data Loss Prevented",
    description: "Review flagged code that could have caused irreversible data loss",
    color: "yellow",
    keywords: ["data loss", "delete", "truncate", "drop table", "irreversible", "permanent", "cascade delete", "overwrite"],
  },
  {
    id: "performance_saver",
    label: "Performance Issue Caught",
    description: "A serious performance degradation was identified and fixed",
    color: "blue",
    keywords: ["n+1", "performance", "slow query", "inefficient", "memory usage", "cpu", "bottleneck", "timeout", "latency"],
  },
  {
    id: "clean_code",
    label: "Clean Code Champion",
    description: "Your code passed review with no critical issues",
    color: "green",
    keywords: [],
    isPositive: true,
  },
];

function analyzeReviewForBadges(reviewText: string): typeof BADGE_RULES {
  const lower = reviewText.toLowerCase();
  const earned: typeof BADGE_RULES = [];

  let hasCritical = false;

  for (const badge of BADGE_RULES) {
    if (badge.isPositive) continue;
    if (badge.keywords.some((kw) => lower.includes(kw))) {
      earned.push(badge);
      hasCritical = true;
    }
  }

  // Award clean badge only if no critical issues found
  if (!hasCritical) {
    const cleanBadge = BADGE_RULES.find((b) => b.id === "clean_code");
    if (cleanBadge) earned.push(cleanBadge);
  }

  return earned;
}

export async function getDeveloperInsights() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const now = new Date();

    // --- Today's reviews ---
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayReviews = await prisma.review.count({
      where: {
        repository: { userId },
        createdAt: { gte: todayStart },
      },
    });

    // --- Yesterday's reviews ---
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayReviews = await prisma.review.count({
      where: {
        repository: { userId },
        createdAt: { gte: yesterdayStart, lt: todayStart },
      },
    });

    // --- Last 7 days daily breakdown ---
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const last7DaysReviews = await prisma.review.findMany({
      where: {
        repository: { userId },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, review: true, prTitle: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    // Build daily chart data
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyMap: Record<string, { day: string; date: string; reviews: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = {
        day: dayLabels[d.getUTCDay()],
        date: key,
        reviews: 0,
      };
    }

    last7DaysReviews.forEach((r) => {
      const key = r.createdAt.toISOString().split("T")[0];
      if (dailyMap[key]) {
        dailyMap[key].reviews += 1;
      }
    });

    const dailyData = Object.values(dailyMap);

    // --- Trend: compare this week vs last week ---
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setUTCHours(0, 0, 0, 0);

    const lastWeekReviewCount = await prisma.review.count({
      where: {
        repository: { userId },
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      },
    });

    const thisWeekReviewCount = last7DaysReviews.length;
    const trendPercent =
      lastWeekReviewCount === 0
        ? thisWeekReviewCount > 0
          ? 100
          : 0
        : Math.round(((thisWeekReviewCount - lastWeekReviewCount) / lastWeekReviewCount) * 100);

    // --- Badges: analyze recent reviews ---
    const recentReviews = await prisma.review.findMany({
      where: {
        repository: { userId },
        createdAt: { gte: sevenDaysAgo },
        status: "completed",
      },
      select: { review: true, prTitle: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Collect unique badge IDs earned across recent reviews
    const earnedBadgeIds = new Set<string>();
    const reviewsWithBadges: {
      prTitle: string;
      badges: typeof BADGE_RULES;
      createdAt: Date;
    }[] = [];

    for (const rev of recentReviews) {
      const badges = analyzeReviewForBadges(rev.review);
      badges.forEach((b) => earnedBadgeIds.add(b.id));
      if (badges.length > 0) {
        reviewsWithBadges.push({
          prTitle: rev.prTitle,
          badges,
          createdAt: rev.createdAt,
        });
      }
    }

    const earnedBadges = BADGE_RULES.filter((b) => earnedBadgeIds.has(b.id));

    // --- Total reviews all time ---
    const totalReviews = await prisma.review.count({
      where: { repository: { userId } },
    });

    return {
      todayReviews,
      yesterdayReviews,
      thisWeekReviewCount,
      lastWeekReviewCount,
      trendPercent,
      trendDirection: trendPercent >= 0 ? "up" : "down",
      dailyData,
      earnedBadges,
      reviewsWithBadges: reviewsWithBadges.slice(0, 5),
      totalReviews,
    };
  } catch (error) {
    console.error("Error fetching developer insights:", error);
    return null;
  }
}
