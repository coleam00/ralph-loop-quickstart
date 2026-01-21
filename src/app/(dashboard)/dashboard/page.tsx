'use client';

import { useEffect, useState, useCallback } from 'react';
import { StatsCards, TodaysHabits, GoalProgress, MotivationalMessage } from '@/components/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HabitWithStatus {
  id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly';
  isCompleted: boolean;
  streak: number;
}

interface Goal {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  targetDate: string | null;
  isCompleted: boolean;
}

interface RecentActivity {
  id: string;
  habitName: string;
  completedAt: string;
}

interface DashboardData {
  stats: {
    activeHabits: number;
    completedToday: number;
    totalDailyHabits: number;
    completedThisWeek: number;
    totalWeeklyHabits: number;
    bestStreak: number;
    activeGoals: number;
  };
  todaysHabits: HabitWithStatus[];
  weeklyHabits: HabitWithStatus[];
  goals: Goal[];
  recentActivity: RecentActivity[];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompletionChange = (habitId: string, isCompleted: boolean) => {
    if (!data) return;

    // Update local state
    setData((prevData) => {
      if (!prevData) return prevData;

      const updateHabit = (habit: HabitWithStatus) =>
        habit.id === habitId ? { ...habit, isCompleted } : habit;

      const newTodaysHabits = prevData.todaysHabits.map(updateHabit);
      const newWeeklyHabits = prevData.weeklyHabits.map(updateHabit);

      // Recalculate stats
      const completedToday = newTodaysHabits.filter((h) => h.isCompleted).length;
      const completedThisWeek = newWeeklyHabits.filter((h) => h.isCompleted).length;

      return {
        ...prevData,
        todaysHabits: newTodaysHabits,
        weeklyHabits: newWeeklyHabits,
        stats: {
          ...prevData.stats,
          completedToday,
          completedThisWeek,
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your habit overview.</p>
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-5 bg-muted rounded animate-pulse w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-5 bg-muted rounded animate-pulse w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your habit overview.</p>
        </div>

        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your habit overview.</p>
      </div>

      {/* Motivational Message */}
      <MotivationalMessage />

      {/* Stats Cards */}
      <StatsCards stats={data.stats} />

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Habits */}
        <TodaysHabits
          habits={data.todaysHabits}
          onCompletionChange={handleCompletionChange}
        />

        {/* Goal Progress */}
        <GoalProgress goals={data.goals} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest habit completions from the past week.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity. Start tracking habits to see your progress.
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm font-medium">{activity.habitName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.completedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
