'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  targetDate: string | null;
  isCompleted: boolean;
}

interface GoalProgressProps {
  goals: Goal[];
}

const categoryColors: Record<string, string> = {
  health: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  productivity: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  learning: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  fitness: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  mindfulness: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  finance: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  relationships: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  career: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function GoalProgress({ goals }: GoalProgressProps) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Track your progress toward your goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/50 mb-3"
            >
              <path d="M12 13V2l8 4-8 4" />
              <path d="M20.55 10.23A9 9 0 1 1 8 4.94" />
              <path d="M8 10a5 5 0 1 0 8.9 2.02" />
            </svg>
            <p className="text-sm text-muted-foreground mb-3">
              No active goals. Set goals to stay motivated and focused.
            </p>
            <Button asChild size="sm">
              <Link href="/goals">Add Goal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show only first 3 goals
  const displayGoals = goals.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>
              {goals.length} active goal{goals.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          {goals.length > 3 && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/goals">View all</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayGoals.map((goal) => {
            const daysRemaining = goal.targetDate ? getDaysRemaining(goal.targetDate) : null;
            const isOverdue = daysRemaining !== null && daysRemaining < 0;

            return (
              <div
                key={goal.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{goal.name}</p>
                    {goal.category && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          categoryColors[goal.category.toLowerCase()] || 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {goal.category}
                      </span>
                    )}
                  </div>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground truncate">{goal.description}</p>
                  )}
                </div>
                {goal.targetDate && (
                  <div className="flex flex-col items-end ml-3">
                    <span className="text-xs text-muted-foreground">{formatDate(goal.targetDate)}</span>
                    <span
                      className={`text-xs font-medium ${
                        isOverdue
                          ? 'text-red-600 dark:text-red-400'
                          : daysRemaining !== null && daysRemaining <= 7
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {isOverdue
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : daysRemaining === 0
                          ? 'Due today'
                          : daysRemaining === 1
                            ? '1 day left'
                            : `${daysRemaining} days left`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
