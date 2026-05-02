"use client"

import { useQuery } from "@tanstack/react-query"
import { getDeveloperInsights } from "@/module/dashboard/actions/insights"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, TrendingDown, Minus, Star, AlertTriangle, ShieldCheck, Zap } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const BADGE_COLOR_MAP: Record<string, string> = {
  red: "border-l-4 border-l-red-400 bg-red-500/5 text-foreground",
  orange: "border-l-4 border-l-orange-400 bg-orange-500/5 text-foreground",
  yellow: "border-l-4 border-l-yellow-400 bg-yellow-500/5 text-foreground",
  blue: "border-l-4 border-l-blue-400 bg-blue-500/5 text-foreground",
  green: "border-l-4 border-l-green-400 bg-green-500/5 text-foreground",
}

export default function InsightsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["developer-insights"],
    queryFn: getDeveloperInsights,
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Developer Insights</h1>
        <p className="text-muted-foreground text-red-500">Failed to load insights. Please try again.</p>
      </div>
    )
  }

  const trendIcon =
    data.trendDirection === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : data.trendPercent === 0 ? (
      <Minus className="h-4 w-4 text-muted-foreground" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )

  const trendColor =
    data.trendDirection === "up"
      ? "text-green-600"
      : data.trendPercent === 0
      ? "text-muted-foreground"
      : "text-red-500"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Insights</h1>
        <p className="text-muted-foreground">
          Track your review activity, code quality trends, and earned badges
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Today</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayReviews}</div>
            <p className="text-xs text-muted-foreground">
              {data.yesterdayReviews} yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.thisWeekReviewCount}</div>
            <p className="text-xs text-muted-foreground">
              vs {data.lastWeekReviewCount} last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Trend</CardTitle>
            {trendIcon}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trendColor}`}>
              {data.trendPercent > 0 ? "+" : ""}
              {data.trendPercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.trendDirection === "up" ? "Increasing activity" : data.trendPercent === 0 ? "Stable activity" : "Decreasing activity"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReviews}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Review Activity — Last 7 Days</CardTitle>
          <CardDescription>Daily breakdown of AI reviews generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="reviews"
                  name="Reviews"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Earned Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Earned Badges</CardTitle>
            <CardDescription>
              Based on what RepoShield caught in your recent reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.earnedBadges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No reviews yet — badges will appear after your first review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${BADGE_COLOR_MAP[badge.color] ?? ""}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{badge.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Review Highlights</CardTitle>
            <CardDescription>What RepoShield caught in your last reviews</CardDescription>
          </CardHeader>
          <CardContent>
            {data.reviewsWithBadges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent completed reviews to analyze</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.reviewsWithBadges.map((item, idx) => (
                  <div key={idx} className="border-b pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium truncate mb-1" title={item.prTitle}>
                      {item.prTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.badges.map((badge) => (
                        <Badge
                          key={badge.id}
                          variant="outline"
                          className={`text-xs font-medium ${BADGE_COLOR_MAP[badge.color] ?? ""}`}
                        >
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
