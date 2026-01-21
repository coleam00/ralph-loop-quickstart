'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardStats {
  activeHabits: number;
  completedToday: number;
  totalDailyHabits: number;
  completedThisWeek: number;
  totalWeeklyHabits: number;
  bestStreak: number;
  activeGoals: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
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
            className="text-muted-foreground"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeHabits}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeHabits === 0 ? 'Start adding habits to track' : 'habits being tracked'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
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
            className="text-muted-foreground"
          >
            <path d="M12 2v4" />
            <path d="m16.24 7.76 2.83-2.83" />
            <path d="M22 12h-4" />
            <path d="m16.24 16.24 2.83 2.83" />
            <path d="M12 22v-4" />
            <path d="m4.93 19.07 2.83-2.83" />
            <path d="M2 12h4" />
            <path d="m4.93 4.93 2.83 2.83" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.completedToday}/{stats.totalDailyHabits}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalDailyHabits === 0
              ? 'No daily habits yet'
              : stats.completedToday === stats.totalDailyHabits
                ? 'All daily habits done!'
                : `${stats.totalDailyHabits - stats.completedToday} remaining`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
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
            className={stats.bestStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.bestStreak} days</div>
          <p className="text-xs text-muted-foreground">
            {stats.bestStreak === 0 ? 'Build your first streak' : 'keep it going!'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
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
            className="text-muted-foreground"
          >
            <path d="M12 13V2l8 4-8 4" />
            <path d="M20.55 10.23A9 9 0 1 1 8 4.94" />
            <path d="M8 10a5 5 0 1 0 8.9 2.02" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeGoals}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeGoals === 0 ? 'Set goals to stay focused' : 'goals in progress'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
