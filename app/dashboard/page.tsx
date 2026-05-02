"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { GitCommit, GitPullRequest, MessageSquare, GitBranch, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getMonthlyActivity } from "@/module/dashboard/actions";
import ContributionGraph from "@/module/dashboard/components/contribution-graph";

const MainPage = () => {

    const {data:stats, isLoading} = useQuery({
        queryKey:["dashboard-stats"],
        queryFn:async() => await getDashboardStats(),
        refetchOnWindowFocus:false,
    })

    const {data:monthlyActivity, isLoading:isLoadingActivity} = useQuery({
        queryKey:["monthly-activity"],
        queryFn:async() => await getMonthlyActivity(),
        refetchOnWindowFocus:false,
    })


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your coding activity and AI reviews</p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Repositories</CardTitle>
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-2xl font-bold">...</div>
                        ) : (
                            <>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-bold">{stats?.connectedRepos ?? 0}</span>
                                    <span className="text-sm text-muted-foreground">/ {stats?.githubTotalRepos ?? 0} connected</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{
                                            width: stats?.githubTotalRepos
                                                ? `${Math.min(100, ((stats.connectedRepos ?? 0) / stats.githubTotalRepos) * 100)}%`
                                                : "0%"
                                        }}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {stats?.githubTotalRepos ?? 0} total on GitHub
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
                        <GitCommit className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : (stats?.totalCommits || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">In the last year</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
                        <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalPRs || 0}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Reviews</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalReviews || 0}</div>
                        <p className="text-xs text-muted-foreground">Generated reviews</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contribution Activity</CardTitle>
                    <CardDescription>Visualizing your coding frequency over the last year</CardDescription>
                </CardHeader>
                <CardContent>
                    <ContributionGraph/>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Activity Overview</CardTitle>
                        <CardDescription>Monthly breakdown of commits, PRs, and reviews (last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingActivity ? (
                            <div className="h-80 w-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="h-80 w-full">
                                <ResponsiveContainer width={"100%"} height={"100%"}>
                                    <BarChart data={monthlyActivity || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="commits" name="Commits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="prs" name="Pull Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="reviews" name="AI Reviews" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
        </div>
    )
}

export default MainPage;