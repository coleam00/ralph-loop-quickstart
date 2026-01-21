'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

interface HabitWithStatus {
  id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly';
  isCompleted: boolean;
  streak: number;
}

interface TodaysHabitsProps {
  habits: HabitWithStatus[];
  onCompletionChange: (habitId: string, isCompleted: boolean) => void;
}

export function TodaysHabits({ habits, onCompletionChange }: TodaysHabitsProps) {
  const [completing, setCompleting] = useState<string | null>(null);

  const handleToggleCompletion = async (habit: HabitWithStatus) => {
    if (completing) return;

    setCompleting(habit.id);

    try {
      if (habit.isCompleted) {
        const response = await fetch(`/api/habits/${habit.id}/completions`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to uncomplete habit');
        }

        onCompletionChange(habit.id, false);
        toast.success('Habit marked as incomplete');
      } else {
        const response = await fetch(`/api/habits/${habit.id}/completions`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          if (data.error === 'Habit already completed for this period') {
            toast.info('Habit already completed for this period');
            return;
          }
          throw new Error(data.error || 'Failed to complete habit');
        }

        onCompletionChange(habit.id, true);
        toast.success('Habit completed!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setCompleting(null);
    }
  };

  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Habits</CardTitle>
          <CardDescription>Your daily habits to complete today.</CardDescription>
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-sm text-muted-foreground mb-3">
              No daily habits yet. Create your first habit to start tracking.
            </p>
            <Button asChild size="sm">
              <Link href="/habits">Add Habit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = habits.filter((h) => h.isCompleted).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Today&apos;s Habits</CardTitle>
            <CardDescription>
              {completedCount} of {habits.length} completed
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {Math.round((completedCount / habits.length) * 100)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                habit.isCompleted
                  ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleCompletion(habit)}
                  disabled={completing === habit.id}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    habit.isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-muted-foreground/50 hover:border-green-500'
                  } ${completing === habit.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={habit.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {habit.isCompleted && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <div>
                  <p className={`font-medium ${habit.isCompleted ? 'text-green-700 dark:text-green-400 line-through' : ''}`}>
                    {habit.name}
                  </p>
                  {habit.streak > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-orange-500"
                      >
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                      {habit.streak} day streak
                    </p>
                  )}
                </div>
              </div>
              {habit.isCompleted && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Done</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
